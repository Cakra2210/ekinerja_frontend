import axios from "axios";
import { clearStoredAuthSession, getStoredAuthSession, isStoredSessionExpired } from "@/shared/auth/sessionStorage";
const baseURL = "https://ekinerja.bpsluwu/api";

export const api = axios.create({
  baseURL
});

api.interceptors.request.use((config) => {
  const session = getStoredAuthSession();

  if (session?.token && !isStoredSessionExpired(session.expiresAt)) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredAuthSession();
    }

    return Promise.reject(error);
  }
);
