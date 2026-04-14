import { SeasonToWatch, WatchProvider, ProfileInfo, StatsInfo, FullSeason } from '../types';
import { SimpleEpisode } from 'moviedb-promise';

export function makeSeason(overrides: Partial<SeasonToWatch> = {}): SeasonToWatch {
  return {
    id: 1,
    watchlistId: 1,
    show_id: 100,
    season: 1,
    season_number: 1,
    status: 'Returning Series',
    num_episodes_watched: 0,
    episodes: [],
    name: 'Season 1',
    air_date: '2024-01-01',
    show: {
      id: 100,
      name: 'Test Show',
      number_of_seasons: 2,
      seasons: [
        { id: 10, season_number: 1, air_date: '2024-01-01' },
        { id: 11, season_number: 2, air_date: '2024-02-01' },
      ],
    },
    datetime_started_at: null,
    datetime_finished_at: null,
    datetime_removed_at: null,
    datetime_added_at: '2024-01-01T00:00:00Z',
    seasonId: 10,
    providers: { US: { flatrate: [] } },
    ...overrides,
  } as unknown as SeasonToWatch;
}

export function makeProvider(overrides: Partial<WatchProvider> = {}): WatchProvider {
  return {
    provider_id: 1,
    provider_name: 'Test Provider',
    logo_path: '/logo.png',
    display_priority: 10,
    ...overrides,
  };
}

export function makeEpisodes(runtimes: (number | undefined)[]): SimpleEpisode[] {
  return runtimes.map((runtime, i) => ({
    id: i + 1,
    episode_number: i + 1,
    runtime,
  }));
}

export const mockProfile: ProfileInfo = {
  id: 'auth0|testuser123',
  name: 'Test User',
  country: 'US',
  preferred_providers: [8],
  ignored_providers: [],
};

export function makeFullSeason(overrides: Partial<FullSeason> = {}): FullSeason {
  return {
    id: 1,
    name: 'Season 1',
    season_number: 1,
    air_date: '2024-01-01',
    episode_count: 2,
    overview: 'Season overview',
    episodes: [
      { id: 1, episode_number: 1, name: 'Pilot', air_date: '2024-01-01' } as SimpleEpisode,
      { id: 2, episode_number: 2, name: 'Episode 2', air_date: '2024-01-08' } as SimpleEpisode,
    ],
    ...overrides,
  } as FullSeason;
}

export const mockShowData = {
  id: 100,
  name: 'Test Show',
  status: 'Returning Series',
  overview: 'A test show overview',
  backdrop_path: '/backdrop.jpg',
  poster_path: '/poster.jpg',
  first_air_date: '2024-01-01',
  last_air_date: '2024-06-01',
  in_production: true,
  genres: [{ id: 1, name: 'Drama' }],
  seasons: [
    { id: 10, season_number: 1, air_date: '2024-01-01', name: 'Season 1', episode_count: 10 },
    { id: 11, season_number: 2, air_date: '2024-06-01', name: 'Season 2', episode_count: 8 },
  ],
  'watch/providers': {
    results: {
      US: {
        flatrate: [
          { provider_id: 1, provider_name: 'Netflix', logo_path: '/netflix.png', display_priority: 1 },
        ],
      },
    },
  },
  content_ratings: {
    results: [{ iso_3166_1: 'US', rating: 'TV-MA' }],
  },
};

// Dates relative to TODAY = '2024-06-15' (Saturday):
//   getLastSunday()      → '2024-06-09'
//   getFirstOfTheMonth() → '2024-06-01'
//   getFirstOfTheYear()  → '2024-01-01'
// This-week  (>= 2024-06-09): entries 1+2 → 5 eps, 150 min
// All-time   (>= 1970-01-01): all 3      → 10 eps, 300 min
export const mockStats: StatsInfo[] = [
  { id: '1', date: '2024-06-10', num_watched_episodes: 3, minutes_watched: 90 },
  { id: '2', date: '2024-06-12', num_watched_episodes: 2, minutes_watched: 60 },
  { id: '3', date: '2023-01-15', num_watched_episodes: 5, minutes_watched: 150 },
];
