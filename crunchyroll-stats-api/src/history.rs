use crate::{auth::CrunchyrollClient, models::{HistoryEntry, Image}};
use anyhow::Result;
use chrono::{Duration, Utc};
use futures_util::StreamExt;
use std::collections::HashMap;

pub struct History<'a> {
    client: &'a CrunchyrollClient,
}

impl<'a> History<'a> {
    pub fn new(client: &'a CrunchyrollClient) -> Self {
        Self { client }
    }

    pub async fn fetch_history(&self, limit: Option<usize>) -> Result<Vec<HistoryEntry>> {
        let mut history = Vec::new();
        let mut series_genres_cache: HashMap<String, Vec<String>> = HashMap::new();
        let mut movie_listing_genres_cache: HashMap<String, Vec<String>> = HashMap::new();
        let mut pagination = self.client.client.watch_history();

        if let Some(limit) = limit {
            pagination.page_size(limit as u32);
        }

        let cutoff = Utc::now() - Duration::days(365);
        let mut index = 0usize;
        while let Some(entry) = pagination.next().await {
            let entry = entry?;

            if entry.date_played < cutoff {
                break;
            }

            let playhead = entry.playhead;
            let watched_at = Some(entry.date_played.to_rfc3339());

            let panel = match entry.panel {
                Some(panel) => panel,
                None => {
                    let entry_id = entry.id.clone();
                    let parent_id = entry.parent_id.clone();
                    let parent_type = entry.parent_type.clone();

                    let from_entry_id =
                        self.client.client.media_collection_from_id(&entry_id).await;
                    if let Ok(panel) = from_entry_id {
                        panel
                    } else {
                        let from_parent_id = if parent_id != entry_id {
                            Some(
                                self.client
                                    .client
                                    .media_collection_from_id(&parent_id)
                                    .await,
                            )
                        } else {
                            None
                        };

                        match from_parent_id {
                            Some(Ok(panel)) => panel,
                            Some(Err(parent_error)) => {
                                let entry_error = from_entry_id
                                    .err()
                                    .map(|error| error.to_string())
                                    .unwrap_or_else(|| "unknown error".to_string());
                                tracing::warn!(
                                    "Watch history entry {} had no panel and could not be resolved (parent_type={}, parent_id={}). entry lookup error: {}. parent lookup error: {}",
                                    entry_id,
                                    parent_type,
                                    parent_id,
                                    entry_error,
                                    parent_error
                                );
                                continue;
                            }
                            None => {
                                let entry_error = from_entry_id
                                    .err()
                                    .map(|error| error.to_string())
                                    .unwrap_or_else(|| "unknown error".to_string());
                                tracing::warn!(
                                    "Watch history entry {} had no panel and could not be resolved (parent_type={}, parent_id={}). entry lookup error: {}. parent lookup skipped because parent id matched entry id.",
                                    entry_id,
                                    parent_type,
                                    parent_id,
                                    entry_error
                                );
                                continue;
                            }
                        }
                    }
                }
            };

            let history_entry = match panel {
                crunchyroll_rs::MediaCollection::Episode(episode) => {
                    let duration_ms = episode.duration.num_milliseconds() as u64;
                    let series_id = episode.series_id.clone();
                    let content_id = episode.id.clone();

                    let images: Vec<Image> = episode
                        .images
                        .iter()
                        .map(|img| Image { source: img.source.clone(), width: img.width })
                        .collect();

                    let genres = if let Some(cached) = series_genres_cache.get(&series_id) {
                        cached.clone()
                    } else {
                        let mut raw_categories = episode.categories.clone().unwrap_or_default();
                        if raw_categories.is_empty() {
                            match episode.series().await {
                                Ok(series) => {
                                    raw_categories = series.categories.unwrap_or_default();
                                }
                                Err(error) => {
                                    tracing::warn!(
                                        "Failed to fetch series metadata for {}: {}",
                                        series_id,
                                        error
                                    );
                                }
                            }
                        }

                        let resolved: Vec<String> = raw_categories.into_iter().map(|c| c.to_string()).collect();
                        series_genres_cache.insert(series_id.clone(), resolved.clone());
                        resolved
                    };

                    HistoryEntry {
                        id: format!("item-{}", index),
                        media_type: "episode".to_string(),
                        content_id: Some(content_id),
                        series_id: Some(series_id),
                        movie_listing_id: None,
                        title: episode.series_title,
                        episode_title: Some(episode.title),
                        watched_at,
                        playhead: Some(playhead),
                        duration_ms: Some(duration_ms),
                        images,
                        genres,
                    }
                }
                crunchyroll_rs::MediaCollection::Movie(movie) => {
                    let duration_ms = movie.duration.num_milliseconds() as u64;
                    let content_id = movie.id.clone();
                    let movie_listing_id = movie.movie_listing_id.clone();

                    let images: Vec<Image> = movie
                        .images
                        .thumbnail
                        .iter()
                        .map(|img| Image { source: img.source.clone(), width: img.width })
                        .collect();

                    let genres = if let Some(cached) =
                        movie_listing_genres_cache.get(&movie_listing_id)
                    {
                        cached.clone()
                    } else {
                        let genres = match movie.movie_listing().await {
                            Ok(listing) => {
                                let raw_categories = listing.categories.clone().unwrap_or_default();
                                raw_categories.into_iter().map(|c| c.to_string()).collect()
                            }
                            Err(error) => {
                                tracing::warn!(
                                    "Failed to fetch movie listing {}: {}",
                                    movie_listing_id,
                                    error
                                );
                                Vec::new()
                            }
                        };

                        movie_listing_genres_cache.insert(movie_listing_id.clone(), genres.clone());
                        genres
                    };

                    HistoryEntry {
                        id: format!("item-{}", index),
                        media_type: "movie".to_string(),
                        content_id: Some(content_id),
                        series_id: None,
                        movie_listing_id: Some(movie_listing_id),
                        title: movie.title,
                        episode_title: None,
                        watched_at,
                        playhead: Some(playhead),
                        duration_ms: Some(duration_ms),
                        images,
                        genres,
                    }
                }
                _ => continue,
            };

            history.push(history_entry);
            index += 1;
        }

        Ok(history)
    }
}
