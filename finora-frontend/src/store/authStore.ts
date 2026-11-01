import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  currency: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  setAuth: (user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      setAuth: (user) => set({ isAuthenticated: true, user }),
      setUser: (user) => set({ isAuthenticated: !!user, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'finora-auth',
      // Strict security rule: Never store tokens in localStorage/persist middleware
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user
          ? {
              id: state.user.id,
              name: state.user.name,
              currency: state.user.currency,
              email: state.user.email,
            }
          : null,
      }),
    }
  )
);
