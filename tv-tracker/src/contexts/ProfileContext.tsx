import { createContext } from 'react';
import { ProfileInfo } from '../types';

export const ProfileContext = createContext<ProfileInfo | null>(null);
