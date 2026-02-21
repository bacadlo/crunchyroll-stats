use crate::auth::CrunchyrollClient;
use crate::models::Profile as ProfileModel;
use anyhow::Result;

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

        Ok(ProfileModel {
            profile_name: active.profile_name,
            avatar: active.avatar,
        })
    }
}
