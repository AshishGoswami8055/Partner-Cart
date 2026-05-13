import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let accessTokenRef = null;
let onUnauthorized = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessTokenRef = token;
};

export const getAccessToken = () => accessTokenRef;

export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

apiClient.interceptors.request.use((config) => {
  if (accessTokenRef) {
    config.headers.Authorization = `Bearer ${accessTokenRef}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/register')
    ) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = apiClient
            .post('/auth/refresh')
            .then((res) => {
              const token = res.data?.data?.accessToken;
              if (token) setAccessToken(token);
              return token;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const token = await refreshPromise;
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        }
      } catch (e) {
        accessTokenRef = null;
        onUnauthorized?.();
      }
    }
    return Promise.reject(error);
  }
);

export const unwrap = (res) => res.data?.data;
export const unwrapMeta = (res) => ({ data: res.data?.data, meta: res.data?.meta });
