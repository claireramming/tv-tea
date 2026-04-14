import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import SeasonTile from './SeasonTile';
import { makeSeason, makeEpisodes } from '../../test/factories';

vi.mock('../common/ProgressBar', () => ({
  default: () => <div data-testid="progress-bar" />,
}));

vi.mock('./AddSeasonModal', () => ({
  default: () => <div />,
}));

function renderTile(props: React.ComponentProps<typeof SeasonTile>) {
  return render(
    <MemoryRouter>
      <SeasonTile {...props} />
    </MemoryRouter>
  );
}

describe('SeasonTile — not started', () => {
  it('shows Start Watching button', () => {
    renderTile({
      season: makeSeason(),
      remove: vi.fn(), start: vi.fn(), finish: vi.fn(), update: vi.fn(),
    });
    expect(screen.getByText('Start Watching')).toBeInTheDocument();
  });

  it('does not render progress bar', () => {
    renderTile({
      season: makeSeason(),
      remove: vi.fn(), start: vi.fn(), finish: vi.fn(), update: vi.fn(),
    });
    expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
  });

  it('does not show start or completion date', () => {
    renderTile({
      season: makeSeason(),
      remove: vi.fn(), start: vi.fn(), finish: vi.fn(), update: vi.fn(),
    });
    expect(screen.queryByText(/Started:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Completed:/)).not.toBeInTheDocument();
  });
});

describe('SeasonTile — in progress', () => {
  const inProgressSeason = makeSeason({ datetime_started_at: '2024-01-01T00:00:00Z' });

  it('shows Finish Watching button', () => {
    renderTile({
      season: inProgressSeason,
      remove: vi.fn(), start: vi.fn(), finish: vi.fn(), update: vi.fn(),
    });
    expect(screen.getByText('Finish Watching')).toBeInTheDocument();
  });

  it('renders progress bar', () => {
    renderTile({
      season: inProgressSeason,
      remove: vi.fn(), start: vi.fn(), finish: vi.fn(), update: vi.fn(),
    });
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  it('shows start date', () => {
    renderTile({
      season: inProgressSeason,
      remove: vi.fn(), start: vi.fn(), finish: vi.fn(), update: vi.fn(),
    });
    expect(screen.getByText(/Started:/)).toBeInTheDocument();
  });

  it('calls finish with watchlistId when Finish button clicked', async () => {
    const finish = vi.fn();
    renderTile({
      season: inProgressSeason,
      remove: vi.fn(), start: vi.fn(), finish, update: vi.fn(),
    });
    await userEvent.click(screen.getByText('Finish Watching'));
    expect(finish).toHaveBeenCalledWith(1);
  });
});

describe('SeasonTile — completed', () => {
  const completedSeason = makeSeason({
    datetime_started_at: '2024-01-01T00:00:00Z',
    datetime_finished_at: '2024-02-01T00:00:00Z',
  });

  it('shows no action button', () => {
    renderTile({
      season: completedSeason,
      remove: vi.fn(), start: vi.fn(), finish: vi.fn(), update: vi.fn(),
    });
    expect(screen.queryByText('Start Watching')).not.toBeInTheDocument();
    expect(screen.queryByText('Finish Watching')).not.toBeInTheDocument();
  });

  it('does not render progress bar', () => {
    renderTile({
      season: completedSeason,
      remove: vi.fn(), start: vi.fn(), finish: vi.fn(), update: vi.fn(),
    });
    expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
  });

  it('shows completion date', () => {
    renderTile({
      season: completedSeason,
      remove: vi.fn(), start: vi.fn(), finish: vi.fn(), update: vi.fn(),
    });
    expect(screen.getByText(/Completed:/)).toBeInTheDocument();
  });
});

describe('SeasonTile — always', () => {
  it('Remove button always calls remove with watchlistId', async () => {
    const remove = vi.fn();
    renderTile({
      season: makeSeason(),
      remove, start: vi.fn(), finish: vi.fn(), update: vi.fn(),
    });
    await userEvent.click(screen.getByText('Remove'));
    expect(remove).toHaveBeenCalledWith(1);
  });

  it('shows episode count badge', () => {
    renderTile({
      season: makeSeason({ episodes: makeEpisodes([30, 30]) }),
      remove: vi.fn(), start: vi.fn(), finish: vi.fn(), update: vi.fn(),
    });
    expect(screen.getByText('2 Episodes')).toBeInTheDocument();
  });
});

// ── Show title link ───────────────────────────────────────────────────────────

describe('SeasonTile — show title link', () => {
  it('show name links to the show page', () => {
    renderTile({
      season: makeSeason({ show_id: 42 }),
      remove: vi.fn(), start: vi.fn(), finish: vi.fn(), update: vi.fn(),
    });
    const link = screen.getByRole('link', { name: 'Test Show' });
    expect(link).toHaveAttribute('href', '/show/42');
  });

  it('uses the season show_id in the link href', () => {
    renderTile({
      season: makeSeason({ show_id: 999 }),
      remove: vi.fn(), start: vi.fn(), finish: vi.fn(), update: vi.fn(),
    });
    expect(screen.getByRole('link', { name: 'Test Show' })).toHaveAttribute('href', '/show/999');
  });
});
