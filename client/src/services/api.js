import axios from 'axios';
import {
  clearAuthData,
  getStoredCsrfToken,
  getStoredToken,
  setAuthData,
} from '../utils/storage';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    const csrfToken = getStoredCsrfToken();
    if (csrfToken) config.headers['X-CSRF-Token'] = csrfToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/register') || original?.url?.includes('/auth/refresh');

    if (error.response?.status !== 401 || original?._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post('/auth/refresh', null, {
            headers: { 'X-CSRF-Token': getStoredCsrfToken() || '' },
          })
          .then(({ data }) => {
            setAuthData(data.accessToken || data.token, data.user, data.csrfToken);
            return data.accessToken || data.token;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const accessToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      clearAuthData();
      window.dispatchEvent(new CustomEvent('smartquiz:session-expired'));
      return Promise.reject(refreshError);
    }
  }
);

export default api;
