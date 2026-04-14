import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Search from './Search';

// vi.hoisted ensures this is defined before the hoisted vi.mock call runs
const mockSearchTv = vi.hoisted(() => vi.fn());

vi.mock('moviedb-promise', () => ({
  // Use a class so `new MovieDb()` works correctly in jsdom
  MovieDb: class {
    searchTv = mockSearchTv;
  },
}));

const breakingBad = { id: 1, name: 'Breaking Bad', first_air_date: '2008-01-20', poster_path: '/poster.jpg' };

beforeEach(() => {
  mockSearchTv.mockResolvedValue({ results: [] });
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderSearch() {
  return render(
    <MemoryRouter>
      <Search />
    </MemoryRouter>
  );
}

describe('Search', () => {
  it('renders the search input', () => {
    renderSearch();
    expect(screen.getByPlaceholderText('Search for a show...')).toBeInTheDocument();
  });

  it('calls searchTv after the debounce delay when user types', async () => {
    mockSearchTv.mockResolvedValue({ results: [breakingBad] });
    renderSearch();
    await userEvent.type(screen.getByPlaceholderText('Search for a show...'), 'Break');
    // Wait for the 300ms debounce to fire and the async state update to complete
    await waitFor(() => expect(mockSearchTv).toHaveBeenCalledWith({ query: 'Break' }), { timeout: 1000 });
  });

  it('displays results returned by searchTv', async () => {
    mockSearchTv.mockResolvedValue({ results: [breakingBad] });
    renderSearch();
    await userEvent.type(screen.getByPlaceholderText('Search for a show...'), 'Break');
    await screen.findByText('Breaking Bad', {}, { timeout: 1000 });
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
  });

  it('clears results when input is emptied', async () => {
    mockSearchTv.mockResolvedValue({ results: [breakingBad] });
    renderSearch();
    const input = screen.getByPlaceholderText('Search for a show...');
    await userEvent.type(input, 'Break');
    await screen.findByText('Breaking Bad', {}, { timeout: 1000 });
    await userEvent.clear(input);
    await waitFor(() => expect(screen.queryByText('Breaking Bad')).not.toBeInTheDocument(), { timeout: 1000 });
  });

  it('clicking a result clears the search input and hides results', async () => {
    mockSearchTv.mockResolvedValue({ results: [breakingBad] });
    renderSearch();
    const input = screen.getByPlaceholderText('Search for a show...');
    await userEvent.type(input, 'Break');
    await screen.findByText('Breaking Bad', {}, { timeout: 1000 });
    await userEvent.click(screen.getByText('Breaking Bad'));
    expect(input).toHaveValue('');
    expect(screen.queryByText('Breaking Bad')).not.toBeInTheDocument();
  });
});
