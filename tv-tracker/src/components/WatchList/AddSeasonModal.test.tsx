import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddSeasonModal from './AddSeasonModal';

// <dialog> without `open` is inaccessible in jsdom; pass `{ hidden: true }` to
// role queries so they find elements inside the closed dialog.

const defaultProps = {
  episodeCount: 10,
  watchlistId: 5,
  start: vi.fn(),
  finish: vi.fn(),
};

describe('AddSeasonModal', () => {
  it('number input starts at 0', () => {
    render(<AddSeasonModal {...defaultProps} />);
    expect(screen.getByRole('spinbutton', { hidden: true })).toHaveValue(0);
  });

  it('input value updates when user types', async () => {
    render(<AddSeasonModal {...defaultProps} />);
    const input = screen.getByRole('spinbutton', { hidden: true });
    await userEvent.clear(input);
    await userEvent.type(input, '3');
    expect(input).toHaveValue(3);
  });

  it('Complete button calls finish(watchlistId)', async () => {
    const finish = vi.fn();
    render(<AddSeasonModal {...defaultProps} finish={finish} />);
    await userEvent.click(screen.getByText('Complete'));
    expect(finish).toHaveBeenCalledWith(5);
  });

  it('Start Watching button calls start(watchlistId, preWatched) with current input value', async () => {
    const start = vi.fn();
    render(<AddSeasonModal {...defaultProps} start={start} />);
    const input = screen.getByRole('spinbutton', { hidden: true });
    await userEvent.clear(input);
    await userEvent.type(input, '2');
    await userEvent.click(screen.getByText('Start Watching'));
    expect(start).toHaveBeenCalledWith(5, 2);
  });

  it('Start Watching with default 0 pre-watched episodes', async () => {
    const start = vi.fn();
    render(<AddSeasonModal {...defaultProps} start={start} />);
    await userEvent.click(screen.getByText('Start Watching'));
    expect(start).toHaveBeenCalledWith(5, 0);
  });
});
