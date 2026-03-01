pub mod history;

pub use history::{HistoryEntry, HistoryResponse, Image};

use serde::{Deserialize, Serialize};
use validator::Validate;
use zeroize::{Zeroize, ZeroizeOnDrop};

#[derive(Deserialize, Validate, Zeroize, ZeroizeOnDrop)]
pub struct LoginRequest {
    #[validate(email, length(max = 254))]
    pub email: String,
    #[validate(length(min = 1, max = 128))]
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
