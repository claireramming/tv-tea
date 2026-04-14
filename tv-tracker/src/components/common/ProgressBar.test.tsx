import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgressBar from './ProgressBar';
import { makeEpisodes } from '../../test/factories';

describe('ProgressBar', () => {
  it('displays watched/total episode count', () => {
    const update = vi.fn();
    render(
      <ProgressBar
        watchlistId={1}
        episodes={makeEpisodes([30, 30, 30])}
        episodesWatched={1}
        update={update}
      />
    );
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('progress element has correct value and max', () => {
    render(
      <ProgressBar
        watchlistId={1}
        episodes={makeEpisodes([30, 30, 30])}
        episodesWatched={2}
        update={vi.fn()}
      />
    );
    const progress = document.querySelector('progress');
    expect(progress).toHaveAttribute('value', '2');
    expect(progress).toHaveAttribute('max', '3');
  });

  it('plus button calls update with episodesWatched+1 and next episode runtime', async () => {
    const update = vi.fn();
    render(
      <ProgressBar
        watchlistId={5}
        episodes={makeEpisodes([30, 45, 60])}
        episodesWatched={1}
        update={update}
      />
    );
    const buttons = screen.getAllByRole('button');
    const plusButton = buttons[1];
    await userEvent.click(plusButton);
    // episodesWatched=1, next episode is index 1, runtime=45
    expect(update).toHaveBeenCalledWith(5, 2, 45);
  });

  it('minus button calls update with episodesWatched-1 and last episode runtime', async () => {
    const update = vi.fn();
    render(
      <ProgressBar
        watchlistId={5}
        episodes={makeEpisodes([30, 45, 60])}
        episodesWatched={2}
        update={update}
      />
    );
    const buttons = screen.getAllByRole('button');
    const minusButton = buttons[0];
    await userEvent.click(minusButton);
    // episodesWatched=2, last episode is index 1, runtime=45
    expect(update).toHaveBeenCalledWith(5, 1, 45);
  });

  it('falls back to 0 runtime when episode has no runtime', async () => {
    const update = vi.fn();
    render(
      <ProgressBar
        watchlistId={1}
        episodes={makeEpisodes([undefined, undefined])}
        episodesWatched={1}
        update={update}
      />
    );
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[1]); // plus
    expect(update).toHaveBeenCalledWith(1, 2, 0);
  });
});
