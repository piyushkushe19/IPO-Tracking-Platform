import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please slow down.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject({ ...error, message });
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
};

// ─── IPOs ─────────────────────────────────────────────────────────────────────
export const ipoService = {
  getAll: (params) => api.get('/ipos', { params }),
  getById: (id) => api.get(`/ipos/${id}`),
  getStats: () => api.get('/ipos/stats'),
  getMarketOverview: () => api.get('/ipos/market-overview'),
  getLiveUpdates: () => api.get('/ipos/live-updates'),
  toggleWatchlist: (ipoId) => api.post(`/ipos/${ipoId}/watchlist`),
};

// ─── Portfolio ────────────────────────────────────────────────────────────────
export const portfolioService = {
  getAll: () => api.get('/portfolio'),
  getStats: () => api.get('/portfolio/stats'),
  add: (data) => api.post('/portfolio', data),
  update: (id, data) => api.patch(`/portfolio/${id}`, data),
  remove: (id) => api.delete(`/portfolio/${id}`),
};

export default api;
