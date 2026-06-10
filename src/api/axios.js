import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080';
export const AUTH_STORAGE_KEY = 'imobsys:auth';
export const USER_STORAGE_KEY = 'imobsys:user';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  if (!config.skipAuth) {
    const auth = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (auth) {
      config.headers.Authorization = auth;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isPrivateRequest = !error?.config?.skipAuth;

    if (status === 401 && isPrivateRequest) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);

      if (window.location.pathname !== '/') {
        window.location.assign('/');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
