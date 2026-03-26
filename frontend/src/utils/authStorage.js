export const AUTH_STORAGE_KEY = "operator-flight-check-auth";
export const USERS_STORAGE_KEY = "operator-flight-check-users";
export const DEMO_USER_ID = "11111111-1111-1111-1111-111111111111";

export function readJsonStorage(key, fallback = null) {
  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

export function writeJsonStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorage(key) {
  window.localStorage.removeItem(key);
}
