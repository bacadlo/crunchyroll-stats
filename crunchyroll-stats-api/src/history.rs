use crate::{auth::CrunchyrollClient, models::HistoryEntry};
use anyhow::Result;
use crunchyroll_rs::categories::{Category, CategoryInformation};
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

#[derive(Default)]
struct CategoryTaxonomy {
    titles_by_id: HashMap<String, String>,
}

fn category_title_or_fallback(raw_id: &str, localized_title: &str) -> String {
    let title = localized_title.trim();
    if title.is_empty() {
        return prettify_category(raw_id);
    }

    title.to_string()
}

async fn load_category_taxonomy(client: &crunchyroll_rs::Crunchyroll) -> CategoryTaxonomy {
    let mut taxonomy = CategoryTaxonomy::default();

    let categories = match client.categories().await {
        Ok(categories) => categories,
        Err(error) => {
            log::warn!("Failed to load category taxonomy: {}", error);
            return taxonomy;
        }
    };

    for category in categories {
        let parent_id = category.category.to_string();
        taxonomy.titles_by_id.insert(
            parent_id.clone(),
            category_title_or_fallback(&parent_id, &category.localization.title),
        );
    }

    taxonomy
}

fn resolve_genres(
    raw_categories: Vec<Category>,
    localized_categories: Vec<CategoryInformation>,
    taxonomy: &CategoryTaxonomy,
) -> Vec<String> {
    let mut category_ids = Vec::new();
    let mut seen_ids = HashSet::new();
    let mut localized_titles = HashMap::new();

    for category in localized_categories {
        let category_id = category.category.to_string();
        localized_titles.insert(
            category_id.clone(),
            category_title_or_fallback(&category_id, &category.localization.title),
        );

        if seen_ids.insert(category_id.clone()) {
            category_ids.push(category_id);
        }
    }

    for category in raw_categories {
        let category_id = category.to_string();
        if seen_ids.insert(category_id.clone()) {
            category_ids.push(category_id);
        }
    }

    normalize_genres(
        category_ids
            .into_iter()
            .map(|category_id| {
                localized_titles
                    .get(&category_id)
                    .or_else(|| taxonomy.titles_by_id.get(&category_id))
                    .cloned()
                    .unwrap_or_else(|| prettify_category(&category_id))
            })
            .collect(),
    )
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
        let taxonomy = load_category_taxonomy(&self.client.client).await;
        let mut series_genres_cache: HashMap<String, Vec<String>> = HashMap::new();
        let mut movie_listing_genres_cache: HashMap<String, Vec<String>> = HashMap::new();
        let mut pagination = self.client.client.watch_history();

        if let Some(limit) = limit {
            pagination.page_size(limit as u32);
        }

        let mut index = 0usize;
        while let Some(entry) = pagination.next().await {
            let entry = entry?;
            let playhead_ms = (entry.playhead as u64) * 1000;
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
                                log::warn!(
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
                                log::warn!(
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

                    let thumbnail = episode
                        .images
                        .iter()
                        .max_by_key(|img| img.width)
                        .map(|img| img.source.clone());

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
                                    log::warn!(
                                        "Failed to fetch series metadata for {}: {}",
                                        series_id,
                                        error
                                    );
                                }
                            }
                        }

                        let localized_categories = if raw_categories.is_empty() {
                            match episode.categories().await {
                                Ok(categories) => categories,
                                Err(error) => {
                                    log::warn!(
                                        "Failed to fetch discover categories for series {}: {}",
                                        series_id,
                                        error
                                    );
                                    Vec::new()
                                }
                            }
                        } else {
                            Vec::new()
                        };

                        let resolved =
                            resolve_genres(raw_categories, localized_categories, &taxonomy);
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
                        progress_ms: Some(playhead_ms),
                        duration_ms: Some(duration_ms),
                        thumbnail,
                        genres,
                    }
                }
                crunchyroll_rs::MediaCollection::Movie(movie) => {
                    let duration_ms = movie.duration.num_milliseconds() as u64;
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
                        let genres = match movie.movie_listing().await {
                            Ok(listing) => {
                                let raw_categories = listing.categories.clone().unwrap_or_default();
                                let localized_categories = if raw_categories.is_empty() {
                                    match listing.categories().await {
                                        Ok(categories) => categories,
                                        Err(error) => {
                                            log::warn!(
                                                "Failed to fetch discover categories for movie listing {}: {}",
                                                movie_listing_id,
                                                error
                                            );
                                            Vec::new()
                                        }
                                    }
                                } else {
                                    Vec::new()
                                };

                                resolve_genres(raw_categories, localized_categories, &taxonomy)
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
