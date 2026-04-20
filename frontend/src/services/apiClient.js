import axios from "axios";
import { AUTH_STORAGE_KEY, removeStorage } from "../utils/authStorage";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return config;
  }

  try {
    const auth = JSON.parse(raw);

    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }

    if (auth?.id) {
      config.headers["X-User-Id"] = auth.id;
    }
  } catch {
    removeStorage(AUTH_STORAGE_KEY);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      removeStorage(AUTH_STORAGE_KEY);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
