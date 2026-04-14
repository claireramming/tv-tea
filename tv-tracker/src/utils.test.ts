import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toQueryParams, addSeasonToWatchList, SimpleFetch, ApiError } from './utils';
import * as toastify from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// ── toQueryParams ─────────────────────────────────────────────────────────────

describe('toQueryParams', () => {
  it('returns empty string for empty object', () => {
    expect(toQueryParams({})).toBe('');
  });

  it('returns query string for a single param', () => {
    expect(toQueryParams({ key: 'value' })).toBe('?key=value');
  });

  it('returns query string for multiple params', () => {
    const result = toQueryParams({ a: '1', b: '2' });
    expect(result).toBe('?a=1&b=2');
  });
});

// ── SimpleFetch ───────────────────────────────────────────────────────────────

describe('SimpleFetch', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets Authorization header with token', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    await SimpleFetch.get('test/', {}, 'my-token');
    const call = vi.mocked(fetch).mock.calls[0];
    const options = call[1] as RequestInit;
    expect((options.headers as Record<string, string>)['Authorization']).toBe('Bearer my-token');
  });

  it('throws ApiError with parsed body on non-2xx response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Not found' }), { status: 404 })
    );
    await expect(SimpleFetch.get('missing/')).rejects.toMatchObject({
      message: 'HTTP error 404',
      body: { detail: 'Not found' },
    });
  });

  it('returns parsed JSON for 200 response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1 }), { status: 200 })
    );
    const result = await SimpleFetch.get<{ id: number }>('test/');
    expect(result).toEqual({ id: 1 });
  });

  it('returns raw Response for DELETE requests', async () => {
    const mockResponse = new Response(null, { status: 204 });
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse);
    const result = await SimpleFetch.delete('test/1/');
    expect(result).toBeInstanceOf(Response);
  });

  it('returns raw Response for 204 No Content', async () => {
    const mockResponse = new Response(null, { status: 204 });
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse);
    const result = await SimpleFetch.patch('test/1/', {});
    expect(result).toBeInstanceOf(Response);
  });
});

// ── addSeasonToWatchList ──────────────────────────────────────────────────────

describe('addSeasonToWatchList', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(toastify.toast.success).mockClear();
    vi.mocked(toastify.toast.info).mockClear();
    vi.mocked(toastify.toast.error).mockClear();
  });

  it('POSTs and returns true when season does not exist', async () => {
    vi.spyOn(SimpleFetch, 'get').mockResolvedValueOnce([]);
    vi.spyOn(SimpleFetch, 'post').mockResolvedValueOnce({});
    const result = await addSeasonToWatchList(1, 1, 'Returning Series', 'token');
    expect(SimpleFetch.post).toHaveBeenCalled();
    expect(result).toBe(true);
    expect(toastify.toast.success).toHaveBeenCalled();
  });

  it('PATCHes to restore and returns true when season was removed', async () => {
    vi.spyOn(SimpleFetch, 'get').mockResolvedValueOnce([
      { id: 42, datetime_removed_at: '2024-01-01T00:00:00Z' },
    ]);
    vi.spyOn(SimpleFetch, 'patch').mockResolvedValueOnce({});
    const result = await addSeasonToWatchList(1, 1, 'Returning Series', 'token');
    expect(SimpleFetch.patch).toHaveBeenCalledWith(
      'watchlist/42/',
      { datetime_removed_at: null },
      'token'
    );
    expect(result).toBe(true);
    expect(toastify.toast.success).toHaveBeenCalled();
  });

  it('returns false and shows info toast when season already in watchlist', async () => {
    vi.spyOn(SimpleFetch, 'get').mockResolvedValueOnce([
      { id: 42, datetime_removed_at: null },
    ]);
    const result = await addSeasonToWatchList(1, 1, 'Returning Series', 'token');
    expect(result).toBe(false);
    expect(toastify.toast.info).toHaveBeenCalledWith(
      'Season already in watchlist',
      expect.anything()
    );
  });

  it('returns false and shows info toast on unique constraint error', async () => {
    vi.spyOn(SimpleFetch, 'get').mockResolvedValueOnce([]);
    vi.spyOn(SimpleFetch, 'post').mockRejectedValueOnce(
      new ApiError('HTTP error 400', { non_field_errors: ['must make a unique set'] })
    );
    const result = await addSeasonToWatchList(1, 1, 'Returning Series', 'token');
    expect(result).toBe(false);
    expect(toastify.toast.info).toHaveBeenCalledWith(
      'Season already in watchlist',
      expect.anything()
    );
  });

  it('returns false and shows error toast on other API error', async () => {
    vi.spyOn(SimpleFetch, 'get').mockResolvedValueOnce([]);
    vi.spyOn(SimpleFetch, 'post').mockRejectedValueOnce(new Error('Network error'));
    const result = await addSeasonToWatchList(1, 1, 'Returning Series', 'token');
    expect(result).toBe(false);
    expect(toastify.toast.error).toHaveBeenCalledWith(
      'Error adding season to watchlist',
      expect.anything()
    );
  });
});
