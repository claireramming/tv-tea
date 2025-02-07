import { createContext } from 'react';

export type User = {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
  isAuthenticated?: boolean;
  accessToken?: string;
}
export const UserContext = createContext({});