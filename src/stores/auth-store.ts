import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { mockUsers } from '@/data/mock-data';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (email: string, password: string): boolean => {
        // Mock authentication: match by email; password is accepted as long as
        // it is non-empty (no real secret is stored in mock data).
        const found = mockUsers.find(
          (u) => u.email === email && password.length > 0,
        );
        if (found) {
          set({ user: found, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'meridian-auth',
    },
  ),
);
