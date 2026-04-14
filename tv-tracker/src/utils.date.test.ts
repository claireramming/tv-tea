import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getLastSunday, getFirstOfTheMonth, getFirstOfTheYear } from './utils';

// Use noon UTC so local-time date methods (getDay, setDate) land on the right
// calendar day regardless of the test runner's timezone offset.

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getLastSunday', () => {
  it('returns the same day when today is Sunday', () => {
    vi.setSystemTime(new Date('2024-06-02T12:00:00Z')); // Sunday
    expect(getLastSunday()).toBe('2024-06-02');
  });

  it('returns the preceding Sunday when today is Wednesday', () => {
    vi.setSystemTime(new Date('2024-06-05T12:00:00Z')); // Wednesday
    expect(getLastSunday()).toBe('2024-06-02');
  });

  it('returns the preceding Sunday when today is Saturday', () => {
    vi.setSystemTime(new Date('2024-06-08T12:00:00Z')); // Saturday
    expect(getLastSunday()).toBe('2024-06-02');
  });
});

describe('getFirstOfTheMonth', () => {
  it('returns the first of the current month', () => {
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    expect(getFirstOfTheMonth()).toBe('2024-06-01');
  });

  it('returns the first when today is already the first', () => {
    vi.setSystemTime(new Date('2024-06-01T12:00:00Z'));
    expect(getFirstOfTheMonth()).toBe('2024-06-01');
  });
});

describe('getFirstOfTheYear', () => {
  it('returns Jan 1 of the current year', () => {
    vi.setSystemTime(new Date('2024-09-20T12:00:00Z'));
    expect(getFirstOfTheYear()).toBe('2024-01-01');
  });

  it('returns Jan 1 when today is already Jan 1', () => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    expect(getFirstOfTheYear()).toBe('2024-01-01');
  });
});
