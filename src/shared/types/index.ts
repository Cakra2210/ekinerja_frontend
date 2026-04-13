export type DashboardTotals = {
  totalEmployees: number;
  totalEvaluations: number;
  averageScore: number;
};

export type DashboardTopEmployee = {
  id: number;
  nip: string;
  full_name: string;
  position: string;
  department: string;
  average_score: number;
};

export type DashboardDepartmentSummary = {
  department: string;
  total_employees: number;
  average_score: number;
};

export type DashboardResponse = {
  totals: DashboardTotals;
  topEmployees: DashboardTopEmployee[];
  departmentSummary: DashboardDepartmentSummary[];
};

export type Department = {
  id: number;
  name: string;
};

export type Position = {
  id: number;
  name: string;
  totalPositions: number;
  createdAt?: string;
};

export type PositionPayload = {
  name: string;
  totalPositions: number;
};

export type WorkUnitProfile = {
  id: number;
  workUnitName: string;
  satkerCode: string;
  address: string;
  city: string;
  regency: string;
  province: string;
  postalCode: string;
  headEmployeeId: number | null;
  headName: string;
  commitmentOfficerEmployeeId: number | null;
  commitmentOfficerName: string;
  dipaNumber: string;
  dipaDate: string;
  website: string;
  email: string;
  phone: string;
  updatedAt?: string;
};

export type WorkUnitProfilePayload = {
  workUnitName: string;
  satkerCode: string;
  address: string;
  city: string;
  regency: string;
  province: string;
  postalCode: string;
  headEmployeeId: number | null;
  headName?: string;
  commitmentOfficerEmployeeId: number | null;
  commitmentOfficerName?: string;
  dipaNumber: string;
  dipaDate: string;
  website: string;
  email: string;
  phone: string;
};

export type Period = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
};

export type Criterion = {
  id: number;
  code: string;
  name: string;
  weight: number;
};

export type AccountRole = "admin" | "supervisor" | "operator" | "user";

export type Employee = {
  id: number;
  nip: string;
  fullName: string;
  positionId?: number | null;
  positionName?: string | null;
  position: string;
  employmentStatus: "PNS" | "CPNS" | "PPPK" | string;
  activeStatus: "aktif" | "tidak_aktif" | string;
  joinDate?: string | null;
  exitDate?: string | null;
  effectiveDate?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  accountRole?: AccountRole | null;
  accountUsername?: string | null;
  accountActive?: number | boolean | null;
};

export type EmployeePayload = {
  fullName: string;
  nip: string;
  positionId: number;
  employmentStatus: "PNS" | "CPNS" | "PPPK";
  activeStatus: "aktif" | "tidak_aktif";
  effectiveDate: string;
  username: string;
  password: string;
  role: AccountRole;
};

export type UserAccount = {
  id: number;
  employeeId: number;
  fullName: string;
  nip: string;
  position: string;
  departmentName: string;
  username: string;
  role: AccountRole;
  isActive: boolean;
  createdAt: string;
};

export type AccountPayload = {
  employeeId: number;
  username: string;
  password: string;
  role: AccountRole;
  isActive: boolean;
};

export type Evaluation = {
  id: number;
  employeeId: number;
  employeeName: string;
  nip: string;
  departmentName: string;
  periodId: number;
  periodName: string;
  evaluatorName: string;
  teamwork: number;
  discipline: number;
  productivity: number;
  initiative: number;
  communication: number;
  finalScore: number;
  note: string;
  createdAt: string;
};

export type EvaluationPayload = {
  employeeId: number;
  periodId: number;
  evaluatorName: string;
  teamwork: number;
  discipline: number;
  productivity: number;
  initiative: number;
  communication: number;
  note: string;
};

export type RankingItem = {
  rank: number;
  id: number;
  nip: string;
  fullName: string;
  position: string;
  departmentName: string;
  averageScore: number;
  totalEvaluations: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};


export type AttendanceAssessment = {
  id: number;
  employeeId: number;
  employeeName: string;
  nip: string;
  position: string;
  assessmentYear: number;
  assessmentMonth: number;
  monthLabel: string;
  quarterNumber: number;
  quarterLabel: string;
  attendanceDays: number;
  tl1Count: number;
  tl2Count: number;
  tl3Count: number;
  tl4Count: number;
  psw1Count: number;
  psw2Count: number;
  psw3Count: number;
  psw4Count: number;
  totalPenaltyIndex: number;
  monthlyScore: number;
  quarterScore: number;
  totalInfractions: number;
  note: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AttendanceAssessmentPayload = {
  employeeId: number;
  assessmentYear: number;
  assessmentMonth: number;
  attendanceDays: number;
  tl1Count: number;
  tl2Count: number;
  tl3Count: number;
  tl4Count: number;
  psw1Count: number;
  psw2Count: number;
  psw3Count: number;
  psw4Count: number;
  note: string;
};

export type AttendanceAssessmentMeta = {
  indexWeights?: Record<string, number>;
};


export type CompetencyDevelopmentActivity = {
  id: number;
  employeeId: number;
  employeeName: string;
  nip: string;
  position: string;
  activityName: string;
  activityType: string;
  activityDate: string;
  startDate: string;
  endDate: string;
  activityYear: number;
  activityQuarter: number;
  activityRole: "narasumber" | "peserta";
  learningHours: number;
  roleIndex: number;
  equivalentHours: number;
  invitationOriginalName?: string | null;
  invitationFilePath?: string | null;
  invitationFileUrl?: string | null;
  certificateOriginalName?: string | null;
  certificateFilePath?: string | null;
  certificateFileUrl?: string | null;
  note: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CompetencyDevelopmentPayload = {
  employeeId: number;
  activityName: string;
  activityType: string;
  startDate: string;
  endDate: string;
  activityRole: "narasumber" | "peserta";
  learningHours: number;
  invitationFile?: File | null;
  certificateFile?: File | null;
  note: string;
};

export type CompetencyDevelopmentRecap = {
  employeeId: number;
  employeeName: string;
  nip: string;
  position: string;
  activeStatus: string;
  activityCount: number;
  actualHours: number;
  equivalentHours: number;
  narasumberCount: number;
  pesertaCount: number;
  quarterScore: number;
  remainingHours: number;
  lastActivityDate?: string | null;
};

export type CompetencyDevelopmentMeta = {
  quarterTargetHours: number;
  roleIndexes: Record<string, number>;
};
