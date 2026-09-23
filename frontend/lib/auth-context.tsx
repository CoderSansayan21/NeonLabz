'use client';

import { createContext, useContext } from 'react';
import { ApiUser } from './api';

export interface AuthContextValue {
  user: ApiUser;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within the dashboard AuthContext');
  }
  return ctx;
}