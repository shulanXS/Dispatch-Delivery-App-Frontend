import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';
import { useOrderStore } from './useOrderStore';
import { useCartStore } from './useCartStore';

// Holds JWT + current user; persists across reloads.
// Cleared by apiClient 401 handler when token expires.
export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null, // { id, name, email, address }

      async login(email, password) {
        const { token, user } = await authApi.login(email, password);
        if (get().user?.id && get().user.id !== user.id) {
          useOrderStore.getState().clear();
          useCartStore.getState().clearCart();
        }
        set({ token, user });
        return user;
      },

      async register(payload) {
        const { token, user } = await authApi.register(payload);
        if (get().user?.id && get().user.id !== user.id) {
          useOrderStore.getState().clear();
          useCartStore.getState().clearCart();
        }
        set({ token, user });
        return user;
      },

      setUser(user) {
        const prev = get().user;
        if (prev?.id && user?.id && prev.id !== user.id) {
          useOrderStore.getState().clear();
          useCartStore.getState().clearCart();
        }
        set({ user });
      },

      logout() {
        useOrderStore.getState().clear();
        useCartStore.getState().clearCart();
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
