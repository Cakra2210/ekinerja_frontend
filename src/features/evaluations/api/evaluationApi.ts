import { api } from "@/shared/api/client";
import {
  ApiResponse,
  Evaluation,
  EvaluationPayload,
  RankingItem
} from "@/shared/types";

export const fetchEvaluations = async () => {
  const response = await api.get<ApiResponse<Evaluation[]>>("/evaluations");
  return response.data.data;
};

export const createEvaluation = async (payload: EvaluationPayload) => {
  const response = await api.post<ApiResponse<Evaluation>>("/evaluations", payload);
  return response.data;
};

export const fetchRankings = async () => {
  const response = await api.get<ApiResponse<RankingItem[]>>("/rankings");
  return response.data.data;
};
