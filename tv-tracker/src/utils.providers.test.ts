import { describe, it, expect } from 'vitest';
import { getProvidersByPriority } from './utils';
import { WatchProvider, WatchProviderCountry } from 'moviedb-promise';

function p(id: number, name: string): WatchProvider {
  return { provider_id: id, provider_name: name, logo_path: `/${name}.png`, display_priority: id };
}

const netflix   = p(8,   'Netflix');
const hulu      = p(15,  'Hulu');
const peacock   = p(386, 'Peacock');   // free tier
const tubi      = p(73,  'Tubi');      // ads
const amazon    = p(9,   'Amazon');
const appleTv   = p(2,   'Apple TV+');

describe('getProvidersByPriority', () => {

  // ── undefined / empty ───────────────────────────────────────────────────────

  it('returns [] when countryProviders is undefined', () => {
    expect(getProvidersByPriority(undefined, [], [])).toEqual([]);
  });

  it('returns [] when countryProviders is empty object', () => {
    expect(getProvidersByPriority({} as WatchProviderCountry, [], [])).toEqual([]);
  });

  // ── no preferences set ──────────────────────────────────────────────────────

  it('returns all non-ignored providers when preferredIds is empty', () => {
    const cp: WatchProviderCountry = { flatrate: [netflix, hulu], free: [peacock] };
    const result = getProvidersByPriority(cp, [], []);
    expect(result.map(p => p.provider_id)).toEqual([8, 15, 386]);
  });

  it('orders flatrate before free/ads before rent/buy when no preferences', () => {
    const cp: WatchProviderCountry = {
      buy: [amazon],
      free: [peacock],
      flatrate: [netflix],
    };
    const result = getProvidersByPriority(cp, [], []);
    expect(result.map(p => p.provider_id)).toEqual([8, 386, 9]);
  });

  it('excludes ignored providers even when preferredIds is empty', () => {
    const cp: WatchProviderCountry = { flatrate: [netflix, hulu] };
    const result = getProvidersByPriority(cp, [], [8]);
    expect(result.map(p => p.provider_id)).toEqual([15]);
  });

  // ── preferred providers ─────────────────────────────────────────────────────

  it('places preferred flatrate provider first', () => {
    const cp: WatchProviderCountry = { flatrate: [netflix, hulu], free: [peacock] };
    const result = getProvidersByPriority(cp, [15], []);
    expect(result[0].provider_id).toBe(15); // Hulu preferred
  });

  it('shows preferred provider, then free/ads, then neutral flatrate', () => {
    const cp: WatchProviderCountry = { flatrate: [netflix, hulu], free: [peacock], ads: [tubi] };
    // Netflix preferred; Hulu neutral flatrate; Peacock+Tubi free/ads
    const result = getProvidersByPriority(cp, [8], []);
    const ids = result.map(p => p.provider_id);
    expect(ids[0]).toBe(8);                          // preferred first
    expect(ids).toContain(386);                      // free shown
    expect(ids).toContain(73);                       // ads shown
    expect(ids).toContain(15);                       // neutral flatrate not suppressed
  });

  it('never suppresses neutral flatrate when preferred is available', () => {
    const cp: WatchProviderCountry = { flatrate: [netflix, hulu], free: [peacock] };
    const result = getProvidersByPriority(cp, [8], []);
    expect(result.map(p => p.provider_id)).toContain(15); // Hulu still shown
  });

  it('shows neutral flatrate when none of the preferred providers are available for the show', () => {
    const cp: WatchProviderCountry = { flatrate: [hulu], free: [peacock] };
    // User prefers Netflix but it's not available for this show
    const result = getProvidersByPriority(cp, [8], []);
    expect(result.map(p => p.provider_id)).toContain(15); // Hulu shown
  });

  it('excludes ignored providers regardless of tier', () => {
    const cp: WatchProviderCountry = { flatrate: [netflix, hulu], free: [peacock] };
    const result = getProvidersByPriority(cp, [8], [15]); // Hulu ignored
    expect(result.map(p => p.provider_id)).not.toContain(15);
  });

  // ── deduplication ───────────────────────────────────────────────────────────

  it('does not duplicate a provider that appears in multiple categories', () => {
    // Peacock appears in both flatrate and free
    const cp: WatchProviderCountry = { flatrate: [peacock], free: [peacock, tubi] };
    const result = getProvidersByPriority(cp, [386], []);
    const ids = result.map(p => p.provider_id);
    expect(ids.filter(id => id === 386)).toHaveLength(1);
  });

  // ── rent/buy fallback ───────────────────────────────────────────────────────

  it('falls back to rent/buy when no flatrate/free/ads available', () => {
    const cp: WatchProviderCountry = { rent: [amazon], buy: [appleTv] };
    const result = getProvidersByPriority(cp, [8], []);
    expect(result.map(p => p.provider_id)).toEqual([9, 2]);
  });

  it('does not show rent/buy when any flatrate/free/ads provider exists', () => {
    const cp: WatchProviderCountry = { flatrate: [hulu], rent: [amazon] };
    const result = getProvidersByPriority(cp, [8], []);
    expect(result.map(p => p.provider_id)).not.toContain(9);
  });
});
