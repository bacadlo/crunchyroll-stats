use anyhow::Result;
use crunchyroll_rs::crunchyroll::DeviceIdentifier;
use crunchyroll_rs::Crunchyroll;

pub struct CrunchyrollClient {
    pub client: Crunchyroll,
}

impl CrunchyrollClient {
    pub async fn new(email: &str, password: &str) -> Result<Self> {
        let client = Crunchyroll::builder()
            .login_with_credentials(email, password, DeviceIdentifier::default())
            .await?;
        Ok(Self { client })
    }
}
