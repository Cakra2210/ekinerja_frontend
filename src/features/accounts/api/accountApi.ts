import { api } from "@/shared/api/client";
import { AccountPayload, ApiResponse, UserAccount } from "@/shared/types";

export const fetchAccounts = async () => {
  const response = await api.get<ApiResponse<UserAccount[]>>("/accounts");
  return response.data.data;
};

export const createAccount = async (payload: AccountPayload) => {
  const response = await api.post<ApiResponse<UserAccount>>("/accounts", payload);
  return response.data;
};

export const updateAccount = async (id: number, payload: AccountPayload) => {
  const response = await api.put<ApiResponse<null>>(`/accounts/${id}`, payload);
  return response.data;
};

export const deleteAccount = async (id: number) => {
  const response = await api.delete<ApiResponse<null>>(`/accounts/${id}`);
  return response.data;
};
