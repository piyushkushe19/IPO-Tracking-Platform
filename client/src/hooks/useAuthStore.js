import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authService.register(data);
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          toast.success(`Welcome, ${user.name}!`);
          return true;
        } catch (err) {
          set({ isLoading: false });
          toast.error(err.message || 'Registration failed');
          return false;
        }
      },

      login: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authService.login(data);
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          toast.success(`Welcome back, ${user.name}!`);
          return true;
        } catch (err) {
          set({ isLoading: false });
          toast.error(err.message || 'Login failed');
          return false;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (_) {}
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
        toast.success('Logged out successfully');
      },

      refreshUser: async () => {
        try {
          const res = await authService.getMe();
          set({ user: res.data.user, isAuthenticated: true });
        } catch (_) {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      updateUser: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),
    }),
    {
      name: 'ipo-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
