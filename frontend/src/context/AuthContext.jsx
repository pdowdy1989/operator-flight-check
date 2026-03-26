import { createContext, useContext, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { AUTH_STORAGE_KEY, readJsonStorage } from "../utils/authStorage";
const AuthContext = createContext(null);

function readStoredAuth() {
  return readJsonStorage(AUTH_STORAGE_KEY, null);
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => readStoredAuth());

  const value = useMemo(
    () => ({
      user: authState,
      isAuthenticated: Boolean(authState),
      login: async (credentials) => {
        const nextUser = await authService.login(credentials);
        setAuthState(nextUser);
        return nextUser;
      },
      register: async (details) => {
        const nextUser = await authService.register(details);
        setAuthState(nextUser);
        return nextUser;
      },
      logout: () => {
        authService.logout();
        setAuthState(null);
      },
    }),
    [authState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
