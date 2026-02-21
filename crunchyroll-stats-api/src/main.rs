mod auth;
mod history;
mod models;
mod profile;

use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpResponse, HttpServer, Result};
use log::info;
use std::env;

use auth::CrunchyrollClient;
use models::{ErrorResponse, HealthResponse, HistoryResponse, LoginRequest};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let bind_address = format!("{}:{}", host, port);

    info!("Starting Crunchyroll API Server on {}", bind_address);

    HttpServer::new(|| {
        let cors = Cors::permissive();

        App::new()
            .wrap(Logger::default())
            .wrap(cors)
            .route("/health", web::get().to(health_check))
            .route("/api/watch-history", web::post().to(get_watch_history))
            .route("/api/profile", web::post().to(get_profile))
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

async fn get_watch_history(req: web::Json<LoginRequest>) -> Result<HttpResponse> {
    info!("Watch history request for user: {}", req.email);

    let limit = Some(100);

    match fetch_watch_history(&req.email, &req.password, limit).await {
        Ok(data) => {
            let total = data.len();
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

async fn get_profile(req: web::Json<LoginRequest>) -> Result<HttpResponse> {
    info!("Profile request for user: {}", req.email);

    match fetch_profile(&req.email, &req.password).await {
        Ok(profile) => {
            info!(
                "Profile fetched successfully: profile_name='{}', avatar='{}'",
                profile.profile_name, profile.avatar
            );
            Ok(HttpResponse::Ok().json(profile))
        }
        Err(e) => {
            log::error!("Failed to fetch profile: {}", e);
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

async fn fetch_profile(email: &str, password: &str) -> anyhow::Result<models::Profile> {
    let client = CrunchyrollClient::new(email, password).await?;
    let prof = profile::Profile::new(&client);
    prof.fetch_profile().await
}
