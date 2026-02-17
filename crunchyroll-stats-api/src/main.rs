mod auth;
mod history;
mod models;

use actix_web::{
    middleware::Logger,
    web::{self, Data},
    App, HttpResponse, HttpServer, Result,
};
use actix_cors::Cors;
use models::{ErrorResponse, HealthResponse, LoginRequest, WatchHistoryResponse, WatchHistoryItem};
use log::info;
use std::env;
use auth::CrunchyrollClient;
use history::History;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    
    dotenv::dotenv().ok();
    
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let bind_address = format!("{}:{}", host, port);

    info!("🚀 Starting Crunchyroll API Server on {}", bind_address);

    HttpServer::new(|| {
    
        let cors = Cors::permissive();

        App::new()
            .wrap(Logger::default())
            .wrap(cors)
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

async fn get_watch_history(req: web::Json<LoginRequest>) -> Result<HttpResponse> {
    info!("Watch history request for user: {}", req.email);

    
    let limit = Some(100);

    match fetch_watch_history_internal(&req.email, &req.password, limit).await {
        Ok(data) => {
            let total = data.len();
            Ok(HttpResponse::Ok().json(WatchHistoryResponse { data, total }))
        }
        Err(e) => {
            log::error!("Failed to fetch watch history: {}", e);
            Ok(HttpResponse::BadRequest().json(ErrorResponse {
                error: e.to_string(),
            }))
        }
    }
}

async fn fetch_watch_history_internal(
    email: &str,
    password: &str,
    limit: Option<usize>,
) -> anyhow::Result<Vec<WatchHistoryItem>> {
    
    let client = CrunchyrollClient::new(email, password).await?;
    let history = History::new(&client);
    let items = history.fetch_history(limit).await?;

    info!("Retrieved {} history items", items.len());

   
    let api_items: Vec<WatchHistoryItem> = items
        .into_iter()
        .enumerate()
        .map(|(index, item)| {
            let completion_percent = item.progress.round() as u32;
            
            WatchHistoryItem {
                id: format!("item-{}", index),
                anime_title: item.title,
                episode_number: "".to_string(), // Extract if available
                episode_name: item.episode_title.unwrap_or_else(|| "Unknown".to_string()),
                date_watched: item.date_watched.to_rfc3339(),
                completion_percent: completion_percent.min(100),
                duration: 1440, // Default 24 minutes
                thumbnail: item.thumbnail,
            }
        })
        .collect();

    info!("Processed {} watch history items", api_items.len());
    Ok(api_items)
}