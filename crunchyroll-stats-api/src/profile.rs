use anyhow::Result;
use crate::auth::CrunchyrollClient;
use crate::models::Profile as ProfileModel;

pub struct Profile<'a> {
    client: &'a CrunchyrollClient,
}

impl<'a> Profile<'a> {
    pub fn new(client: &'a CrunchyrollClient) -> Self {
        Self { client }
    }

    pub async fn fetch_profile(&self) -> Result<ProfileModel> {
        let profiles = self.client.client.profiles().await?;
        let active = profiles
            .profiles
            .into_iter()
            .find(|p| p.is_selected)
            .ok_or_else(|| anyhow::anyhow!("No active profile found"))?;

        log::info!("Active profile found: username={}, profile_name={}", active.username, active.profile_name);
        log::info!("Avatar value from Crunchyroll API: '{}'", active.avatar);
        log::info!("Avatar length: {}", active.avatar.len());
        log::info!("Avatar is empty: {}", active.avatar.is_empty());

        Ok(ProfileModel {
            profile_id: active.profile_id,
            username: active.username,
            profile_name: active.profile_name,
            avatar: active.avatar,
            maturity_rating: active.maturity_rating.to_string(),
            is_primary: active.is_primary,
        })
    }
}
