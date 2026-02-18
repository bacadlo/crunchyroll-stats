use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountOwner {
    pub account_id: String,
    pub email: String,
    pub created_at: DateTime<Utc>,
    pub premium: bool,
}
