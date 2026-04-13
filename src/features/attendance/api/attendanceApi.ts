import { api } from "@/shared/api/client";
import {
  ApiResponse,
  AttendanceAssessment,
  AttendanceAssessmentPayload,
  AttendanceAssessmentMeta
} from "@/shared/types";

export type AttendanceAssessmentQuery = {
  year?: number;
  month?: number;
  employeeId?: number;
};

type AttendanceAssessmentCollection = {
  records?: AttendanceAssessment[];
  meta?: AttendanceAssessmentMeta;
};

const monthLabels = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];

const normalizeAttendanceRecord = (
  record: Partial<AttendanceAssessment>
): AttendanceAssessment => {
  const assessmentMonth = Number(record.assessmentMonth || 0);
  const tl1Count = Number(record.tl1Count || 0);
  const tl2Count = Number(record.tl2Count || 0);
  const tl3Count = Number(record.tl3Count || 0);
  const tl4Count = Number(record.tl4Count || 0);
  const psw1Count = Number(record.psw1Count || 0);
  const psw2Count = Number(record.psw2Count || 0);
  const psw3Count = Number(record.psw3Count || 0);
  const psw4Count = Number(record.psw4Count || 0);
  const totalPenaltyIndex = Number(record.totalPenaltyIndex || 0);
  const monthlyScore = Number(record.monthlyScore || 0);
  const quarterNumber =
    Number(record.quarterNumber || 0) || Math.max(1, Math.ceil(Math.max(assessmentMonth, 1) / 3));

  return {
    id: Number(record.id || 0),
    employeeId: Number(record.employeeId || 0),
    employeeName: record.employeeName || "",
    nip: record.nip || "",
    position: record.position || "",
    assessmentYear: Number(record.assessmentYear || 0),
    assessmentMonth,
    monthLabel: record.monthLabel || monthLabels[assessmentMonth] || `Bulan ${assessmentMonth}`,
    quarterNumber,
    quarterLabel: record.quarterLabel || `Triwulan ${quarterNumber}`,
    attendanceDays: Number(record.attendanceDays || 0),
    tl1Count,
    tl2Count,
    tl3Count,
    tl4Count,
    psw1Count,
    psw2Count,
    psw3Count,
    psw4Count,
    totalPenaltyIndex,
    monthlyScore,
    quarterScore: Number(record.quarterScore || monthlyScore),
    totalInfractions:
      Number(record.totalInfractions || 0) ||
      tl1Count + tl2Count + tl3Count + tl4Count + psw1Count + psw2Count + psw3Count + psw4Count,
    note: record.note || "",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
};

export const fetchAttendanceAssessments = async (query: AttendanceAssessmentQuery = {}) => {
  const response = await api.get<
    ApiResponse<AttendanceAssessment[] | AttendanceAssessmentCollection> & {
      meta?: AttendanceAssessmentMeta;
    }
  >("/attendance-assessments", {
    params: query
  });

  const payload = response.data.data;
  const isArrayPayload = Array.isArray(payload);

  const rawRecords = isArrayPayload ? payload : payload?.records || [];
  const meta = isArrayPayload ? response.data.meta : payload?.meta || response.data.meta;

  return {
    data: rawRecords.map(normalizeAttendanceRecord),
    meta
  };
};

export const saveAttendanceAssessment = async (payload: AttendanceAssessmentPayload) => {
  const response = await api.post<ApiResponse<AttendanceAssessment>>(
    "/attendance-assessments",
    payload
  );

  return response.data;
};