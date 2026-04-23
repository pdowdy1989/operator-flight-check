import { apiClient } from "./apiClient";
import {
  AUTH_STORAGE_KEY,
  readJsonStorage,
  removeStorage,
  writeJsonStorage,
} from "../utils/authStorage";

function persistSession(session) {
  writeJsonStorage(AUTH_STORAGE_KEY, session);
  return session;
}

function mapAuthResponse(payload) {
  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    token: payload.token,
  };
}

export const authService = {
  async login(credentials) {
    const loginUrl = `${(apiClient.defaults.baseURL ?? "").replace(/\/+$/, "")}/auth/login`;
    console.log("LOGIN REQUEST:", loginUrl, {
      email: credentials?.email,
    });

    try {
      const response = await apiClient.post("/auth/login", credentials);
      return persistSession(mapAuthResponse(response.data));
    } catch (error) {
      console.log("LOGIN ERROR:", error);

      if (error?.response) {
        console.log("LOGIN ERROR RESPONSE:", {
          status: error.response.status,
          data: error.response.data,
          message: error.message,
        });

        const backendMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          error.message;

        throw new Error(backendMessage || "Login failed");
      }

      if (error?.request) {
        console.log("LOGIN ERROR REQUEST: request made but no response received");
        throw new Error("Login failed");
      }

      console.log("LOGIN ERROR GENERIC:", error?.message || error);
      throw new Error(error?.message || "Login failed");
    }
  },

  async register(details) {
    const response = await apiClient.post("/auth/register", details);
    return persistSession(mapAuthResponse(response.data));
  },

  async me() {
    const stored = readJsonStorage(AUTH_STORAGE_KEY, null);

    if (!stored?.token) {
      return null;
    }

    const response = await apiClient.get("/auth/me");
    return {
      ...stored,
      id: response.data.id,
      email: response.data.email,
      role: response.data.role,
    };
  },

  logout() {
    removeStorage(AUTH_STORAGE_KEY);
  },

  getStoredSession() {
    return readJsonStorage(AUTH_STORAGE_KEY, null);
  },
};
