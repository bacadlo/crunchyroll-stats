pub mod account;
pub mod history;
pub mod profile;

pub use account::AccountOwner;
pub use history::{HistoryEntry, HistoryResponse};
pub use profile::Profile;

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
}
