import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from './Profile';
import { renderWithUser, mockUser } from '../../test/renderWithUser';
import { mockProfile } from '../../test/factories';
import * as utils from '../../utils';

vi.mock('../../utils', async (importActual) => {
  const actual = await importActual<typeof import('../../utils')>();
  return { ...actual, getUserProfile: vi.fn(), updateUserProfile: vi.fn() };
});

vi.mock('country-codes-list', () => ({
  customList: () => ({ US: '[US] United States' }),
}));

beforeEach(() => {
  vi.mocked(utils.getUserProfile).mockResolvedValue(mockProfile);
  vi.mocked(utils.updateUserProfile).mockResolvedValue(mockProfile);
});

// ── Auth gate ─────────────────────────────────────────────────────────────────

describe('Profile — auth gate', () => {
  it('shows login prompt when user is null', () => {
    renderWithUser(<Profile />, null);
    expect(screen.getByText(/Please log in/)).toBeInTheDocument();
  });
});

// ── View mode ─────────────────────────────────────────────────────────────────

describe('Profile — view mode', () => {
  it('fetches profile on mount and displays name and country', async () => {
    renderWithUser(<Profile />);
    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
    expect(screen.getByText(/Country: US/)).toBeInTheDocument();
    expect(utils.getUserProfile).toHaveBeenCalledWith(mockUser.sub, mockUser.accessToken);
  });

  it('Edit Profile button switches to edit mode', async () => {
    renderWithUser(<Profile />);
    await waitFor(() => screen.getByText('Edit Profile'));
    await userEvent.click(screen.getByText('Edit Profile'));
    expect(screen.getByText('Editing Profile')).toBeInTheDocument();
  });
});

// ── Edit mode ─────────────────────────────────────────────────────────────────

describe('Profile — edit mode', () => {
  async function renderEditing() {
    renderWithUser(<Profile />);
    await waitFor(() => screen.getByText('Edit Profile'));
    await userEvent.click(screen.getByText('Edit Profile'));
  }

  it('name input shows fetched name', async () => {
    await renderEditing();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
  });

  it('country select shows fetched country', async () => {
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

  it('successful save shows updated name and returns to view mode', async () => {
    vi.mocked(utils.updateUserProfile).mockResolvedValueOnce({ ...mockProfile, name: 'New Name' });
    await renderEditing();
    const input = screen.getByDisplayValue('Test User');
    await userEvent.clear(input);
    await userEvent.type(input, 'New Name');
    await userEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(screen.queryByText('Editing Profile')).not.toBeInTheDocument();
      expect(screen.getByText('New Name')).toBeInTheDocument();
    });
  });

  it('failed save (null response) reverts to previous values and exits edit mode', async () => {
    vi.mocked(utils.updateUserProfile).mockResolvedValueOnce(null);
    await renderEditing();
    const input = screen.getByDisplayValue('Test User');
    await userEvent.clear(input);
    await userEvent.type(input, 'Bad Name');
    await userEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(screen.queryByText('Editing Profile')).not.toBeInTheDocument());
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('Cancel reverts to pre-edit values and exits edit mode', async () => {
    await renderEditing();
    const input = screen.getByDisplayValue('Test User');
    await userEvent.clear(input);
    await userEvent.type(input, 'Typed Something');
    await userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Editing Profile')).not.toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
