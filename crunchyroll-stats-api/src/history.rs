use anyhow::Result;
use futures_util::StreamExt;
use crate::{
    auth::CrunchyrollClient,
    models::HistoryEntry,
};

pub struct History<'a> {
    client: &'a CrunchyrollClient,
}

impl<'a> History<'a> {
    pub fn new(client: &'a CrunchyrollClient) -> Self {
        Self { client }
    }

    pub async fn fetch_history(&self, limit: Option<usize>) -> Result<Vec<HistoryEntry>> {
        let mut history = Vec::new();
        let mut pagination = self.client.client.watch_history();

        if let Some(limit) = limit {
            pagination.page_size(limit as u32);
        }

        let mut index = 0usize;
        while let Some(entry) = pagination.next().await {
            let entry = entry?;

            let history_entry = match entry.panel {
                Some(crunchyroll_rs::MediaCollection::Episode(episode)) => {
                    let duration_ms = episode.duration.num_milliseconds() as u64;
                    let playhead_ms = (entry.playhead as u64) * 1000;

                    let thumbnail = episode.images
                        .iter()
                        .max_by_key(|img| img.width)
                        .map(|img| img.source.clone());

                    HistoryEntry {
                        id: format!("item-{}", index),
                        title: episode.series_title,
                        episode_title: Some(episode.title),
                        watched_at: Some(entry.date_played.to_rfc3339()),
                        progress_ms: Some(playhead_ms),
                        duration_ms: Some(duration_ms),
                        thumbnail,
                    }
                },
                Some(crunchyroll_rs::MediaCollection::Movie(movie)) => {
                    let duration_ms = movie.duration.num_milliseconds() as u64;
                    let playhead_ms = (entry.playhead as u64) * 1000;

                    let thumbnail = movie.images.thumbnail
                        .iter()
                        .max_by_key(|img| img.width)
                        .map(|img| img.source.clone());

                    HistoryEntry {
                        id: format!("item-{}", index),
                        title: movie.title,
                        episode_title: None,
                        watched_at: Some(entry.date_played.to_rfc3339()),
                        progress_ms: Some(playhead_ms),
                        duration_ms: Some(duration_ms),
                        thumbnail,
                    }
                },
                _ => continue,
            };

            history.push(history_entry);
            index += 1;
        }

        Ok(history)
    }
}
