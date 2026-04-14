import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WatchList from './WatchList';
import { makeSeason } from '../../test/factories';

vi.mock('./SeasonTile', () => ({
  default: () => <div data-testid="season-tile" />,
}));

const defaultProps = {
  isLoading: false,
  watchlist: [],
  remove: vi.fn(),
  start: vi.fn(),
  finish: vi.fn(),
  update: vi.fn(),
};

const toWatchSeason    = makeSeason({ id: 1, watchlistId: 1, datetime_started_at: null, datetime_removed_at: null });
const inProgressSeason = makeSeason({ id: 2, watchlistId: 2, datetime_started_at: '2024-01-01T00:00:00Z', datetime_finished_at: null });
const completedSeason  = makeSeason({ id: 3, watchlistId: 3, datetime_started_at: '2024-01-01T00:00:00Z', datetime_finished_at: '2024-02-01T00:00:00Z' });
const allSeasons = [toWatchSeason, inProgressSeason, completedSeason];

// ── Tabs ──────────────────────────────────────────────────────────────────────

describe('WatchList — tabs', () => {
  it('renders all three tab buttons', () => {
    render(<WatchList {...defaultProps} />);
    expect(screen.getByRole('tab', { name: 'To Watch' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Completed' })).toBeInTheDocument();
  });

  it('defaults to In Progress tab — shows only started, unfinished seasons', () => {
    render(<WatchList {...defaultProps} watchlist={allSeasons} />);
    expect(screen.getAllByTestId('season-tile')).toHaveLength(1);
  });

  it('To Watch tab shows only not-started seasons', async () => {
    render(<WatchList {...defaultProps} watchlist={allSeasons} />);
    await userEvent.click(screen.getByRole('tab', { name: 'To Watch' }));
    expect(screen.getAllByTestId('season-tile')).toHaveLength(1);
  });

  it('Completed tab shows only finished seasons', async () => {
    render(<WatchList {...defaultProps} watchlist={allSeasons} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Completed' }));
    expect(screen.getAllByTestId('season-tile')).toHaveLength(1);
  });

  it('tabs are mutually exclusive — switching hides seasons from other tabs', async () => {
    render(<WatchList {...defaultProps} watchlist={allSeasons} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Completed' }));
    // completed tab: only completedSeason visible
    expect(screen.getAllByTestId('season-tile')).toHaveLength(1);
    await userEvent.click(screen.getByRole('tab', { name: 'To Watch' }));
    // to-watch tab: only toWatchSeason visible
    expect(screen.getAllByTestId('season-tile')).toHaveLength(1);
  });
});

// ── Empty and loading states ──────────────────────────────────────────────────

describe('WatchList — empty and loading states', () => {
  it('shows "No Seasons Found" when current tab has no seasons', () => {
    render(<WatchList {...defaultProps} watchlist={[]} />);
    expect(screen.getByText('No Seasons Found')).toBeInTheDocument();
  });

  it('shows loading spinners when isLoading is true and watchlist is empty', () => {
    const { container } = render(<WatchList {...defaultProps} isLoading={true} />);
    expect(container.querySelectorAll('.loading')).toHaveLength(3);
  });
});
