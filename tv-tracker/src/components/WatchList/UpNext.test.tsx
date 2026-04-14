import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UpNext from './UpNext';
import { NextSeason } from '../../types';
import { makeSeason } from '../../test/factories';

vi.mock('../common/ProviderImage', () => ({
  default: () => null,
}));

// Fix "today" so air date comparisons are deterministic
const TODAY = '2024-06-15';
beforeEach(() => {
  vi.setSystemTime(new Date(TODAY));
});
afterEach(() => {
  vi.useRealTimers();
});

const defaultProps = {
  isLoading: false,
  watchlist: [],
  add: vi.fn(),
  start: vi.fn(),
  ignore: vi.fn(),
  update: vi.fn(),
};

// ── Empty state ───────────────────────────────────────────────────────────────

describe('UpNext — empty state', () => {
  it('shows default text when all lists are empty and not loading', () => {
    render(<UpNext {...defaultProps} />);
    expect(screen.getByText(/Add more shows/)).toBeInTheDocument();
  });

  it('shows loading spinners when isLoading is true and lists are empty', () => {
    const { container } = render(<UpNext {...defaultProps} isLoading={true} />);
    expect(container.querySelectorAll('.loading')).toHaveLength(3);
  });
});

// ── In Progress episodes ──────────────────────────────────────────────────────

describe('UpNext — inProgress section', () => {
  const inProgressSeason = makeSeason({
    id: 1,
    datetime_started_at: '2024-01-01T00:00:00Z',
    num_episodes_watched: 0,
    episodes: [{ id: 99, episode_number: 1, air_date: '2024-01-10', runtime: 45, name: 'Pilot' }],
  });

  it('renders Mark As Watched button for in-progress episodes', () => {
    render(<UpNext {...defaultProps} watchlist={[inProgressSeason]} />);
    expect(screen.getByText('Mark As Watched')).toBeInTheDocument();
  });

  it('calls update with correct args when Mark As Watched clicked', async () => {
    const update = vi.fn();
    render(<UpNext {...defaultProps} watchlist={[inProgressSeason]} update={update} />);
    await userEvent.click(screen.getByText('Mark As Watched'));
    expect(update).toHaveBeenCalledWith(1, 1, 45);
  });

  it('does not show episodes with air_date >= today', () => {
    const futureEpisodeSeason = makeSeason({
      datetime_started_at: '2024-01-01T00:00:00Z',
      num_episodes_watched: 0,
      episodes: [{ id: 99, episode_number: 1, air_date: '2024-12-31', runtime: 45 }],
    });
    render(<UpNext {...defaultProps} watchlist={[futureEpisodeSeason]} />);
    expect(screen.queryByText('Mark As Watched')).not.toBeInTheDocument();
  });
});

// ── Ready to Watch ────────────────────────────────────────────────────────────

describe('UpNext — readyToWatch section', () => {
  const readySeason = makeSeason({
    id: 2,
    datetime_started_at: null,
    datetime_finished_at: null,
    air_date: '2024-01-01',
    episodes: [{ id: 1, episode_number: 1, air_date: '2024-01-10' }],
  });

  it('renders Start Watching button for ready seasons', () => {
    render(<UpNext {...defaultProps} watchlist={[readySeason]} />);
    expect(screen.getByText('Start Watching')).toBeInTheDocument();
  });

  it('calls start with season.id when Start Watching clicked', async () => {
    const start = vi.fn();
    render(<UpNext {...defaultProps} watchlist={[readySeason]} start={start} />);
    await userEvent.click(screen.getByText('Start Watching'));
    expect(start).toHaveBeenCalledWith(2);
  });

  it('does not show seasons with no aired episodes', () => {
    const noAiredEps = makeSeason({
      air_date: '2024-01-01',
      episodes: [{ id: 1, episode_number: 1, air_date: '2024-12-31' }],
    });
    render(<UpNext {...defaultProps} watchlist={[noAiredEps]} />);
    expect(screen.queryByText('Start Watching')).not.toBeInTheDocument();
  });
});

// ── Ignore workflow (nextSeasons) ─────────────────────────────────────────────

describe('UpNext — ignore workflow', () => {
  const completedSeason = makeSeason({
    id: 3,
    seasonId: 10,
    season_number: 1,
    datetime_started_at: '2024-01-01T00:00:00Z',
    datetime_finished_at: '2024-03-01T00:00:00Z',
    show: {
      id: 100,
      name: 'Test Show',
      number_of_seasons: 2,
      seasons: [
        { id: 10, season_number: 1, air_date: '2024-01-01' },
        { id: 11, season_number: 2, air_date: '2024-02-01' },
      ],
    },
    status: 'Returning Series',
  });

  it('renders Ignore and Add to Watchlist buttons for next seasons', () => {
    render(<UpNext {...defaultProps} watchlist={[completedSeason]} />);
    expect(screen.getByText('Ignore')).toBeInTheDocument();
    expect(screen.getByText('Add to Watchlist')).toBeInTheDocument();
  });

  it('calls ignore with the next season object when Ignore clicked', async () => {
    const ignore = vi.fn();
    render(<UpNext {...defaultProps} watchlist={[completedSeason]} ignore={ignore} />);
    await userEvent.click(screen.getByText('Ignore'));
    expect(ignore).toHaveBeenCalledWith(
      expect.objectContaining({ season_number: 2, showId: 100 })
    );
  });

  it('calls add with showId, season_number, status when Add to Watchlist clicked', async () => {
    const add = vi.fn();
    render(<UpNext {...defaultProps} watchlist={[completedSeason]} add={add} />);
    await userEvent.click(screen.getByText('Add to Watchlist'));
    expect(add).toHaveBeenCalledWith(100, 2, 'Returning Series');
  });

  it('does not show next season when it is already in notStarted', () => {
    const nextSeasonNotStarted = makeSeason({
      id: 4,
      seasonId: 11,
      season_number: 2,
      datetime_started_at: null,
      datetime_finished_at: null,
    });
    render(<UpNext {...defaultProps} watchlist={[completedSeason, nextSeasonNotStarted]} />);
    // Should render "Start Watching" for readyToWatch, but NOT show Ignore for nextSeasons
    expect(screen.queryByText('Ignore')).not.toBeInTheDocument();
  });

  it('does not show next season when it has been ignored (datetime_removed_at set)', () => {
    const ignoredNextSeason = makeSeason({
      id: 4,
      seasonId: 11,
      season_number: 2,
      datetime_removed_at: '2024-04-01T00:00:00Z',
    });
    render(<UpNext {...defaultProps} watchlist={[completedSeason, ignoredNextSeason]} />);
    expect(screen.queryByText('Ignore')).not.toBeInTheDocument();
  });

  it('does not show next season when it is already in progress', () => {
    const inProgressNext = makeSeason({
      id: 4,
      seasonId: 11,
      season_number: 2,
      datetime_started_at: '2024-04-01T00:00:00Z',
      datetime_finished_at: null,
    });
    render(<UpNext {...defaultProps} watchlist={[completedSeason, inProgressNext]} />);
    expect(screen.queryByText('Ignore')).not.toBeInTheDocument();
  });
});
