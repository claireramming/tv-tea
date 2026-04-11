import { Episode, ShowResponse, SimpleEpisode, SimpleSeason, WatchProvider, WatchProviderCountry } from "moviedb-promise";

export type { WatchProvider };

export type FullSeason = {
  air_date?: string;
  episode_count?: number;
  id: number;
  name: string;
  overview: string;
  poster_path?: string;
  season_number: number;
  episodes: SimpleEpisode[];
  providers?: Record<string, WatchProviderCountry>;
  show?: ShowResponse;
  watchlistId?: number;
  episodesReady?: number;
  showName?: string;
  showId?: number;
  seasonId?: number;
}

export type SeasonToWatch = FullSeason & WatchListEntry

export type UpNextEpisode = {
  watchlistId: number;
  showName: string;
  seasonName: string | undefined;
  episode: Episode;
  providers: WatchProvider[];
}

export type NextSeason = SimpleSeason & {
  showName: string;
  showId: number;
  status: string;
}

export type Rating = {
  iso_3166_1: string;
  rating: string;
}

export type ProfileInfo = {
  id: string;
  name: string;
  country: string;
  providers: string[];
}

export type StatsInfo = {
  id: string;
  date: string;
  num_watched_episodes: number;
  minutes_watched: number;
}

export type WatchListEntry = {
  id: number,
  user: string,
  show_id: number,
  season: number,
  num_episodes_watched: number,
  datetime_added_at: string,
  datetime_started_at?: string,
  datetime_finished_at?: string,
  datetime_removed_at?: string,
  num_delay_days?: number,
  status: string
}