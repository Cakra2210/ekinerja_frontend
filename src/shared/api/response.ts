import { ApiResponse } from "@/shared/types";

export const unwrapApiData = <T>(response: ApiResponse<T>) => response.data;
