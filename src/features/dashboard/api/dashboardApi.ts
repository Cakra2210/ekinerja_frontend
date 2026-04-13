import { api } from "@/shared/api/client";
import { ApiResponse, DashboardResponse } from "@/shared/types";

export const fetchDashboard = async () => {
  const response = await api.get<ApiResponse<DashboardResponse>>("/dashboard");
  return response.data.data;
};
