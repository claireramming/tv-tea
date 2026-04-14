import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { UserContext, User } from '../contexts/UserContext';

export const mockUser: User = {
  sub: 'auth0|testuser123',
  name: 'Test User',
  email: 'test@example.com',
  picture: 'https://example.com/pic.jpg',
  isAuthenticated: true,
  accessToken: 'test-token',
};

export function renderWithUser(ui: ReactElement, user: User | null = mockUser) {
  return render(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <UserContext.Provider value={user as any}>
      {ui}
    </UserContext.Provider>
  );
}
