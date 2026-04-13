import { api } from "@/shared/api/client";

export type LoginUser = {
  accountId: number;
  employeeId: number;
  fullName: string;
  nip: string;
  username: string;
  role: "admin" | "supervisor" | "operator" | "user";
  isActive: boolean;
  mustChangePassword: boolean;
};

export type AuthSession = {
  user: LoginUser;
  token: string;
  expiresAt: string;
  mustChangePassword: boolean;
};

type AuthResponse = {
  success: boolean;
  message?: string;
  data: AuthSession;
};

export const loginRequest = async (payload: {
  username: string;
  password: string;
}) => {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return response.data;
};

export const getCurrentSession = async () => {
  const response = await api.get<AuthResponse>("/auth/me");
  return response.data;
};

export const changePasswordRequest = async (payload: {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await api.post<AuthResponse>("/auth/change-password", payload);
  return response.data;
};
