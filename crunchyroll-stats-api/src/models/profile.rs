use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub profile_id: String,
    pub username: String,
    pub profile_name: String,
    pub avatar: String,
    pub maturity_rating: String,
    pub is_primary: bool,
}
