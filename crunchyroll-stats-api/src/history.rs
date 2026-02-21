use crate::{auth::CrunchyrollClient, models::HistoryEntry};
use anyhow::Result;
use futures_util::StreamExt;
use std::collections::{HashMap, HashSet};

fn capitalize(word: &str) -> String {
    let mut chars = word.chars();
    match chars.next() {
        Some(first) => format!("{}{}", first.to_uppercase(), chars.as_str()),
        None => String::new(),
    }
}

fn prettify_category(raw: &str) -> String {
    raw.split('-')
        .filter(|part| !part.is_empty())
        .map(capitalize)
        .collect::<Vec<_>>()
        .join(" ")
}

fn normalize_genres(genres: Vec<String>) -> Vec<String> {
    let mut seen = HashSet::new();
    let mut normalized = Vec::new();

    for genre in genres {
        let trimmed = genre.trim();
        if trimmed.is_empty() {
            continue;
        }

        let key = trimmed.to_lowercase();
        if seen.insert(key) {
            normalized.push(trimmed.to_string());
        }
    }

    normalized
}

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

        let mut index = 0usize;
        while let Some(entry) = pagination.next().await {
            let entry = entry?;

            let history_entry = match entry.panel {
                Some(crunchyroll_rs::MediaCollection::Episode(episode)) => {
                    let duration_ms = episode.duration.num_milliseconds() as u64;
                    let playhead_ms = (entry.playhead as u64) * 1000;
                    let series_id = episode.series_id.clone();
                    let content_id = episode.id.clone();

                    let thumbnail = episode
                        .images
                        .iter()
                        .max_by_key(|img| img.width)
                        .map(|img| img.source.clone());

                    let genres = if let Some(cached) = series_genres_cache.get(&series_id) {
                        cached.clone()
                    } else {
                        let resolved = if let Some(raw_categories) = episode
                            .categories
                            .clone()
                            .filter(|categories| !categories.is_empty())
                        {
                            raw_categories
                                .iter()
                                .map(|category| prettify_category(&category.to_string()))
                                .collect()
                        } else {
                            match episode.categories().await {
                                Ok(categories) => categories
                                    .into_iter()
                                    .map(|category| {
                                        let title = category.localization.title.trim().to_string();
                                        if !title.is_empty() {
                                            title
                                        } else {
                                            prettify_category(&category.category.to_string())
                                        }
                                    })
                                    .collect(),
                                Err(error) => {
                                    log::warn!(
                                        "Failed to fetch categories for series {}: {}",
                                        series_id,
                                        error
                                    );
                                    Vec::new()
                                }
                            }
                        };

                        let normalized = normalize_genres(resolved);
                        series_genres_cache.insert(series_id.clone(), normalized.clone());
                        normalized
                    };

                    HistoryEntry {
                        id: format!("item-{}", index),
                        media_type: "episode".to_string(),
                        content_id: Some(content_id),
                        series_id: Some(series_id),
                        movie_listing_id: None,
                        title: episode.series_title,
                        episode_title: Some(episode.title),
                        watched_at: Some(entry.date_played.to_rfc3339()),
                        progress_ms: Some(playhead_ms),
                        duration_ms: Some(duration_ms),
                        thumbnail,
                        genres,
                    }
                }
                Some(crunchyroll_rs::MediaCollection::Movie(movie)) => {
                    let duration_ms = movie.duration.num_milliseconds() as u64;
                    let playhead_ms = (entry.playhead as u64) * 1000;
                    let content_id = movie.id.clone();
                    let movie_listing_id = movie.movie_listing_id.clone();

                    let thumbnail = movie
                        .images
                        .thumbnail
                        .iter()
                        .max_by_key(|img| img.width)
                        .map(|img| img.source.clone());

                    let genres = if let Some(cached) =
                        movie_listing_genres_cache.get(&movie_listing_id)
                    {
                        cached.clone()
                    } else {
                        let resolved = match movie.movie_listing().await {
                            Ok(listing) => {
                                if let Some(raw_categories) = listing
                                    .categories
                                    .clone()
                                    .filter(|categories| !categories.is_empty())
                                {
                                    raw_categories
                                        .iter()
                                        .map(|category| prettify_category(&category.to_string()))
                                        .collect()
                                } else {
                                    match listing.categories().await {
                                        Ok(categories) => categories
                                            .into_iter()
                                            .map(|category| {
                                                let title =
                                                    category.localization.title.trim().to_string();
                                                if !title.is_empty() {
                                                    title
                                                } else {
                                                    prettify_category(
                                                        &category.category.to_string(),
                                                    )
                                                }
                                            })
                                            .collect(),
                                        Err(error) => {
                                            log::warn!(
                                                "Failed to fetch categories for movie listing {}: {}",
                                                movie_listing_id,
                                                error
                                            );
                                            Vec::new()
                                        }
                                    }
                                }
                            }
                            Err(error) => {
                                log::warn!(
                                    "Failed to fetch movie listing {}: {}",
                                    movie_listing_id,
                                    error
                                );
                                Vec::new()
                            }
                        };

                        let normalized = normalize_genres(resolved);
                        movie_listing_genres_cache
                            .insert(movie_listing_id.clone(), normalized.clone());
                        normalized
                    };

                    HistoryEntry {
                        id: format!("item-{}", index),
                        media_type: "movie".to_string(),
                        content_id: Some(content_id),
                        series_id: None,
                        movie_listing_id: Some(movie_listing_id),
                        title: movie.title,
                        episode_title: None,
                        watched_at: Some(entry.date_played.to_rfc3339()),
                        progress_ms: Some(playhead_ms),
                        duration_ms: Some(duration_ms),
                        thumbnail,
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
