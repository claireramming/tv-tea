import { SimpleEpisode } from "moviedb-promise";

export type FullSeason = {
  air_date?: string;
  episode_count?: number;
  id: number;
  name: string;
  overview: string;
  poster_path?: string;
  season_number: number;
  episodes: SimpleEpisode[];
  'watch/providers'?: { results: {US: { flatrate: WatchProvider[] } }};
}

export type SeasonToWatch = FullSeason & WatchListEntry

export type WatchProvider = {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

export type Rating = {
  iso_3166_1: string;
  rating: string;
}

export type ProfileInfo = {
  id: string;
  country: string;
  providers: string[];
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
  num_delay_days?: number,
  status: string
}