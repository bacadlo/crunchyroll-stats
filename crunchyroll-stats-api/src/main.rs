mod auth;
mod cache;
mod history;
mod models;
mod rate_limit;

use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpRequest, HttpResponse, HttpServer, Result};
use log::info;
use std::env;
use std::net::IpAddr;
use auth::CrunchyrollClient;
use cache::AppCache;
use models::{ErrorResponse, HealthResponse, HistoryResponse, LoginRequest};
use rate_limit::RateLimiter;
use validator::Validate;
use zeroize::Zeroize;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let bind_address = format!("{}:{}", host, port);

    let cache = AppCache::new();
    let rate_limiter = RateLimiter::new();

    info!("Starting Crunchyroll API Server on {}", bind_address);

    HttpServer::new(move || {
        let cors = Cors::permissive();

        App::new()
            .wrap(Logger::new("%a \"%r\" %s %b %T").exclude("/api/watch-history"))
            .wrap(cors)
            .app_data(
                web::JsonConfig::default()
                    .limit(4096)
                    .error_handler(|err, _req| {
                        log::warn!("JSON parse error: {}", err);
                        actix_web::error::InternalError::from_response(
                            err,
                            HttpResponse::BadRequest().json(ErrorResponse {
                                error: "Invalid request body".to_string(),
                            }),
                        )
                        .into()
                    }),
            )
            .app_data(web::Data::from(cache.clone()))
            .app_data(web::Data::from(rate_limiter.clone()))
            .route("/health", web::get().to(health_check))
            .route("/api/watch-history", web::post().to(get_watch_history))
    })
    .bind(&bind_address)?
    .run()
    .await
}

async fn health_check() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    }))
}

fn peer_ip(req: &HttpRequest) -> IpAddr {
    req.peer_addr()
        .map(|addr| addr.ip())
        .unwrap_or(IpAddr::V4(std::net::Ipv4Addr::UNSPECIFIED))
}

async fn get_watch_history(
    http_req: HttpRequest,
    req: web::Json<LoginRequest>,
    cache: web::Data<AppCache>,
    limiter: web::Data<RateLimiter>,
) -> Result<HttpResponse> {
    let ip = peer_ip(&http_req);

    if limiter.is_blocked(ip).await {
        return Ok(HttpResponse::TooManyRequests().json(ErrorResponse {
            error: "Too many failed attempts. Try again later.".to_string(),
        }));
    }

    // Extract credentials and drop the request wrapper immediately.
    let mut login = req.into_inner();

    if let Err(e) = login.validate() {
        log::warn!("Input validation failed: {}", e);
        login.zeroize();
        return Ok(HttpResponse::BadRequest().json(ErrorResponse {
            error: "Invalid request".to_string(),
        }));
    }

    let cache_key = AppCache::cache_key(&login.email);

    // Check cache first
    if let Some(cached) = cache.get_history(&cache_key).await {
        info!("Returning cached watch history ({} items)", cached.len());
        // login is dropped here — ZeroizeOnDrop clears email/password
        return Ok(HttpResponse::Ok().json(HistoryResponse { data: cached }));
    }

    info!("Fetching watch history from Crunchyroll API");
    let limit = Some(100);

    // Authenticate and fetch, then zero out credentials before processing result.
    let result = fetch_watch_history(&login.email, &login.password, limit).await;
    login.zeroize();

    match result {
        Ok(data) => {
            limiter.record_success(ip).await;
            cache.set_history(cache_key, data.clone()).await;
            Ok(HttpResponse::Ok().json(HistoryResponse { data }))
        }
        Err(e) => {
            log::error!("Failed to fetch watch history: {}", e);
            limiter.record_failure(ip).await;
            Ok(HttpResponse::InternalServerError().json(ErrorResponse {
                error: "Failed to fetch watch history".to_string(),
            }))
        }
    }
}

async fn fetch_watch_history(
    email: &str,
    password: &str,
    limit: Option<usize>,
) -> anyhow::Result<Vec<models::HistoryEntry>> {
    let client = CrunchyrollClient::new(email, password).await?;
    let history = history::History::new(&client);
    let items = history.fetch_history(limit).await?;
    info!("Retrieved {} history items", items.len());
    Ok(items)
}
