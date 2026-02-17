use anyhow::Result;
use futures_util::StreamExt;
use crate::{
    auth::CrunchyrollClient,
    models::WatchedItem,
};

pub struct History<'a> {
    client: &'a CrunchyrollClient,
}

impl<'a> History<'a> {
    pub fn new(client: &'a CrunchyrollClient) -> Self {
        Self { client }
    }

    pub async fn fetch_history(&self, limit: Option<usize>) -> Result<Vec<WatchedItem>> {
        let mut history = Vec::new();
        let mut pagination = self.client.client.watch_history();

        if let Some(limit) = limit {
            pagination.page_size(limit as u32);
        }

        while let Some(entry) = pagination.next().await {
            let entry = entry?;
            
            let watched_item = match entry.panel {
                crunchyroll_rs::MediaCollection::Episode(episode) => {
                    let duration_secs = episode.duration.num_seconds() as f64;
                    let playhead_secs = entry.playhead as f64;

                    let progress = if duration_secs > 0.0 {
                        (playhead_secs / duration_secs) * 100.0
                    } else {
                        0.0
                    };

                    
                    let thumbnail = episode.images
                        .iter()
                        .max_by_key(|img| img.width)
                        .map(|img| img.source.clone());

                    WatchedItem {
                        title: episode.series_title,
                        episode_title: Some(episode.title),
                        date_watched: entry.date_played,
                        progress,
                        fully_watched: entry.fully_watched,
                        thumbnail,
                    }
                },
                crunchyroll_rs::MediaCollection::Movie(movie) => {
                    // Convert duration to seconds before calculation
                    let duration_secs = movie.duration.num_seconds() as f64;
                    let playhead_secs = entry.playhead as f64;

                    let progress = if duration_secs > 0.0 {
                        (playhead_secs / duration_secs) * 100.0
                    } else {
                        0.0
                    };

                    
                    let thumbnail = movie.images.thumbnail
                        .iter()
                        .max_by_key(|img| img.width)
                        .map(|img| img.source.clone());

                    WatchedItem {
                        title: movie.title,
                        episode_title: None,
                        date_watched: entry.date_played,
                        progress,
                        fully_watched: entry.fully_watched,
                        thumbnail,
                    }
                },
                _ => continue,
            };

            history.push(watched_item);
        }

        Ok(history)
    }
}