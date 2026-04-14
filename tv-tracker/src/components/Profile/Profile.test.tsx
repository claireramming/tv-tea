import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import Profile from './Profile';
import { UserContext } from '../../contexts/UserContext';
import { ProfileContext } from '../../contexts/ProfileContext';
import { mockUser } from '../../test/renderWithUser';
import { mockProfile } from '../../test/factories';
import * as utils from '../../utils';

vi.mock('../../utils', async (importActual) => {
  const actual = await importActual<typeof import('../../utils')>();
  return { ...actual, updateUserProfile: vi.fn(), fetchProvidersByCountry: vi.fn() };
});

vi.mock('country-codes-list', () => ({
  customList: () => ({ US: '[US] United States' }),
}));

beforeEach(() => {
  vi.mocked(utils.updateUserProfile).mockResolvedValue(mockProfile);
  vi.mocked(utils.fetchProvidersByCountry).mockResolvedValue([]);
});

/** Render Profile with both UserContext and ProfileContext */
function renderProfile(setProfile = vi.fn(), profileOverride = mockProfile) {
  return render(
    <UserContext.Provider value={mockUser}>
      <ProfileContext.Provider value={profileOverride}>
        <Profile setProfile={setProfile} />
      </ProfileContext.Provider>
    </UserContext.Provider>
  );
}

// ── Auth gate ─────────────────────────────────────────────────────────────────

describe('Profile — auth gate', () => {
  it('shows login prompt when user is null', () => {
    render(
      <UserContext.Provider value={null}>
        <ProfileContext.Provider value={null}>
          <Profile setProfile={vi.fn()} />
        </ProfileContext.Provider>
      </UserContext.Provider>
    );
    expect(screen.getByText(/Please log in/)).toBeInTheDocument();
  });
});

// ── View mode ─────────────────────────────────────────────────────────────────

describe('Profile — view mode', () => {
  it('displays name and country from ProfileContext', () => {
    renderProfile();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText(/Country: US/)).toBeInTheDocument();
  });

  it('Edit Profile button switches to edit mode', async () => {
    renderProfile();
    await userEvent.click(screen.getByText('Edit Profile'));
    expect(screen.getByText('Editing Profile')).toBeInTheDocument();
  });
});

// ── Edit mode ─────────────────────────────────────────────────────────────────

describe('Profile — edit mode', () => {
  async function renderEditing(setProfile = vi.fn()) {
    renderProfile(setProfile);
    await userEvent.click(screen.getByText('Edit Profile'));
  }

  it('name input shows profile name', async () => {
    await renderEditing();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
  });

  it('country select shows profile country', async () => {
    await renderEditing();
    expect(screen.getByRole('combobox')).toHaveValue('US');
  });

  it('Save calls updateUserProfile with correct payload', async () => {
    await renderEditing();
    await userEvent.click(screen.getByText('Save'));
    expect(utils.updateUserProfile).toHaveBeenCalledWith(
      mockUser.sub,
      expect.objectContaining({ name: 'Test User', country: 'US' }),
      mockUser.accessToken,
    );
  });

  it('successful save calls setProfile with response and returns to view mode', async () => {
    const setProfile = vi.fn();
    const updated = { ...mockProfile, name: 'New Name' };
    vi.mocked(utils.updateUserProfile).mockResolvedValueOnce(updated);
    await renderEditing(setProfile);
    const input = screen.getByDisplayValue('Test User');
    await userEvent.clear(input);
    await userEvent.type(input, 'New Name');
    await userEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(setProfile).toHaveBeenCalledWith(updated);
      expect(screen.queryByText('Editing Profile')).not.toBeInTheDocument();
    });
  });

  it('failed save (null response) exits edit mode without calling setProfile', async () => {
    const setProfile = vi.fn();
    vi.mocked(utils.updateUserProfile).mockResolvedValueOnce(null);
    await renderEditing(setProfile);
    await userEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(screen.queryByText('Editing Profile')).not.toBeInTheDocument());
    expect(setProfile).not.toHaveBeenCalled();
  });

  it('Cancel exits edit mode without saving', async () => {
    const setProfile = vi.fn();
    await renderEditing(setProfile);
    const input = screen.getByDisplayValue('Test User');
    await userEvent.clear(input);
    await userEvent.type(input, 'Typed Something');
    await userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Editing Profile')).not.toBeInTheDocument();
    expect(setProfile).not.toHaveBeenCalled();
  });
});

// ── Provider selection ────────────────────────────────────────────────────────

describe('Profile — provider selection', () => {
  const providers = [
    { provider_id: 8,  provider_name: 'Netflix',   logo_path: '/netflix.png',   display_priority: 1 },
    { provider_id: 15, provider_name: 'Hulu',      logo_path: '/hulu.png',      display_priority: 2 },
    { provider_id: 2,  provider_name: 'Apple TV+', logo_path: '/appletv.png',   display_priority: 3 },
  ];

  beforeEach(() => {
    vi.mocked(utils.fetchProvidersByCountry).mockResolvedValue(providers);
  });

  it('shows provider list after entering edit mode', async () => {
    renderProfile();
    await userEvent.click(screen.getByText('Edit Profile'));
    await waitFor(() => expect(screen.getByText('Netflix')).toBeInTheDocument());
    expect(screen.getByText('Hulu')).toBeInTheDocument();
  });

  it('marks providers in preferred list with preferred state', async () => {
    renderProfile(vi.fn(), { ...mockProfile, preferred_providers: [8] });
    await userEvent.click(screen.getByText('Edit Profile'));
    await waitFor(() => screen.getByTitle('Netflix — preferred'));
    expect(screen.getByTitle('Hulu — neutral')).toBeInTheDocument();
  });

  it('cycles neutral → preferred → ignored → neutral on click', async () => {
    renderProfile(vi.fn(), { ...mockProfile, preferred_providers: [], ignored_providers: [] });
    await userEvent.click(screen.getByText('Edit Profile'));
    await waitFor(() => screen.getByTitle('Netflix — neutral'));

    await userEvent.click(screen.getByTitle('Netflix — neutral'));
    expect(screen.getByTitle('Netflix — preferred')).toBeInTheDocument();

    await userEvent.click(screen.getByTitle('Netflix — preferred'));
    expect(screen.getByTitle('Netflix — ignored')).toBeInTheDocument();

    await userEvent.click(screen.getByTitle('Netflix — ignored'));
    expect(screen.getByTitle('Netflix — neutral')).toBeInTheDocument();
  });

  it('includes preferred and ignored IDs in save payload', async () => {
    renderProfile(vi.fn(), { ...mockProfile, preferred_providers: [], ignored_providers: [] });
    await userEvent.click(screen.getByText('Edit Profile'));
    await waitFor(() => screen.getByTitle('Netflix — neutral'));

    // Make Netflix preferred, Hulu ignored
    await userEvent.click(screen.getByTitle('Netflix — neutral'));   // → preferred
    await userEvent.click(screen.getByTitle('Hulu — neutral'));      // → preferred
    await userEvent.click(screen.getByTitle('Hulu — preferred'));    // → ignored

    await userEvent.click(screen.getByText('Save'));
    expect(utils.updateUserProfile).toHaveBeenCalledWith(
      mockUser.sub,
      expect.objectContaining({ preferred_providers: [8], ignored_providers: [15] }),
      mockUser.accessToken,
    );
  });
});
