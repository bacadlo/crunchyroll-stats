mod auth;
mod cache;
mod history;
mod models;

use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpResponse, HttpServer, Result};
use log::info;
use std::env;
use auth::CrunchyrollClient;
use cache::AppCache;
use models::{ErrorResponse, HealthResponse, HistoryResponse, LoginRequest};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let bind_address = format!("{}:{}", host, port);

    let cache = AppCache::new();

    info!("Starting Crunchyroll API Server on {}", bind_address);

    HttpServer::new(move || {
        let cors = Cors::permissive();

        App::new()
            .wrap(Logger::default())
            .wrap(cors)
            .app_data(web::Data::from(cache.clone()))
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

async fn get_watch_history(
    req: web::Json<LoginRequest>,
    cache: web::Data<AppCache>,
) -> Result<HttpResponse> {
    info!("Watch history request for user: {}", req.email);

    let cache_key = AppCache::cache_key(&req.email);

    // Check cache first
    if let Some(cached) = cache.get_history(&cache_key).await {
        info!("Returning cached watch history ({} items)", cached.len());
        let total = cached.len();
        return Ok(HttpResponse::Ok().json(HistoryResponse { data: cached, total }));
    }

    let limit = Some(100);

    match fetch_watch_history(&req.email, &req.password, limit).await {
        Ok(data) => {
            let total = data.len();
            cache.set_history(cache_key, data.clone()).await;
            Ok(HttpResponse::Ok().json(HistoryResponse { data, total }))
        }
        Err(e) => {
            log::error!("Failed to fetch watch history: {}", e);
            Ok(HttpResponse::BadRequest().json(ErrorResponse {
                error: e.to_string(),
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

