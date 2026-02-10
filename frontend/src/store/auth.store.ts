import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (credentials) => {
    const { data } = await api.post('/auth/register', credentials);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  checkAuth: async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data, isAuthenticated: true });
        } catch (err) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false });
        }
      }
  }
}));
