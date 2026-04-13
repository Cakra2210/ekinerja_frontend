import { api } from "@/shared/api/client";
import {
  ApiResponse,
  Criterion,
  Department,
  Period,
  Position,
  PositionPayload,
  WorkUnitProfile,
  WorkUnitProfilePayload
} from "@/shared/types";

export const fetchDepartments = async () => {
  const response = await api.get<ApiResponse<Department[]>>("/departments");
  return response.data.data;
};

export const fetchCriteria = async () => {
  const response = await api.get<ApiResponse<Criterion[]>>("/criteria");
  return response.data.data;
};

export const fetchPeriods = async () => {
  const response = await api.get<ApiResponse<Period[]>>("/periods");
  return response.data.data;
};

export const fetchPositions = async () => {
  const response = await api.get<ApiResponse<Position[]>>("/positions");
  return response.data.data;
};

export const createPosition = async (payload: PositionPayload) => {
  const response = await api.post<ApiResponse<Position>>("/positions", payload);
  return response.data.data;
};

export const updatePosition = async (id: number, payload: PositionPayload) => {
  const response = await api.put<ApiResponse<null>>(`/positions/${id}`, payload);
  return response.data;
};

export const deletePosition = async (id: number) => {
  const response = await api.delete<ApiResponse<null>>(`/positions/${id}`);
  return response.data;
};

export const fetchWorkUnitProfile = async () => {
  const response = await api.get<ApiResponse<WorkUnitProfile | null>>(
    "/work-unit-profile"
  );
  return response.data.data;
};

export const saveWorkUnitProfile = async (payload: WorkUnitProfilePayload) => {
  const response = await api.put<ApiResponse<WorkUnitProfile>>(
    "/work-unit-profile",
    payload
  );
  return response.data.data;
};
