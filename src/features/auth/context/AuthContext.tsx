import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { isAxiosError } from "axios";
import {
  AuthSession,
  LoginUser,
  changePasswordRequest,
  getCurrentSession,
  loginRequest
} from "@/features/auth/api/authApi";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  isStoredSessionExpired,
  storeAuthSession
} from "@/shared/auth/sessionStorage";

type AuthContextValue = {
  user: LoginUser | null;
  session: AuthSession | null;
  mustChangePassword: boolean;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (username: string, password: string) => Promise<AuthSession>;
  logout: () => void;
  changePassword: (
    currentPassword: string | undefined,
    newPassword: string,
    confirmPassword: string
  ) => Promise<AuthSession>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeError = (error: unknown, fallbackMessage: string) => {
  if (isAxiosError(error)) {
    return new Error(String(error.response?.data?.message || fallbackMessage));
  }

  return error instanceof Error ? error : new Error(fallbackMessage);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  const applySession = (nextSession: AuthSession | null) => {
    setSession(nextSession);

    if (nextSession) {
      storeAuthSession(nextSession);
      return;
    }

    clearStoredAuthSession();
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedSession = getStoredAuthSession();

        if (!storedSession) {
          applySession(null);
          return;
        }

        if (isStoredSessionExpired(storedSession.expiresAt)) {
          applySession(null);
          return;
        }

        applySession(storedSession);

        try {
          const refreshed = await getCurrentSession();
          applySession(refreshed.data);
        } catch (_error) {
          applySession(storedSession);
        }
      } finally {
        setIsReady(true);
      }
    };

    void bootstrap();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const result = await loginRequest({ username, password });
      applySession(result.data);
      return result.data;
    } catch (error) {
      throw normalizeError(error, "Login gagal diproses");
    }
  };

  const logout = () => {
    applySession(null);
  };

  const changePassword = async (
    currentPassword: string | undefined,
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      const result = await changePasswordRequest({
        currentPassword,
        newPassword,
        confirmPassword
      });

      applySession(result.data);
      return result.data;
    } catch (error) {
      throw normalizeError(error, "Gagal memperbarui password");
    }
  };

  const refreshSession = async () => {
    try {
      const result = await getCurrentSession();
      applySession(result.data);
    } catch (error) {
      applySession(null);
      throw normalizeError(error, "Gagal memperbarui sesi login");
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user || null,
      session,
      mustChangePassword: Boolean(session?.mustChangePassword),
      isAuthenticated: Boolean(session?.user),
      isReady,
      login,
      logout,
      changePassword,
      refreshSession
    }),
    [session, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider");
  }

  return context;
};
