import { api } from "@/shared/api/client";

export type BerakhlakEvaluation = {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeNip: string;
  evaluatorEmployeeId: number;
  evaluatorName: string;
  evaluatorNip: string;
  evaluationYear: number;
  evaluationMonth: number;
  pelayananResponsif: number;
  pelayananRamah: number;
  pelayananSolutif: number;
  akuntabelProsedur: number;
  akuntabelTransparansi: number;
  akuntabelTanggungJawab: number;
  kompetenPenguasaan: number;
  kompetenPenyelesaian: number;
  kompetenPengembangan: number;
  harmonisTim: number;
  harmonisRelasi: number;
  harmonisLingkungan: number;
  loyalKomitmen: number;
  loyalAturan: number;
  loyalDedikasi: number;
  adaptifPerubahan: number;
  adaptifFleksibilitas: number;
  adaptifBelajar: number;
  kolaboratifKerjaSama: number;
  kolaboratifDiskusi: number;
  kolaboratifKoordinasi: number;
  pelayananAvg: number;
  akuntabelAvg: number;
  kompetenAvg: number;
  harmonisAvg: number;
  loyalAvg: number;
  adaptifAvg: number;
  kolaboratifAvg: number;
  finalScore: number;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type BerakhlakEmployeeScore = {
  employeeId: number;
  fullName: string;
  nip: string;
  evaluationYear?: number;
  evaluationMonth?: number;
  periodLabel?: string;
  averageScore: number;
  totalEvaluations: number;
  lastEvaluatedAt: string | null;
};

export type BerakhlakDimensionAverage = {
  key: string;
  label: string;
  value: number;
};

export type BerakhlakMonthlySummary = {
  label: string;
  totalEvaluations: number;
  averageScore: number;
};

export type BerakhlakDashboard = {
  selectedYear?: number | null;
  selectedMonth?: number | null;
  selectedEmployeeId?: number | null;
  totalEvaluations: number;
  totalEmployeesEvaluated: number;
  averageScore: number;
  activeMonthCount: number;
  dimensionAverages: BerakhlakDimensionAverage[];
  employeeScores: BerakhlakEmployeeScore[];
  monthlySummary: BerakhlakMonthlySummary[];
  latestEvaluations: BerakhlakEvaluation[];
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type BerakhlakPayload = {
  employeeId: number;
  evaluatorEmployeeId: number;
  evaluationYear: number;
  evaluationMonth: number;
  pelayananResponsif: number;
  pelayananRamah: number;
  pelayananSolutif: number;
  akuntabelProsedur: number;
  akuntabelTransparansi: number;
  akuntabelTanggungJawab: number;
  kompetenPenguasaan: number;
  kompetenPenyelesaian: number;
  kompetenPengembangan: number;
  harmonisTim: number;
  harmonisRelasi: number;
  harmonisLingkungan: number;
  loyalKomitmen: number;
  loyalAturan: number;
  loyalDedikasi: number;
  adaptifPerubahan: number;
  adaptifFleksibilitas: number;
  adaptifBelajar: number;
  kolaboratifKerjaSama: number;
  kolaboratifDiskusi: number;
  kolaboratifKoordinasi: number;
  note: string;
};

export const fetchBerakhlakEvaluations = async () => {
  const response = await api.get<ApiResponse<BerakhlakEvaluation[]>>(
    "/berakhlak-360/evaluations"
  );
  return response.data.data;
};

export const createBerakhlakEvaluation = async (payload: BerakhlakPayload) => {
  const response = await api.post<ApiResponse<BerakhlakEvaluation>>(
    "/berakhlak-360/evaluations",
    payload
  );
  return response.data;
};

export const updateBerakhlakEvaluation = async (
  id: number,
  payload: BerakhlakPayload
) => {
  const response = await api.put<ApiResponse<BerakhlakEvaluation>>(
    `/berakhlak-360/evaluations/${id}`,
    payload
  );
  return response.data;
};

type BerakhlakDashboardParams = {
  year?: number;
  month?: number;
  employeeId?: number;
};

export const fetchBerakhlakDashboard = async (params?: BerakhlakDashboardParams) => {
  const response = await api.get<ApiResponse<BerakhlakDashboard>>(
    "/berakhlak-360/dashboard",
    {
      params: {
        year: params?.year,
        month: params?.month,
        employeeId: params?.employeeId
      }
    }
  );
  return response.data.data;
};
