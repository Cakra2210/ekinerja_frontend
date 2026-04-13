import type { AuthSession } from "@/features/auth/api/authApi";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  storeAuthSession
} from "@/shared/auth/sessionStorage";

export type StoredSession = {
  token?: string;
  expiresAt?: string;
  mustChangePassword?: boolean;
  user?: unknown;
};

export const STORAGE_KEY = "employee-performance-auth";

type LegacyStoredAuthSession = {
  user?: unknown;
  session?: {
    token?: string;
    expiresAt?: string;
    mustChangePassword?: boolean;
  };
};

const isLegacyStoredAuthSession = (
  value: AuthSession | LegacyStoredAuthSession
): value is LegacyStoredAuthSession => {
  return typeof value === "object" && value !== null && "session" in value;
};

export const readStoredSession = (): StoredSession | null => {
  const stored = getStoredAuthSession() as AuthSession | LegacyStoredAuthSession | null;

  if (!stored) {
    return null;
  }

  if (isLegacyStoredAuthSession(stored)) {
    return {
      token: stored.session?.token,
      expiresAt: stored.session?.expiresAt,
      mustChangePassword: stored.session?.mustChangePassword,
      user: stored.user
    };
  }

  return {
    token: stored.token,
    expiresAt: stored.expiresAt,
    mustChangePassword: stored.mustChangePassword,
    user: stored.user
  };
};

export const writeStoredSession = (session: StoredSession) => {
  if (!session.user || !session.token || !session.expiresAt) {
    clearStoredAuthSession();
    return;
  }

  storeAuthSession({
    user: session.user as AuthSession["user"],
    token: session.token,
    expiresAt: session.expiresAt,
    mustChangePassword: Boolean(session.mustChangePassword)
  });
};

export const clearStoredSession = () => {
  clearStoredAuthSession();
};

export const isSessionExpired = (expiresAt?: string) => {
  if (!expiresAt) {
    return false;
  }

  const expiresAtTime = new Date(expiresAt).getTime();
  return Number.isFinite(expiresAtTime) && expiresAtTime <= Date.now();
};
