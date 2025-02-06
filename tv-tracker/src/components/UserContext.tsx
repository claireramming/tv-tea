import { createContext } from 'react';

export type User = {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
  isAuthenticated?: boolean;
}
export const UserContext = createContext({});