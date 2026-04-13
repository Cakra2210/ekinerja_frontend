import type { AuthSession } from "@/features/auth/api/authApi";

const STORAGE_KEY = "employee-performance-auth";

export const getStoredAuthSession = (): AuthSession | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as AuthSession | null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_error) {
    return null;
  }
};

export const storeAuthSession = (value: AuthSession) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

export const clearStoredAuthSession = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};

export const isStoredSessionExpired = (expiresAt?: string) => {
  if (!expiresAt) {
    return false;
  }

  const expiresAtTime = new Date(expiresAt).getTime();
  return Number.isFinite(expiresAtTime) && expiresAtTime <= Date.now();
};
