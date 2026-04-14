import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShowPage from './ShowPage';
import { renderWithUser, mockUser } from '../../test/renderWithUser';
import { mockShowData } from '../../test/factories';
import * as utils from '../../utils';

vi.mock('../../utils', async (importActual) => {
  const actual = await importActual<typeof import('../../utils')>();
  return { ...actual, fetchShowData: vi.fn(), fetchSeasonData: vi.fn(), addSeasonToWatchList: vi.fn() };
});

// Control useParams without needing a real router
vi.mock('react-router', async (importActual) => {
  const actual = await importActual<typeof import('react-router')>();
  return { ...actual, useParams: () => ({ id: '100' }) };
});

beforeEach(() => {
  vi.mocked(utils.fetchShowData).mockResolvedValue(mockShowData as never);
  vi.mocked(utils.fetchSeasonData).mockReturnValue(
    mockShowData.seasons.map(() => Promise.resolve({ episodes: [] }))
  );
  vi.mocked(utils.addSeasonToWatchList).mockResolvedValue(true);
});

// Wait helper — show starts in "Loading..." until fetchShowData resolves
async function renderAndWait(user = mockUser) {
  renderWithUser(<ShowPage />, user);
  await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
}

// ── Show info ─────────────────────────────────────────────────────────────────

describe('ShowPage — show info', () => {
  it('displays the show name', async () => {
    await renderAndWait();
    expect(screen.getByText('Test Show')).toBeInTheDocument();
  });

  it('displays the show overview', async () => {
    await renderAndWait();
    expect(screen.getByText('A test show overview')).toBeInTheDocument();
  });

  it('renders the "Watch on:" section', async () => {
    await renderAndWait();
    expect(screen.getByText('Watch on:')).toBeInTheDocument();
  });
});

// ── Watchlist dropdown ────────────────────────────────────────────────────────

describe('ShowPage — watchlist dropdown', () => {
  it('shows "Log in to add" when user is not authenticated', async () => {
    await renderAndWait(null);
    expect(screen.getByText(/Log in to add/)).toBeInTheDocument();
  });

  it('renders one dropdown item per season when authenticated', async () => {
    await renderAndWait();
    // Scope to the dropdown <ul> to avoid matching season accordion headings
    const dropdown = screen.getByRole('list');
    expect(within(dropdown).getAllByRole('listitem')).toHaveLength(2);
  });

  it('clicking a season item calls addSeasonToWatchList with correct args', async () => {
    await renderAndWait();
    // Click the <a> directly — clicking the <li> doesn't reach its child's onClick
    const firstLink = screen.getByRole('list').querySelector('li a')!;
    await userEvent.click(firstLink);
    expect(utils.addSeasonToWatchList).toHaveBeenCalledWith(
      100, 1, 'Returning Series', mockUser.accessToken
    );
  });
});
