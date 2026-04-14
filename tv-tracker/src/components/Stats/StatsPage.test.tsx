import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsPage from './StatsPage';
import { renderWithUser } from '../../test/renderWithUser';
import { mockStats } from '../../test/factories';
import * as utils from '../../utils';

// Fix "today" so date-boundary helpers are deterministic.
// 2024-06-15 is a Saturday:
//   getLastSunday()      → '2024-06-09'  (this-week start)
//   getFirstOfTheMonth() → '2024-06-01'
//   getFirstOfTheYear()  → '2024-01-01'
const TODAY = '2024-06-15T12:00:00Z';

vi.mock('../../utils', async (importActual) => {
  const actual = await importActual<typeof import('../../utils')>();
  return { ...actual, getUserStats: vi.fn(), getSeasonsFinishedSince: vi.fn() };
});

beforeEach(() => {
  vi.setSystemTime(new Date(TODAY));
  vi.mocked(utils.getUserStats).mockResolvedValue(mockStats);
  vi.mocked(utils.getSeasonsFinishedSince).mockResolvedValue([]);
});

afterEach(() => {
  vi.useRealTimers();
});

// ── Auth gate ─────────────────────────────────────────────────────────────────

describe('StatsPage — auth gate', () => {
  it('shows login prompt when user is null', () => {
    renderWithUser(<StatsPage />, null);
    expect(screen.getByText(/Please log in/)).toBeInTheDocument();
  });
});

// ── Layout ────────────────────────────────────────────────────────────────────

describe('StatsPage — layout', () => {
  it('renders all four aggregation radio buttons', () => {
    renderWithUser(<StatsPage />);
    expect(screen.getByRole('radio', { name: 'This Week' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'This Month' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'This Year' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'All-time' })).toBeInTheDocument();
  });
});

// ── Stats display ─────────────────────────────────────────────────────────────

describe('StatsPage — stats display', () => {
  it('shows this-week totals by default', async () => {
    renderWithUser(<StatsPage />);
    // mockStats dates 2024-06-10 + 2024-06-12 are >= last Sunday 2024-06-09
    // → 3+2=5 episodes, 90+60=150 minutes
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('shows all-time totals when All-time is selected', async () => {
    renderWithUser(<StatsPage />);
    await waitFor(() => screen.getByText('5')); // wait for first render to settle
    await userEvent.click(screen.getByRole('radio', { name: 'All-time' }));
    // All 3 mockStats entries: 3+2+5=10 episodes, 90+60+150=300 minutes
    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('shows this-month totals when This Month is selected', async () => {
    renderWithUser(<StatsPage />);
    await waitFor(() => screen.getByText('5'));
    await userEvent.click(screen.getByRole('radio', { name: 'This Month' }));
    // getFirstOfTheMonth() → '2024-06-01': both June stats qualify (5 eps, 150 min)
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('shows this-year totals when This Year is selected', async () => {
    renderWithUser(<StatsPage />);
    await waitFor(() => screen.getByText('5'));
    await userEvent.click(screen.getByRole('radio', { name: 'This Year' }));
    // getFirstOfTheYear() → '2024-01-01': both June stats qualify; 2023 stat excluded (5 eps, 150 min)
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('shows season count from getSeasonsFinishedSince', async () => {
    vi.mocked(utils.getSeasonsFinishedSince).mockResolvedValue([{} as never, {} as never]);
    renderWithUser(<StatsPage />);
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  });
});
