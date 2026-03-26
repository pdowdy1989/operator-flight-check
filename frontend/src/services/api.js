import axios from "axios";
import { AUTH_STORAGE_KEY, readJsonStorage } from "../utils/authStorage";

// Central axios instance with JWT interceptor
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const auth = readJsonStorage(AUTH_STORAGE_KEY, null);
  if (auth?.token) {
    config.headers["Authorization"] = `Bearer ${auth.token}`;
  }
  if (auth?.id) {
    config.headers["X-User-Id"] = auth.id;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return Promise.reject(err);
  }
);

export default api;
