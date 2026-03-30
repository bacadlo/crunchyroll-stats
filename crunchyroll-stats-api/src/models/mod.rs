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
    #[serde(default)]
    pub force_refresh: bool,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub success: bool,
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

#[cfg(test)]
mod tests {
    use super::*;
    use validator::Validate;

    #[test]
    fn valid_credentials_pass() {
        let req = LoginRequest {
            email: "user@example.com".to_string(),
            password: "password123".to_string(),
            force_refresh: false,
        };
        assert!(req.validate().is_ok());
    }

    #[test]
    fn invalid_email_fails() {
        let req = LoginRequest {
            email: "not-an-email".to_string(),
            password: "password123".to_string(),
            force_refresh: false,
        };
        assert!(req.validate().is_err());
    }

    #[test]
    fn empty_password_fails() {
        let req = LoginRequest {
            email: "user@example.com".to_string(),
            password: "".to_string(),
            force_refresh: false,
        };
        assert!(req.validate().is_err());
    }

    #[test]
    fn password_too_long_fails() {
        let req = LoginRequest {
            email: "user@example.com".to_string(),
            password: "a".repeat(129),
            force_refresh: false,
        };
        assert!(req.validate().is_err());
    }

    #[test]
    fn email_too_long_fails() {
        // local part padded to push total over 254 chars
        let local = "a".repeat(244);
        let req = LoginRequest {
            email: format!("{}@x.com", local),
            password: "password123".to_string(),
            force_refresh: false,
        };
        assert!(req.validate().is_err());
    }
}
