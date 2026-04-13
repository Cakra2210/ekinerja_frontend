import { api } from "@/shared/api/client";
import { ApiResponse, Employee, EmployeePayload } from "@/shared/types";

export const fetchEmployees = async () => {
  const response = await api.get<ApiResponse<Employee[]>>("/employees");
  return response.data.data;
};

export const createEmployee = async (payload: EmployeePayload) => {
  const response = await api.post<ApiResponse<Employee>>("/employees", payload);
  return response.data;
};

export const updateEmployee = async (id: number, payload: EmployeePayload) => {
  const response = await api.put<ApiResponse<null>>(`/employees/${id}`, payload);
  return response.data;
};

export const deleteEmployee = async (id: number) => {
  const response = await api.delete<ApiResponse<null>>(`/employees/${id}`);
  return response.data;
};
