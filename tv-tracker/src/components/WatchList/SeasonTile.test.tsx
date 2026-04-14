import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SeasonTile from './SeasonTile';
import { makeSeason, makeEpisodes } from '../../test/factories';

vi.mock('../common/ProgressBar', () => ({
  default: () => <div data-testid="progress-bar" />,
}));

vi.mock('./AddSeasonModal', () => ({
  default: () => <div />,
}));

describe('SeasonTile — not started', () => {
  it('shows Start Watching button', () => {
    render(
      <SeasonTile
        season={makeSeason()}
        remove={vi.fn()} start={vi.fn()} finish={vi.fn()} update={vi.fn()}
      />
    );
    expect(screen.getByText('Start Watching')).toBeInTheDocument();
  });

  it('does not render progress bar', () => {
    render(
      <SeasonTile
        season={makeSeason()}
        remove={vi.fn()} start={vi.fn()} finish={vi.fn()} update={vi.fn()}
      />
    );
    expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
  });

  it('does not show start or completion date', () => {
    render(
      <SeasonTile
        season={makeSeason()}
        remove={vi.fn()} start={vi.fn()} finish={vi.fn()} update={vi.fn()}
      />
    );
    expect(screen.queryByText(/Started:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Completed:/)).not.toBeInTheDocument();
  });
});

describe('SeasonTile — in progress', () => {
  const inProgressSeason = makeSeason({ datetime_started_at: '2024-01-01T00:00:00Z' });

  it('shows Finish Watching button', () => {
    render(
      <SeasonTile
        season={inProgressSeason}
        remove={vi.fn()} start={vi.fn()} finish={vi.fn()} update={vi.fn()}
      />
    );
    expect(screen.getByText('Finish Watching')).toBeInTheDocument();
  });

  it('renders progress bar', () => {
    render(
      <SeasonTile
        season={inProgressSeason}
        remove={vi.fn()} start={vi.fn()} finish={vi.fn()} update={vi.fn()}
      />
    );
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  it('shows start date', () => {
    render(
      <SeasonTile
        season={inProgressSeason}
        remove={vi.fn()} start={vi.fn()} finish={vi.fn()} update={vi.fn()}
      />
    );
    expect(screen.getByText(/Started:/)).toBeInTheDocument();
  });

  it('calls finish with watchlistId when Finish button clicked', async () => {
    const finish = vi.fn();
    render(
      <SeasonTile
        season={inProgressSeason}
        remove={vi.fn()} start={vi.fn()} finish={finish} update={vi.fn()}
      />
    );
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
    render(
      <SeasonTile
        season={completedSeason}
        remove={vi.fn()} start={vi.fn()} finish={vi.fn()} update={vi.fn()}
      />
    );
    expect(screen.queryByText('Start Watching')).not.toBeInTheDocument();
    expect(screen.queryByText('Finish Watching')).not.toBeInTheDocument();
  });

  it('does not render progress bar', () => {
    render(
      <SeasonTile
        season={completedSeason}
        remove={vi.fn()} start={vi.fn()} finish={vi.fn()} update={vi.fn()}
      />
    );
    expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
  });

  it('shows completion date', () => {
    render(
      <SeasonTile
        season={completedSeason}
        remove={vi.fn()} start={vi.fn()} finish={vi.fn()} update={vi.fn()}
      />
    );
    expect(screen.getByText(/Completed:/)).toBeInTheDocument();
  });
});

describe('SeasonTile — always', () => {
  it('Remove button always calls remove with watchlistId', async () => {
    const remove = vi.fn();
    render(
      <SeasonTile
        season={makeSeason()}
        remove={remove} start={vi.fn()} finish={vi.fn()} update={vi.fn()}
      />
    );
    await userEvent.click(screen.getByText('Remove'));
    expect(remove).toHaveBeenCalledWith(1);
  });

  it('shows episode count badge', () => {
    render(
      <SeasonTile
        season={makeSeason({ episodes: makeEpisodes([30, 30]) })}
        remove={vi.fn()} start={vi.fn()} finish={vi.fn()} update={vi.fn()}
      />
    );
    expect(screen.getByText('2 Episodes')).toBeInTheDocument();
  });
});
