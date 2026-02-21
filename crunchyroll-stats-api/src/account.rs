use crate::auth::CrunchyrollClient;
use crate::models::AccountOwner;
use anyhow::Result;

pub struct Account<'a> {
    client: &'a CrunchyrollClient,
}

impl<'a> Account<'a> {
    pub fn new(client: &'a CrunchyrollClient) -> Self {
        Self { client }
    }

    pub async fn fetch_account(&self) -> Result<AccountOwner> {
        let account = self.client.client.account().await?;
        let premium = self.client.client.premium().await;

        Ok(AccountOwner {
            account_id: account.account_id,
            email: account.email,
            created_at: account.created,
            premium,
        })
    }
}
