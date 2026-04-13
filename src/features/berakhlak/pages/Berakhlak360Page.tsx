import { CSSProperties, FormEvent, useEffect, useMemo, useState } from "react";
import { fetchEmployees } from "@/features/employees/api/employeeApi";
import {
  BerakhlakDashboard,
  BerakhlakEvaluation,
  BerakhlakPayload,
  createBerakhlakEvaluation,
  fetchBerakhlakDashboard,
  fetchBerakhlakEvaluations,
  updateBerakhlakEvaluation
} from "@/features/berakhlak/api/berakhlakApi";
import { Badge } from "@/shared/components/Badge";
import { DataTable } from "@/shared/components/DataTable";
import { SectionHeader } from "@/shared/components/SectionHeader";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Employee } from "@/shared/types";
import { formatDate, formatNumber, getScoreLabel } from "@/shared/utils/format";
import "@/shared/styles/employee-management-insights.css";

type TabKey = "form" | "recap" | "dashboard" | "progress";

type QuestionFieldKey =
  | "pelayananResponsif"
  | "pelayananRamah"
  | "pelayananSolutif"
  | "akuntabelProsedur"
  | "akuntabelTransparansi"
  | "akuntabelTanggungJawab"
  | "kompetenPenguasaan"
  | "kompetenPenyelesaian"
  | "kompetenPengembangan"
  | "harmonisTim"
  | "harmonisRelasi"
  | "harmonisLingkungan"
  | "loyalKomitmen"
  | "loyalAturan"
  | "loyalDedikasi"
  | "adaptifPerubahan"
  | "adaptifFleksibilitas"
  | "adaptifBelajar"
  | "kolaboratifKerjaSama"
  | "kolaboratifDiskusi"
  | "kolaboratifKoordinasi";

type QuestionItem = {
  key: QuestionFieldKey;
  label: string;
};

type QuestionGroup = {
  key: string;
  label: string;
  icon: string;
  questions: QuestionItem[];
};


type DashboardTopTableSortKey =
  | "label"
  | "pelayanan"
  | "akuntabel"
  | "kompeten"
  | "harmonis"
  | "loyal"
  | "adaptif"
  | "kolaboratif"
  | "averageScore"
  | "evaluationCount";

type DashboardTopTableRow = {
  rowKey: string;
  label: string;
  sublabel: string;
  evaluationYear?: number;
  evaluationMonth?: number;
  pelayanan: number;
  akuntabel: number;
  kompeten: number;
  harmonis: number;
  loyal: number;
  adaptif: number;
  kolaboratif: number;
  averageScore: number;
  evaluationCount: number;
  lastEvaluatedAt: string | null;
};

type ReviewerProgressTone = "danger" | "warning" | "caution" | "success";

type ReviewerProgressRow = {
  evaluatorEmployeeId: number;
  evaluatorName: string;
  evaluatorNip: string;
  completedCount: number;
  targetCount: number;
  percentage: number;
  latestCreatedAt: string | null;
};

const DEFAULT_SCORE = 50;
const now = new Date();
const defaultYear = now.getFullYear();
const defaultMonth = now.getMonth() + 1;

const ALL_MONTH_VALUE = 0;
const ALL_EMPLOYEE_VALUE = 0;

const MONTH_OPTIONS = [
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

const questionGroups: QuestionGroup[] = [
  {
    key: "pelayanan",
    label: "Berorientasi Pelayanan",
    icon: "B",
    questions: [
      { key: "pelayananResponsif", label: "Bagaimana tingkat responsif dalam melayani?" },
      { key: "pelayananRamah", label: "Seberapa ramah dalam memberikan pelayanan?" },
      { key: "pelayananSolutif", label: "Kemampuan menyelesaikan masalah pelayanan?" }
    ]
  },
  {
    key: "akuntabel",
    label: "Akuntabel",
    icon: "A",
    questions: [
      { key: "akuntabelProsedur", label: "Ketaatan terhadap prosedur kerja?" },
      { key: "akuntabelTransparansi", label: "Transparansi dalam bekerja?" },
      { key: "akuntabelTanggungJawab", label: "Pertanggungjawaban hasil kerja?" }
    ]
  },
  {
    key: "kompeten",
    label: "Kompeten",
    icon: "K",
    questions: [
      { key: "kompetenPenguasaan", label: "Penguasaan bidang tugas?" },
      { key: "kompetenPenyelesaian", label: "Kemampuan menyelesaikan pekerjaan?" },
      { key: "kompetenPengembangan", label: "Pengembangan kompetensi?" }
    ]
  },
  {
    key: "harmonis",
    label: "Harmonis",
    icon: "H",
    questions: [
      { key: "harmonisTim", label: "Kemampuan bekerja dalam tim?" },
      { key: "harmonisRelasi", label: "Menjaga hubungan baik dengan rekan?" },
      {
        key: "harmonisLingkungan",
        label: "Kontribusi dalam menciptakan lingkungan kerja harmonis?"
      }
    ]
  },
  {
    key: "loyal",
    label: "Loyal",
    icon: "L",
    questions: [
      { key: "loyalKomitmen", label: "Komitmen terhadap organisasi?" },
      { key: "loyalAturan", label: "Ketaatan pada aturan organisasi?" },
      { key: "loyalDedikasi", label: "Dedikasi dalam bekerja?" }
    ]
  },
  {
    key: "adaptif",
    label: "Adaptif",
    icon: "A",
    questions: [
      { key: "adaptifPerubahan", label: "Kemampuan beradaptasi dengan perubahan?" },
      { key: "adaptifFleksibilitas", label: "Fleksibilitas dalam bekerja?" },
      { key: "adaptifBelajar", label: "Kemampuan belajar hal baru?" }
    ]
  },
  {
    key: "kolaboratif",
    label: "Kolaboratif",
    icon: "K",
    questions: [
      { key: "kolaboratifKerjaSama", label: "Kemampuan bekerja sama?" },
      { key: "kolaboratifDiskusi", label: "Kontribusi dalam diskusi tim?" },
      { key: "kolaboratifKoordinasi", label: "Kemampuan berkoordinasi?" }
    ]
  }
];

const dashboardDimensionOrder = [
  "pelayanan",
  "akuntabel",
  "kompeten",
  "harmonis",
  "loyal",
  "adaptif",
  "kolaboratif"
];

const buildYearOptions = () => [defaultYear - 1, defaultYear, defaultYear + 1];

const buildInitialForm = (evaluatorEmployeeId: number): BerakhlakPayload => ({
  employeeId: 0,
  evaluatorEmployeeId,
  evaluationYear: defaultYear,
  evaluationMonth: defaultMonth,
  pelayananResponsif: DEFAULT_SCORE,
  pelayananRamah: DEFAULT_SCORE,
  pelayananSolutif: DEFAULT_SCORE,
  akuntabelProsedur: DEFAULT_SCORE,
  akuntabelTransparansi: DEFAULT_SCORE,
  akuntabelTanggungJawab: DEFAULT_SCORE,
  kompetenPenguasaan: DEFAULT_SCORE,
  kompetenPenyelesaian: DEFAULT_SCORE,
  kompetenPengembangan: DEFAULT_SCORE,
  harmonisTim: DEFAULT_SCORE,
  harmonisRelasi: DEFAULT_SCORE,
  harmonisLingkungan: DEFAULT_SCORE,
  loyalKomitmen: DEFAULT_SCORE,
  loyalAturan: DEFAULT_SCORE,
  loyalDedikasi: DEFAULT_SCORE,
  adaptifPerubahan: DEFAULT_SCORE,
  adaptifFleksibilitas: DEFAULT_SCORE,
  adaptifBelajar: DEFAULT_SCORE,
  kolaboratifKerjaSama: DEFAULT_SCORE,
  kolaboratifDiskusi: DEFAULT_SCORE,
  kolaboratifKoordinasi: DEFAULT_SCORE,
  note: ""
});

const getScoreTone = (score: number): "neutral" | "success" | "warning" => {
  if (score >= 80) return "success";
  if (score >= 70) return "neutral";
  return "warning";
};

const mixChannel = (start: number, end: number, ratio: number) =>
  Math.round(start + (end - start) * ratio);

const getScoreColor = (score: number) => {
  const normalized = Math.min(100, Math.max(0, score));

  if (normalized <= 50) {
    const ratio = normalized / 50;
    const start = { r: 220, g: 38, b: 38 };
    const end = { r: 250, g: 204, b: 21 };

    return `rgb(${mixChannel(start.r, end.r, ratio)}, ${mixChannel(start.g, end.g, ratio)}, ${mixChannel(start.b, end.b, ratio)})`;
  }

  const ratio = (normalized - 50) / 50;
  const start = { r: 250, g: 204, b: 21 };
  const end = { r: 22, g: 163, b: 74 };

  return `rgb(${mixChannel(start.r, end.r, ratio)}, ${mixChannel(start.g, end.g, ratio)}, ${mixChannel(start.b, end.b, ratio)})`;
};

const getScoreRgba = (score: number, alpha: number) =>
  getScoreColor(score).replace("rgb", "rgba").replace(")", `, ${alpha})`);

const getScoreGlowColor = (score: number) => getScoreRgba(score, 0.32);

const getScoreBadgeStyle = (score: number): CSSProperties => ({
  color: getScoreColor(score),
  background: `linear-gradient(135deg, ${getScoreRgba(score, 0.16)}, ${getScoreRgba(score, 0.26)})`,
  border: `1px solid ${getScoreRgba(score, 0.34)}`,
  boxShadow: `0 10px 24px ${getScoreRgba(score, 0.14)}`
});

const getSliderStyle = (score: number): CSSProperties => ({
  ["--range-progress" as string]: `${score}%`,
  ["--range-accent" as string]: getScoreColor(score),
  ["--range-accent-soft" as string]: getScoreGlowColor(score)
});

const getProgressStatus = (percentage: number) => {
  if (percentage <= 0) return { label: "Belum mulai", tone: "warning" as const };
  if (percentage < 100) return { label: "Sedang berjalan", tone: "neutral" as const };
  return { label: "Lengkap", tone: "success" as const };
};

const getReviewerProgressVisualState = (percentage: number): {
  tone: ReviewerProgressTone;
  label: string;
  note: string;
  icon: string;
} => {
  if (percentage <= 0) {
    return {
      tone: "danger",
      label: "Belum mulai menilai",
      note: "Belum mulai menilai",
      icon: "✕"
    };
  }

  if (percentage < 60) {
    return {
      tone: "warning",
      label: "Progress Rendah",
      note: "Masih perlu melengkapi target",
      icon: "●"
    };
  }

  if (percentage < 100) {
    return {
      tone: "caution",
      label: "Sedang Berjalan",
      note: "Penilaian sudah berjalan baik",
      icon: "△"
    };
  }

  return {
    tone: "success",
    label: "Selesai",
    note: "Semua target sudah dinilai",
    icon: "✓"
  };
};

const getDynamicMinimalCardStyle = (score: number): CSSProperties => ({
  position: "relative",
  overflow: "hidden",
  background: `linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, ${getScoreRgba(score, 0.11)} 100%)`,
  border: `1px solid ${getScoreRgba(score, 0.26)}`,
  boxShadow: `0 18px 32px ${getScoreRgba(score, 0.12)}`,
  backdropFilter: "blur(10px)"
});

const getProgressCardStyle = (percentage: number): CSSProperties =>
  getDynamicMinimalCardStyle(percentage);

const getProgressCardTopBarStyle = (percentage: number): CSSProperties => ({
  position: "absolute",
  inset: "0 0 auto 0",
  height: 4,
  background: `linear-gradient(90deg, ${getScoreRgba(Math.max(0, percentage - 18), 0.95)} 0%, ${getScoreColor(percentage)} 50%, ${getScoreRgba(Math.min(100, percentage + 12), 0.95)} 100%)`
});

const getProgressValueStyle = (percentage: number): CSSProperties => ({
  color: getScoreColor(percentage),
  textShadow: `0 8px 22px ${getScoreRgba(percentage, 0.18)}`
});

const getProgressCaptionStyle = (percentage: number): CSSProperties => ({
  color: getScoreRgba(percentage, 0.92)
});

const getAverageMetricCardStyle = (score: number, hasData: boolean): CSSProperties => {
  if (!hasData) {
    return getMinimalCardStyle("slate");
  }

  return getDynamicMinimalCardStyle(score);
};

const getAverageMetricTopBarStyle = (score: number, hasData: boolean): CSSProperties => ({
  position: "absolute",
  inset: "0 0 auto 0",
  height: 4,
  background: hasData
    ? `linear-gradient(90deg, ${getScoreRgba(Math.max(0, score - 18), 0.95)} 0%, ${getScoreColor(score)} 50%, ${getScoreRgba(Math.min(100, score + 12), 0.95)} 100%)`
    : "linear-gradient(90deg, rgba(148, 163, 184, 0.85) 0%, rgba(100, 116, 139, 0.95) 100%)"
});

const getAverageMetricValueStyle = (score: number, hasData: boolean): CSSProperties => ({
  color: hasData ? getScoreColor(score) : "inherit",
  textShadow: hasData ? `0 8px 22px ${getScoreRgba(score, 0.18)}` : "none"
});

const getAverageMetricCaptionStyle = (score: number, hasData: boolean): CSSProperties => ({
  color: hasData ? getScoreRgba(score, 0.92) : "inherit"
});

const getSoftMetricCardStyle = (variant: "evaluator" | "totalInput"): CSSProperties =>
  getMinimalCardStyle(variant === "evaluator" ? "blue" : "teal");

const getSoftMetricTopBarStyle = (variant: "evaluator" | "totalInput"): CSSProperties =>
  getMinimalCardTopBarStyle(variant === "evaluator" ? "blue" : "teal");

const getSoftMetricSmallStyle = (): CSSProperties => getMinimalCardLabelStyle();

const getSoftMetricValueStyle = (variant: "evaluator" | "totalInput"): CSSProperties =>
  getMinimalCardValueStyle(variant === "evaluator" ? "blue" : "teal");

const getSoftMetricCaptionStyle = (variant: "evaluator" | "totalInput"): CSSProperties =>
  getMinimalCardCaptionStyle(variant === "evaluator" ? "blue" : "teal");


type MinimalCardVariant = "slate" | "blue" | "teal" | "violet" | "amber" | "rose";

const getMinimalCardPalette = (variant: MinimalCardVariant) => {
  switch (variant) {
    case "blue":
      return {
        surface: "linear-gradient(145deg, rgba(248, 250, 252, 0.98) 0%, rgba(239, 246, 255, 0.98) 100%)",
        border: "rgba(96, 165, 250, 0.22)",
        shadow: "rgba(37, 99, 235, 0.10)",
        topBar: "linear-gradient(90deg, rgba(59, 130, 246, 0.95) 0%, rgba(14, 165, 233, 0.9) 100%)",
        caption: "#2563eb"
      };
    case "teal":
      return {
        surface: "linear-gradient(145deg, rgba(248, 250, 252, 0.98) 0%, rgba(240, 253, 250, 0.98) 100%)",
        border: "rgba(20, 184, 166, 0.24)",
        shadow: "rgba(13, 148, 136, 0.11)",
        topBar: "linear-gradient(90deg, rgba(20, 184, 166, 0.95) 0%, rgba(14, 116, 144, 0.9) 100%)",
        caption: "#0f766e"
      };
    case "violet":
      return {
        surface: "linear-gradient(145deg, rgba(250, 250, 255, 0.98) 0%, rgba(245, 243, 255, 0.98) 100%)",
        border: "rgba(139, 92, 246, 0.20)",
        shadow: "rgba(109, 40, 217, 0.10)",
        topBar: "linear-gradient(90deg, rgba(139, 92, 246, 0.95) 0%, rgba(99, 102, 241, 0.9) 100%)",
        caption: "#6d28d9"
      };
    case "amber":
      return {
        surface: "linear-gradient(145deg, rgba(255, 252, 245, 0.98) 0%, rgba(254, 249, 195, 0.9) 100%)",
        border: "rgba(245, 158, 11, 0.22)",
        shadow: "rgba(217, 119, 6, 0.10)",
        topBar: "linear-gradient(90deg, rgba(245, 158, 11, 0.95) 0%, rgba(234, 179, 8, 0.92) 100%)",
        caption: "#b45309"
      };
    case "rose":
      return {
        surface: "linear-gradient(145deg, rgba(255, 250, 250, 0.98) 0%, rgba(255, 241, 242, 0.98) 100%)",
        border: "rgba(251, 113, 133, 0.22)",
        shadow: "rgba(225, 29, 72, 0.10)",
        topBar: "linear-gradient(90deg, rgba(244, 63, 94, 0.95) 0%, rgba(251, 113, 133, 0.92) 100%)",
        caption: "#be123c"
      };
    default:
      return {
        surface: "linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)",
        border: "rgba(148, 163, 184, 0.22)",
        shadow: "rgba(15, 23, 42, 0.08)",
        topBar: "linear-gradient(90deg, rgba(100, 116, 139, 0.95) 0%, rgba(148, 163, 184, 0.88) 100%)",
        caption: "#475569"
      };
  }
};

const getMinimalCardStyle = (variant: MinimalCardVariant = "slate"): CSSProperties => {
  const palette = getMinimalCardPalette(variant);
  return {
    position: "relative",
    overflow: "hidden",
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    boxShadow: `0 18px 32px ${palette.shadow}`,
    backdropFilter: "blur(10px)"
  };
};

const getMinimalCardTopBarStyle = (variant: MinimalCardVariant = "slate"): CSSProperties => ({
  position: "absolute",
  inset: "0 0 auto 0",
  height: 4,
  background: getMinimalCardPalette(variant).topBar
});

const getMinimalCardLabelStyle = (): CSSProperties => ({
  color: "#64748b",
  letterSpacing: "0.02em"
});

const getMinimalCardValueStyle = (variant: MinimalCardVariant = "slate"): CSSProperties => ({
  color: "#0f172a",
  textShadow:
    variant === "blue"
      ? "0 10px 24px rgba(37, 99, 235, 0.08)"
      : variant === "teal"
        ? "0 10px 24px rgba(13, 148, 136, 0.10)"
        : variant === "violet"
          ? "0 10px 24px rgba(109, 40, 217, 0.08)"
          : variant === "amber"
            ? "0 10px 24px rgba(217, 119, 6, 0.08)"
            : variant === "rose"
              ? "0 10px 24px rgba(225, 29, 72, 0.08)"
              : "0 10px 24px rgba(15, 23, 42, 0.08)"
});

const getMinimalCardCaptionStyle = (variant: MinimalCardVariant = "slate"): CSSProperties => ({
  color: getMinimalCardPalette(variant).caption,
  fontWeight: 600
});

type StyledMetricCardProps = {
  title: string;
  value: string | number;
  caption: string;
  variant?: MinimalCardVariant;
  valueStyle?: CSSProperties;
  captionStyle?: CSSProperties;
};

const StyledMetricCard = ({
  title,
  value,
  caption,
  variant = "slate",
  valueStyle,
  captionStyle
}: StyledMetricCardProps) => (
  <div className="stats-card" style={getMinimalCardStyle(variant)}>
    <span aria-hidden="true" style={getMinimalCardTopBarStyle(variant)} />
    <span className="stats-label" style={getMinimalCardLabelStyle()}>
      {title}
    </span>
    <strong style={{ ...getMinimalCardValueStyle(variant), ...valueStyle }}>{value}</strong>
    <small style={{ ...getMinimalCardCaptionStyle(variant), ...captionStyle }}>{caption}</small>
  </div>
);

const getDimensionChartWrapStyle = (itemCount: number): CSSProperties => ({
  display: "grid",
  gap: 14,
  gridTemplateColumns: itemCount > 4 ? "repeat(2, minmax(0, 1fr))" : "1fr",
  gridAutoRows: "1fr",
  alignItems: "stretch"
});

const getDimensionChartRowStyle = (score: number): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gridTemplateAreas: `"label value" "track track"`,
  gap: 12,
  alignItems: "center",
  padding: "16px 18px",
  minHeight: 104,
  borderRadius: 18,
  border: `1px solid ${getScoreRgba(score, 0.18)}`,
  background: `linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, ${getScoreRgba(score, 0.08)} 100%)`,
  boxShadow: `0 16px 28px ${getScoreRgba(score, 0.08)}`
});

const getDimensionChartTrackStyle = (): CSSProperties => ({
  gridArea: "track",
  position: "relative",
  overflow: "hidden",
  height: 12,
  borderRadius: 999,
  background: "linear-gradient(90deg, rgba(226, 232, 240, 0.92) 0%, rgba(241, 245, 249, 0.98) 100%)",
  boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.08)"
});

const getDimensionChartFillStyle = (score: number): CSSProperties => ({
  width: `${Math.max(0, Math.min(100, score))}%`,
  height: "100%",
  borderRadius: 999,
  background: `linear-gradient(90deg, ${getScoreRgba(Math.max(0, score - 18), 0.95)} 0%, ${getScoreColor(score)} 52%, ${getScoreRgba(Math.min(100, score + 10), 0.95)} 100%)`,
  boxShadow: `0 8px 22px ${getScoreRgba(score, 0.22)}`,
  transition: "width 280ms ease"
});

const getDimensionChartLabelStyle = (score: number): CSSProperties => ({
  gridArea: "label",
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: 14,
  color: "#0f172a",
  fontWeight: 700,
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, ${getScoreRgba(score, 0.12)} 100%)`,
  border: `1px solid ${getScoreRgba(score, 0.2)}`
});

const getDimensionChartValueStyle = (score: number): CSSProperties => ({
  gridArea: "value",
  minWidth: 72,
  textAlign: "right",
  fontSize: "1rem",
  fontWeight: 800,
  color: getScoreColor(score),
  textShadow: `0 8px 18px ${getScoreRgba(score, 0.16)}`
});


const dashboardTopTableHeaderBaseStyle: CSSProperties = {
  padding: "0",
  textAlign: "left",
  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  borderBottom: "1px solid rgba(191, 219, 254, 0.35)",
  whiteSpace: "nowrap"
};

const dashboardTopTableAverageHeaderStyle: CSSProperties = {
  ...dashboardTopTableHeaderBaseStyle,
  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
};

const dashboardTopTableHeaderButtonStyle: CSSProperties = {
  width: "100%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  padding: "14px 12px",
  border: "none",
  background: "transparent",
  color: "#ffffff",
  fontSize: "0.95rem",
  fontWeight: 700,
  cursor: "pointer"
};

const getDashboardSortIndicator = (
  active: boolean,
  direction: "asc" | "desc"
) => {
  if (!active) return "↕";
  return direction === "asc" ? "↑" : "↓";
};

const roundDashboardScore = (value: number) => Number(value.toFixed(2));

const getDashboardTopTableCellStyle = (isAverageColumn = false): CSSProperties => ({
  padding: "14px 12px",
  borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
  background: isAverageColumn ? "rgba(34, 197, 94, 0.08)" : "#ffffff",
  verticalAlign: "middle"
});

const getDashboardTopTableScoreTextStyle = (score: number, bold = false): CSSProperties => ({
  color: getScoreColor(score),
  fontWeight: bold ? 800 : 700,
  textAlign: "center",
  textShadow: `0 8px 18px ${getScoreRgba(score, 0.16)}`
});

const getDashboardTopTableCountBadgeStyle = (): CSSProperties => ({
  minWidth: 28,
  height: 28,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 10px",
  borderRadius: 999,
  background: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
  color: "#ffffff",
  fontWeight: 800,
  boxShadow: "0 10px 18px rgba(37, 99, 235, 0.18)"
});



const formatMonthLabel = (year: number, month: number) =>
  `${MONTH_OPTIONS[month - 1] || "-"} ${year}`;

const formatSelectedPeriod = (year: number, month: number) =>
  month === ALL_MONTH_VALUE ? `seluruh bulan tahun ${year}` : formatMonthLabel(year, month);

const formatSelectedEmployee = (employeeName?: string | null) =>
  employeeName && employeeName.trim() ? employeeName : "seluruh pegawai";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

const mapEvaluationToForm = (item: BerakhlakEvaluation): BerakhlakPayload => ({
  employeeId: item.employeeId,
  evaluatorEmployeeId: item.evaluatorEmployeeId,
  evaluationYear: item.evaluationYear,
  evaluationMonth: item.evaluationMonth,
  pelayananResponsif: item.pelayananResponsif,
  pelayananRamah: item.pelayananRamah,
  pelayananSolutif: item.pelayananSolutif,
  akuntabelProsedur: item.akuntabelProsedur,
  akuntabelTransparansi: item.akuntabelTransparansi,
  akuntabelTanggungJawab: item.akuntabelTanggungJawab,
  kompetenPenguasaan: item.kompetenPenguasaan,
  kompetenPenyelesaian: item.kompetenPenyelesaian,
  kompetenPengembangan: item.kompetenPengembangan,
  harmonisTim: item.harmonisTim,
  harmonisRelasi: item.harmonisRelasi,
  harmonisLingkungan: item.harmonisLingkungan,
  loyalKomitmen: item.loyalKomitmen,
  loyalAturan: item.loyalAturan,
  loyalDedikasi: item.loyalDedikasi,
  adaptifPerubahan: item.adaptifPerubahan,
  adaptifFleksibilitas: item.adaptifFleksibilitas,
  adaptifBelajar: item.adaptifBelajar,
  kolaboratifKerjaSama: item.kolaboratifKerjaSama,
  kolaboratifDiskusi: item.kolaboratifDiskusi,
  kolaboratifKoordinasi: item.kolaboratifKoordinasi,
  note: item.note || ""
});

export const Berakhlak360Page = () => {
  const { user } = useAuth();
  const currentEmployeeId = user?.employeeId || 0;
  const isPegawaiRole = user?.role === "user";
  const allowedTabs: TabKey[] = isPegawaiRole
    ? ["form", "recap"]
    : ["form", "recap", "dashboard", "progress"];

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<BerakhlakEvaluation[]>([]);
  const [dashboard, setDashboard] = useState<BerakhlakDashboard | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("form");
  const [form, setForm] = useState<BerakhlakPayload>(buildInitialForm(currentEmployeeId));
  const [search, setSearch] = useState("");
  const [recapYear, setRecapYear] = useState(defaultYear);
  const [recapMonth, setRecapMonth] = useState<number>(ALL_MONTH_VALUE);
  const [progressSearch, setProgressSearch] = useState("");
  const [progressYear, setProgressYear] = useState(defaultYear);
  const [progressMonth, setProgressMonth] = useState<number>(ALL_MONTH_VALUE);
  const [dashboardYear, setDashboardYear] = useState(defaultYear);
  const [dashboardMonth, setDashboardMonth] = useState<number>(ALL_MONTH_VALUE);
  const [dashboardEmployeeId, setDashboardEmployeeId] = useState<number>(ALL_EMPLOYEE_VALUE);
  const [dashboardTopTableSortKey, setDashboardTopTableSortKey] = useState<DashboardTopTableSortKey>("averageScore");
  const [dashboardTopTableSortDirection, setDashboardTopTableSortDirection] = useState<"asc" | "desc">("desc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvaluationId, setEditingEvaluationId] = useState<number | null>(null);

  useEffect(() => {
    void loadBaseData();
  }, []);

  useEffect(() => {
    if (isPegawaiRole && (activeTab === "dashboard" || activeTab === "progress")) {
      setActiveTab("form");
    }
  }, [activeTab, isPegawaiRole]);

  useEffect(() => {
    if (!isPegawaiRole) {
      void loadDashboardData();
    }
  }, [dashboardEmployeeId, dashboardMonth, dashboardYear, isPegawaiRole]);

  const loadBaseData = async () => {
    const [employeeData, evaluationData] = await Promise.all([
      fetchEmployees(),
      fetchBerakhlakEvaluations()
    ]);

    setEmployees(employeeData);
    setEvaluations(evaluationData);
    setForm((prev) => ({
      ...prev,
      evaluatorEmployeeId: currentEmployeeId,
      evaluationYear: prev.evaluationYear || defaultYear,
      evaluationMonth: prev.evaluationMonth || defaultMonth
    }));
  };

  const loadDashboardData = async () => {
    const dashboardData = await fetchBerakhlakDashboard({
      year: dashboardYear,
      month: dashboardMonth === ALL_MONTH_VALUE ? undefined : dashboardMonth,
      employeeId:
        dashboardEmployeeId === ALL_EMPLOYEE_VALUE ? undefined : dashboardEmployeeId
    });

    setDashboard(dashboardData);
  };

  const currentEmployee = useMemo(
    () => employees.find((employee) => employee.id === currentEmployeeId) || null,
    [employees, currentEmployeeId]
  );

  const dashboardEmployeeOptions = useMemo(
    () =>
      [...employees]
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
        .map((employee) => ({
          id: employee.id,
          fullName: employee.fullName,
          nip: employee.nip
        })),
    [employees]
  );

  const dashboardSelectedEmployee = useMemo(
    () =>
      dashboardEmployeeId === ALL_EMPLOYEE_VALUE
        ? null
        : employees.find((employee) => employee.id === dashboardEmployeeId) || null,
    [dashboardEmployeeId, employees]
  );

  const isSingleEmployeeAllMonthView =
    dashboardEmployeeId !== ALL_EMPLOYEE_VALUE && dashboardMonth === ALL_MONTH_VALUE;

  const myEvaluations = useMemo(
    () => evaluations.filter((item) => item.evaluatorEmployeeId === currentEmployeeId),
    [evaluations, currentEmployeeId]
  );

  const myFilteredEvaluations = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return myEvaluations.filter((item) => {
      const matchPeriod =
        item.evaluationYear === form.evaluationYear && item.evaluationMonth === form.evaluationMonth;
      const matchKeyword =
        !keyword ||
        item.employeeName.toLowerCase().includes(keyword) ||
        item.employeeNip.toLowerCase().includes(keyword);
      return matchPeriod && matchKeyword;
    });
  }, [myEvaluations, form.evaluationMonth, form.evaluationYear, search]);

  const myPeriodEvaluations = useMemo(
    () =>
      myEvaluations.filter(
        (item) =>
          item.evaluationYear === form.evaluationYear &&
          item.evaluationMonth === form.evaluationMonth
      ),
    [myEvaluations, form.evaluationMonth, form.evaluationYear]
  );

  const myRecapEvaluations = useMemo(() => {
    return myEvaluations.filter((item) => {
      const matchYear = item.evaluationYear === recapYear;
      const matchMonth = recapMonth === ALL_MONTH_VALUE || item.evaluationMonth === recapMonth;
      return matchYear && matchMonth;
    });
  }, [myEvaluations, recapMonth, recapYear]);

  const myEmployeeAverageMap = useMemo(() => {
    const grouped = new Map<number, { total: number; count: number }>();

    myRecapEvaluations.forEach((item) => {
      const current = grouped.get(item.employeeId) || { total: 0, count: 0 };
      grouped.set(item.employeeId, {
        total: current.total + Number(item.finalScore),
        count: current.count + 1
      });
    });

    return new Map(
      [...grouped.entries()].map(([employeeId, summary]) => [
        employeeId,
        Number((summary.total / summary.count).toFixed(2))
      ])
    );
  }, [myRecapEvaluations]);

  const myRecapYearlyEmployeeRows = useMemo(
    () =>
      [...myEmployeeAverageMap.entries()]
        .map(([employeeId, averageScore]) => {
          const employeeItems = myRecapEvaluations.filter((item) => item.employeeId === employeeId);
          const lastItem = [...employeeItems].sort((a, b) => {
            const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return bTime - aTime;
          })[0];

          if (!lastItem) return null;

          return {
            employeeId,
            employeeName: lastItem.employeeName,
            employeeNip: lastItem.employeeNip,
            averageScore,
            totalInputs: employeeItems.length,
            latestDate: lastItem.updatedAt || lastItem.createdAt || "",
            latestNote: lastItem.note || ""
          };
        })
        .filter(
          (
            item
          ): item is {
            employeeId: number;
            employeeName: string;
            employeeNip: string;
            averageScore: number;
            totalInputs: number;
            latestDate: string;
            latestNote: string;
          } => Boolean(item)
        )
        .sort((a, b) => b.averageScore - a.averageScore),
    [myEmployeeAverageMap, myRecapEvaluations]
  );

  const recapPeriodLabel = useMemo(
    () => formatSelectedPeriod(recapYear, recapMonth),
    [recapMonth, recapYear]
  );

  const totalTargetEmployees = useMemo(
    () => employees.filter((item) => item.id !== currentEmployeeId).length,
    [employees, currentEmployeeId]
  );

  const periodCompletionPercentage = useMemo(() => {
    if (!totalTargetEmployees) return 0;
    return Number(((myPeriodEvaluations.length / totalTargetEmployees) * 100).toFixed(2));
  }, [myPeriodEvaluations.length, totalTargetEmployees]);

  const evaluatedTargetIds = useMemo(
    () =>
      new Set(
        myEvaluations
          .filter(
            (item) =>
              item.evaluationYear === form.evaluationYear &&
              item.evaluationMonth === form.evaluationMonth
          )
          .map((item) => item.employeeId)
      ),
    [myEvaluations, form.evaluationMonth, form.evaluationYear]
  );

  const availableEmployees = useMemo(
    () =>
      employees.filter(
        (employee) =>
          employee.id !== currentEmployeeId &&
          (!evaluatedTargetIds.has(employee.id) || employee.id === form.employeeId)
      ),
    [employees, currentEmployeeId, evaluatedTargetIds, form.employeeId]
  );


  const receivedEvaluations = useMemo(
    () =>
      evaluations.filter(
        (item) =>
          item.employeeId === currentEmployeeId && item.evaluatorEmployeeId !== currentEmployeeId
      ),
    [evaluations, currentEmployeeId]
  );

  const receivedAverageScore = useMemo(() => {
    if (!receivedEvaluations.length) return 0;
    return Number(
      (
        receivedEvaluations.reduce((sum, item) => sum + Number(item.finalScore), 0) /
        receivedEvaluations.length
      ).toFixed(2)
    );
  }, [receivedEvaluations]);

  const periodAverage = useMemo(() => {
    if (!myFilteredEvaluations.length) return 0;
    return Number(
      (
        myFilteredEvaluations.reduce((sum, item) => sum + Number(item.finalScore), 0) /
        myFilteredEvaluations.length
      ).toFixed(2)
    );
  }, [myFilteredEvaluations]);


  const cumulativePeriodEvaluations = useMemo(
    () =>
      myEvaluations.filter(
        (item) =>
          item.evaluationYear === form.evaluationYear &&
          item.evaluationMonth >= 1 &&
          item.evaluationMonth <= form.evaluationMonth
      ),
    [form.evaluationMonth, form.evaluationYear, myEvaluations]
  );

  const cumulativeTargetEmployees = useMemo(
    () => totalTargetEmployees * Math.max(form.evaluationMonth, 0),
    [form.evaluationMonth, totalTargetEmployees]
  );

  const cumulativeRemainingTargets = useMemo(
    () => Math.max(cumulativeTargetEmployees - cumulativePeriodEvaluations.length, 0),
    [cumulativePeriodEvaluations.length, cumulativeTargetEmployees]
  );

  const cumulativeRemainingPercentage = useMemo(() => {
    if (!cumulativeTargetEmployees) return 0;
    return Number(((cumulativeRemainingTargets / cumulativeTargetEmployees) * 100).toFixed(2));
  }, [cumulativeRemainingTargets, cumulativeTargetEmployees]);

  const cumulativeRemainingVisualScore = useMemo(
    () => Math.max(0, 100 - cumulativeRemainingPercentage),
    [cumulativeRemainingPercentage]
  );

  const cumulativeTargetPeriodLabel = useMemo(() => {
    const currentMonthLabel = MONTH_OPTIONS[Math.max(form.evaluationMonth - 1, 0)] || MONTH_OPTIONS[0];
    return `Januari sampai ${currentMonthLabel} ${form.evaluationYear}`;
  }, [form.evaluationMonth, form.evaluationYear]);
  const yearOptions = useMemo(() => buildYearOptions(), []);
  const dashboardPeriodLabel = useMemo(
    () => formatSelectedPeriod(dashboardYear, dashboardMonth),
    [dashboardMonth, dashboardYear]
  );
  const dashboardEmployeeLabel = useMemo(
    () => formatSelectedEmployee(dashboardSelectedEmployee?.fullName),
    [dashboardSelectedEmployee]
  );

  const dashboardHighestScoreItem = useMemo(() => {
    const rows = dashboard?.employeeScores || [];
    if (!rows.length) return null;
    return [...rows].sort((a, b) => b.averageScore - a.averageScore || b.totalEvaluations - a.totalEvaluations)[0] || null;
  }, [dashboard]);

  const dashboardLowestScoreItem = useMemo(() => {
    const rows = dashboard?.employeeScores || [];
    if (!rows.length) return null;
    return [...rows].sort((a, b) => a.averageScore - b.averageScore || b.totalEvaluations - a.totalEvaluations)[0] || null;
  }, [dashboard]);

  const dashboardHighestScoreCaption = useMemo(() => {
    if (!dashboardHighestScoreItem) {
      return dashboardMonth === ALL_MONTH_VALUE
        ? `Belum ada nilai tertinggi pada tahun ${dashboardYear}`
        : 'Belum ada nilai tertinggi pada periode ini';
    }

    if (isSingleEmployeeAllMonthView) {
      return dashboardHighestScoreItem.evaluationYear && dashboardHighestScoreItem.evaluationMonth
        ? `Periode terbaik ${formatMonthLabel(dashboardHighestScoreItem.evaluationYear, dashboardHighestScoreItem.evaluationMonth)}`
        : `Nilai tertinggi selama tahun ${dashboardYear}`;
    }

    return dashboardMonth === ALL_MONTH_VALUE
      ? `${dashboardHighestScoreItem.fullName} · tertinggi selama tahun ${dashboardYear}`
      : `${dashboardHighestScoreItem.fullName} · tertinggi pada ${dashboardPeriodLabel}`;
  }, [dashboardHighestScoreItem, dashboardMonth, dashboardPeriodLabel, dashboardYear, isSingleEmployeeAllMonthView]);

  const dashboardLowestScoreCaption = useMemo(() => {
    if (!dashboardLowestScoreItem) {
      return dashboardMonth === ALL_MONTH_VALUE
        ? `Belum ada nilai terendah pada tahun ${dashboardYear}`
        : 'Belum ada nilai terendah pada periode ini';
    }

    if (isSingleEmployeeAllMonthView) {
      return dashboardLowestScoreItem.evaluationYear && dashboardLowestScoreItem.evaluationMonth
        ? `Periode terendah ${formatMonthLabel(dashboardLowestScoreItem.evaluationYear, dashboardLowestScoreItem.evaluationMonth)}`
        : `Nilai terendah selama tahun ${dashboardYear}`;
    }

    return dashboardMonth === ALL_MONTH_VALUE
      ? `${dashboardLowestScoreItem.fullName} · terendah selama tahun ${dashboardYear}`
      : `${dashboardLowestScoreItem.fullName} · terendah pada ${dashboardPeriodLabel}`;
  }, [dashboardLowestScoreItem, dashboardMonth, dashboardPeriodLabel, dashboardYear, isSingleEmployeeAllMonthView]);

  const showDashboardDimensionChart = true;

  const dashboardDimensionRows = useMemo(() => {
    const orderMap = new Map(dashboardDimensionOrder.map((key, index) => [key, index]));

    return [...(dashboard?.dimensionAverages || [])].sort((a, b) => {
      const leftOrder = orderMap.get(a.key) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = orderMap.get(b.key) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || a.label.localeCompare(b.label);
    });
  }, [dashboard]);

  const dashboardDimensionChartDescription = useMemo(() => {
    if (dashboardEmployeeId === ALL_EMPLOYEE_VALUE) {
      return dashboardMonth === ALL_MONTH_VALUE
        ? `Rata rata komponen BerAKHLAK seluruh pegawai selama tahun ${dashboardYear}.`
        : `Rata rata komponen BerAKHLAK seluruh pegawai pada ${dashboardPeriodLabel}.`;
    }

    return dashboardMonth === ALL_MONTH_VALUE
      ? `Rata rata komponen BerAKHLAK ${dashboardEmployeeLabel} selama tahun ${dashboardYear}.`
      : `Rata rata komponen BerAKHLAK ${dashboardEmployeeLabel} pada ${dashboardPeriodLabel}.`;
  }, [dashboardEmployeeId, dashboardEmployeeLabel, dashboardMonth, dashboardPeriodLabel, dashboardYear]);

  const dashboardFilteredEvaluations = useMemo(() => {
    return evaluations.filter((item) => {
      const matchYear = item.evaluationYear === dashboardYear;
      const matchMonth = dashboardMonth === ALL_MONTH_VALUE || item.evaluationMonth === dashboardMonth;
      const matchEmployee =
        dashboardEmployeeId === ALL_EMPLOYEE_VALUE || item.employeeId === dashboardEmployeeId;

      return matchYear && matchMonth && matchEmployee;
    });
  }, [dashboardEmployeeId, dashboardMonth, dashboardYear, evaluations]);

  const dashboardTopTableRows = useMemo<DashboardTopTableRow[]>(() => {
    if (!dashboardFilteredEvaluations.length) return [];

    const grouped = new Map<
      string,
      {
        label: string;
        sublabel: string;
        evaluationYear?: number;
        evaluationMonth?: number;
        items: BerakhlakEvaluation[];
      }
    >();

    dashboardFilteredEvaluations.forEach((item) => {
      const groupKey = isSingleEmployeeAllMonthView
        ? `${item.evaluationYear}-${item.evaluationMonth}`
        : `${item.employeeId}`;

      const current = grouped.get(groupKey) || {
        label: isSingleEmployeeAllMonthView
          ? formatMonthLabel(item.evaluationYear, item.evaluationMonth)
          : item.employeeName,
        sublabel: isSingleEmployeeAllMonthView
          ? `${item.employeeName} · ${item.employeeNip}`
          : item.employeeNip,
        evaluationYear: isSingleEmployeeAllMonthView ? item.evaluationYear : undefined,
        evaluationMonth: isSingleEmployeeAllMonthView ? item.evaluationMonth : undefined,
        items: [] as BerakhlakEvaluation[]
      };

      current.items.push(item);
      grouped.set(groupKey, current);
    });

    return [...grouped.entries()].map(([groupKey, group]) => {
      const totalItems = group.items.length;
      const latestItem = [...group.items].sort((left, right) => {
        const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime();
        const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime();
        return rightTime - leftTime;
      })[0];

      const totalPelayanan = group.items.reduce((sum, item) => sum + Number(item.pelayananAvg), 0);
      const totalAkuntabel = group.items.reduce((sum, item) => sum + Number(item.akuntabelAvg), 0);
      const totalKompeten = group.items.reduce((sum, item) => sum + Number(item.kompetenAvg), 0);
      const totalHarmonis = group.items.reduce((sum, item) => sum + Number(item.harmonisAvg), 0);
      const totalLoyal = group.items.reduce((sum, item) => sum + Number(item.loyalAvg), 0);
      const totalAdaptif = group.items.reduce((sum, item) => sum + Number(item.adaptifAvg), 0);
      const totalKolaboratif = group.items.reduce((sum, item) => sum + Number(item.kolaboratifAvg), 0);
      const totalAverage = group.items.reduce((sum, item) => sum + Number(item.finalScore), 0);

      return {
        rowKey: groupKey,
        label: group.label,
        sublabel: group.sublabel,
        evaluationYear: group.evaluationYear,
        evaluationMonth: group.evaluationMonth,
        pelayanan: roundDashboardScore(totalPelayanan / totalItems),
        akuntabel: roundDashboardScore(totalAkuntabel / totalItems),
        kompeten: roundDashboardScore(totalKompeten / totalItems),
        harmonis: roundDashboardScore(totalHarmonis / totalItems),
        loyal: roundDashboardScore(totalLoyal / totalItems),
        adaptif: roundDashboardScore(totalAdaptif / totalItems),
        kolaboratif: roundDashboardScore(totalKolaboratif / totalItems),
        averageScore: roundDashboardScore(totalAverage / totalItems),
        evaluationCount: totalItems,
        lastEvaluatedAt: latestItem?.updatedAt || latestItem?.createdAt || null
      };
    });
  }, [dashboardFilteredEvaluations, isSingleEmployeeAllMonthView]);

  const dashboardTopTableColumns = useMemo(
    () => [
      { key: "label" as const, label: isSingleEmployeeAllMonthView ? "Periode" : "Nama Pegawai", highlight: false },
      { key: "pelayanan" as const, label: "Berorientasi Pelayanan", highlight: false },
      { key: "akuntabel" as const, label: "Akuntabel", highlight: false },
      { key: "kompeten" as const, label: "Kompeten", highlight: false },
      { key: "harmonis" as const, label: "Harmonis", highlight: false },
      { key: "loyal" as const, label: "Loyal", highlight: false },
      { key: "adaptif" as const, label: "Adaptif", highlight: false },
      { key: "kolaboratif" as const, label: "Kolaboratif", highlight: false },
      { key: "averageScore" as const, label: "Rata-rata BerAKHLAK", highlight: true },
      {
        key: "evaluationCount" as const,
        label: isSingleEmployeeAllMonthView ? "Jumlah Penilaian" : "Jumlah Penilai",
        highlight: false
      }
    ],
    [isSingleEmployeeAllMonthView]
  );

  const dashboardSortedTopTableRows = useMemo(() => {
    const sorted = [...dashboardTopTableRows];

    sorted.sort((left, right) => {
      let comparison = 0;

      switch (dashboardTopTableSortKey) {
        case "label": {
          if (isSingleEmployeeAllMonthView) {
            const leftValue = (left.evaluationYear || 0) * 100 + (left.evaluationMonth || 0);
            const rightValue = (right.evaluationYear || 0) * 100 + (right.evaluationMonth || 0);
            comparison = leftValue - rightValue;
          } else {
            comparison = left.label.localeCompare(right.label, "id", { sensitivity: "base" });
          }
          break;
        }
        case "pelayanan":
          comparison = left.pelayanan - right.pelayanan;
          break;
        case "akuntabel":
          comparison = left.akuntabel - right.akuntabel;
          break;
        case "kompeten":
          comparison = left.kompeten - right.kompeten;
          break;
        case "harmonis":
          comparison = left.harmonis - right.harmonis;
          break;
        case "loyal":
          comparison = left.loyal - right.loyal;
          break;
        case "adaptif":
          comparison = left.adaptif - right.adaptif;
          break;
        case "kolaboratif":
          comparison = left.kolaboratif - right.kolaboratif;
          break;
        case "evaluationCount":
          comparison = left.evaluationCount - right.evaluationCount;
          break;
        default:
          comparison = left.averageScore - right.averageScore;
      }

      if (comparison === 0) {
        comparison = left.label.localeCompare(right.label, "id", { sensitivity: "base" });
      }

      return dashboardTopTableSortDirection === "asc" ? comparison : comparison * -1;
    });

    return sorted;
  }, [dashboardTopTableRows, dashboardTopTableSortDirection, dashboardTopTableSortKey, isSingleEmployeeAllMonthView]);

  const dashboardTopTableSummaryLabel = useMemo(() => {
    if (isSingleEmployeeAllMonthView) {
      return `Rata rata nilai bulanan ${dashboardEmployeeLabel} pada tahun ${dashboardYear}.`;
    }

    return dashboardMonth === ALL_MONTH_VALUE
      ? `Rata rata nilai seluruh pegawai selama tahun ${dashboardYear}.`
      : `Rata rata nilai pegawai pada ${dashboardPeriodLabel}.`;
  }, [dashboardEmployeeLabel, dashboardMonth, dashboardPeriodLabel, dashboardYear, isSingleEmployeeAllMonthView]);

  const handleDashboardTopTableSort = (key: DashboardTopTableSortKey) => {
    setDashboardTopTableSortKey((previousKey) => {
      if (previousKey === key) {
        setDashboardTopTableSortDirection((previousDirection) =>
          previousDirection === "asc" ? "desc" : "asc"
        );
        return previousKey;
      }

      setDashboardTopTableSortDirection(key === "label" ? "asc" : "desc");
      return key;
    });
  };

  const allFilteredProgress = useMemo(() => {
    const keyword = progressSearch.trim().toLowerCase();
    return evaluations.filter((item) => {
      const matchYear = item.evaluationYear === progressYear;
      const matchMonth =
        progressMonth === ALL_MONTH_VALUE || item.evaluationMonth === progressMonth;
      const matchKeyword =
        !keyword ||
        item.evaluatorName.toLowerCase().includes(keyword) ||
        item.employeeName.toLowerCase().includes(keyword) ||
        item.evaluatorNip.toLowerCase().includes(keyword);
      return matchYear && matchMonth && matchKeyword;
    });
  }, [evaluations, progressMonth, progressSearch, progressYear]);

  const reviewerProgressRows = useMemo<ReviewerProgressRow[]>(() => {
    const targetCount = Math.max(employees.length - 1, 0);
    const byEvaluator = new Map<number, { employeeIds: Set<number>; latestCreatedAt: string | null }>();

    allFilteredProgress.forEach((item) => {
      const current = byEvaluator.get(item.evaluatorEmployeeId) || {
        employeeIds: new Set<number>(),
        latestCreatedAt: null
      };
      current.employeeIds.add(item.employeeId);
      if (!current.latestCreatedAt || new Date(item.updatedAt || item.createdAt).getTime() > new Date(current.latestCreatedAt).getTime()) {
        current.latestCreatedAt = item.updatedAt || item.createdAt;
      }
      byEvaluator.set(item.evaluatorEmployeeId, current);
    });

    return employees
      .map((employee) => {
        const current = byEvaluator.get(employee.id);
        const completedCount = current?.employeeIds.size || 0;
        const percentage = targetCount ? Number(((completedCount / targetCount) * 100).toFixed(2)) : 0;
        return {
          evaluatorEmployeeId: employee.id,
          evaluatorName: employee.fullName,
          evaluatorNip: employee.nip,
          completedCount,
          targetCount,
          percentage,
          latestCreatedAt: current?.latestCreatedAt || null
        };
      })
      .sort((a, b) => a.percentage - b.percentage || a.evaluatorName.localeCompare(b.evaluatorName));
  }, [allFilteredProgress, employees]);

  const reviewerProgressSummary = useMemo(() => {
    const startedCount = reviewerProgressRows.filter((item) => item.completedCount > 0).length;
    const notStartedCount = reviewerProgressRows.filter((item) => item.completedCount === 0).length;
    const completedCount = reviewerProgressRows.filter((item) => item.percentage >= 100).length;

    return {
      startedCount,
      notStartedCount,
      completedCount
    };
  }, [reviewerProgressRows]);

  const formSummary = useMemo(() => {
    return questionGroups.map((group) => {
      const value =
        group.questions.reduce((sum, question) => sum + Number(form[question.key]), 0) /
        group.questions.length;
      return {
        label: group.label,
        value: Number(value.toFixed(2))
      };
    });
  }, [form]);

  const openCreateForm = () => {
    const firstTarget = employees.find(
      (employee) => employee.id !== currentEmployeeId && !evaluatedTargetIds.has(employee.id)
    );

    if (!firstTarget) {
      window.alert(
        `Semua pegawai pada ${formatMonthLabel(
          form.evaluationYear,
          form.evaluationMonth
        )} sudah Anda nilai. Pilih bulan lain atau gunakan tombol edit untuk memperbarui nilai periode ini.`
      );
      return;
    }

    setEditingEvaluationId(null);
    setForm({
      ...buildInitialForm(currentEmployeeId),
      evaluationYear: form.evaluationYear,
      evaluationMonth: form.evaluationMonth,
      employeeId: firstTarget.id
    });
    setIsFormOpen(true);
  };

  const openEditForm = (item: BerakhlakEvaluation) => {
    setEditingEvaluationId(item.id);
    setForm(mapEvaluationToForm(item));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEvaluationId(null);
    setForm((prev) => ({
      ...buildInitialForm(currentEmployeeId),
      evaluationYear: prev.evaluationYear,
      evaluationMonth: prev.evaluationMonth
    }));
  };

  const handleSliderChange = (key: QuestionFieldKey, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: Number(value)
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!currentEmployeeId) {
      window.alert("Data pegawai login tidak ditemukan.");
      return;
    }

    if (!form.employeeId) {
      window.alert("Pilih pegawai yang dinilai terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        evaluatorEmployeeId: currentEmployeeId
      };

      if (editingEvaluationId) {
        await updateBerakhlakEvaluation(editingEvaluationId, payload);
        window.alert("Perbaikan penilaian berhasil disimpan.");
      } else {
        await createBerakhlakEvaluation(payload);
        window.alert("Penilaian 360 BerAKHLAK berhasil disimpan.");
      }

      await loadBaseData();
      if (!isPegawaiRole) {
        await loadDashboardData();
      }
      closeForm();
    } catch (error: any) {
      window.alert(
        error?.response?.data?.message || "Gagal menyimpan penilaian 360 BerAKHLAK."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <SectionHeader
        title="Penilaian 360 BerAKHLAK"
        description="Penilai dapat menginput satu kali untuk setiap pegawai pada setiap periode bulan. Data pada bulan yang sama tetap bisa diperbaiki melalui tombol edit."
      />

      <div className="hero-panel berakhlak-hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">WeKip 360</span>
          <h2>Penilaian BerAKHLAK yang fokus, rapi, dan terhubung dengan akun login pegawai</h2>
          <p>
            Nama penilai mengikuti pegawai yang sedang login. Pegawai yang sudah dinilai pada bulan
            yang sama tidak akan muncul lagi pada form input baru, tetapi tetap bisa dinilai lagi pada bulan lain.
          </p>

          <div className="hero-metrics">
            <div
              className="hero-metric-card"
              style={getSoftMetricCardStyle("evaluator")}
            >
              <div
                aria-hidden="true"
                style={getSoftMetricTopBarStyle("evaluator")}
              />
              <small style={getSoftMetricSmallStyle()}>Nama penilai</small>
              <strong style={getSoftMetricValueStyle("evaluator")}>
                {currentEmployee?.fullName || user?.fullName || "-"}
              </strong>
              <span style={getSoftMetricCaptionStyle("evaluator")}>
                {currentEmployee?.nip || user?.nip || "Pegawai login aktif"}
              </span>
            </div>
            <div
              className="hero-metric-card"
              style={getSoftMetricCardStyle("totalInput")}
            >
              <div
                aria-hidden="true"
                style={getSoftMetricTopBarStyle("totalInput")}
              />
              <small style={getSoftMetricSmallStyle()}>Total input saya</small>
              <strong style={getSoftMetricValueStyle("totalInput")}>
                {myEvaluations.length}
              </strong>
              <span style={getSoftMetricCaptionStyle("totalInput")}>
                Riwayat penilaian yang sudah saya kirim
              </span>
            </div>
            <div
              className="hero-metric-card"
              style={getAverageMetricCardStyle(
                receivedAverageScore,
                receivedEvaluations.length > 0
              )}
            >
              <div
                aria-hidden="true"
                style={getAverageMetricTopBarStyle(
                  receivedAverageScore,
                  receivedEvaluations.length > 0
                )}
              />
              <small style={getMinimalCardLabelStyle()}>Rata rata nilai dari pegawai lain</small>
              <strong
                style={getAverageMetricValueStyle(
                  receivedAverageScore,
                  receivedEvaluations.length > 0
                )}
              >
                {formatNumber(receivedAverageScore)}
              </strong>
              <span
                style={getAverageMetricCaptionStyle(
                  receivedAverageScore,
                  receivedEvaluations.length > 0
                )}
              >
                {receivedEvaluations.length
                  ? `${getScoreLabel(receivedAverageScore)} · ${receivedEvaluations.length} penilaian diterima`
                  : "Belum ada penilaian dari pegawai lain"}
              </span>
            </div>
          </div>
        </div>

        <div className="hero-side-card berakhlak-menu-card">
          <div className="quick-tabs-grid">
            {allowedTabs.includes("form") ? (
              <button
                type="button"
                className={activeTab === "form" ? "quick-tab active" : "quick-tab"}
                onClick={() => setActiveTab("form")}
              >
                <span className="quick-tab-icon">📝</span>
                <strong>Form</strong>
                <small>Input dan edit</small>
              </button>
            ) : null}

            {allowedTabs.includes("recap") ? (
              <button
                type="button"
                className={activeTab === "recap" ? "quick-tab active" : "quick-tab"}
                onClick={() => setActiveTab("recap")}
              >
                <span className="quick-tab-icon">📂</span>
                <strong>Rekap Saya</strong>
                <small>Riwayat login saya</small>
              </button>
            ) : null}

            {allowedTabs.includes("dashboard") ? (
              <button
                type="button"
                className={activeTab === "dashboard" ? "quick-tab active" : "quick-tab"}
                onClick={() => setActiveTab("dashboard")}
              >
                <span className="quick-tab-icon">📊</span>
                <strong>Dashboard Admin</strong>
                <small>Ringkasan nilai</small>
              </button>
            ) : null}

            {allowedTabs.includes("progress") ? (
              <button
                type="button"
                className={activeTab === "progress" ? "quick-tab active" : "quick-tab"}
                onClick={() => setActiveTab("progress")}
              >
                <span className="quick-tab-icon">📈</span>
                <strong>Rekap Penilai</strong>
                <small>Progress penilai</small>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {activeTab === "form" ? (
        <div className="page-stack">
          <div className="panel form-dashboard-panel">
            <div className="panel-heading compact panel-heading-split">
              <div>
                <h3>Dashboard form penilaian</h3>
                <p>
                  Tabel di bawah hanya menampilkan pegawai yang sudah Anda nilai. Gunakan tombol
                  edit untuk perbaikan dan tombol input nilai untuk pegawai yang belum pernah Anda nilai.
                </p>
              </div>
              <button type="button" className="button-primary" onClick={openCreateForm}>
                Input Nilai
              </button>
            </div>

            <div className="filter-toolbar">
              <label>
                <span>Tahun</span>
                <select
                  value={form.evaluationYear}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      evaluationYear: Number(event.target.value)
                    }))
                  }
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Bulan</span>
                <select
                  value={form.evaluationMonth}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      evaluationMonth: Number(event.target.value)
                    }))
                  }
                >
                  {MONTH_OPTIONS.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </label>

              <label className="filter-search-field">
                <span>Cari pegawai</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama atau NIP pegawai"
                />
              </label>
            </div>


            <div
              className="stats-grid stats-grid-four compact-stats-grid form-dashboard-widgets"
              style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
            >
              <div className="stats-card" style={getProgressCardStyle(periodCompletionPercentage)}>
                <span style={getProgressCardTopBarStyle(periodCompletionPercentage)} />
                <span className="stats-label" style={getMinimalCardLabelStyle()}>Pegawai Sudah Dinilai</span>
                <strong style={getProgressValueStyle(periodCompletionPercentage)}>
                  {formatNumber(periodCompletionPercentage)}% · {myPeriodEvaluations.length} pegawai
                </strong>
                <small style={getProgressCaptionStyle(periodCompletionPercentage)}>
                  {myPeriodEvaluations.length} dari {totalTargetEmployees} target pada periode terpilih
                </small>
              </div>
              <div className="stats-card" style={getProgressCardStyle(cumulativeRemainingVisualScore)}>
                <span style={getProgressCardTopBarStyle(cumulativeRemainingVisualScore)} />
                <span className="stats-label" style={getMinimalCardLabelStyle()}>Belum Dinilai</span>
                <strong style={getProgressValueStyle(cumulativeRemainingVisualScore)}>
                  {cumulativeRemainingTargets} · {formatNumber(cumulativeRemainingPercentage)}%
                </strong>
                <small style={getProgressCaptionStyle(cumulativeRemainingVisualScore)}>
                  Sisa {cumulativeRemainingTargets} dari {cumulativeTargetEmployees} target {cumulativeTargetPeriodLabel}
                </small>
              </div>
              <StyledMetricCard
                title="Rata rata Periode"
                value={formatNumber(periodAverage)}
                caption="Rata rata nilai Anda pada periode aktif"
                variant="violet"
                valueStyle={periodAverage ? getAverageMetricValueStyle(periodAverage, true) : undefined}
                captionStyle={periodAverage ? getAverageMetricCaptionStyle(periodAverage, true) : undefined}
              />
            </div>

            <div className="summary-banner">
              <span>
                Menampilkan data {formatMonthLabel(form.evaluationYear, form.evaluationMonth)}.
              </span>
              <strong>
                {formatNumber(periodCompletionPercentage)}% tercapai · {myPeriodEvaluations.length} dari {totalTargetEmployees} pegawai sudah Anda nilai
              </strong>
            </div>
          </div>

          <div className="panel dashboard-table-panel">
            <div className="panel-heading compact panel-heading-split">
              <div>
                <h3>Daftar pegawai yang sudah dinilai</h3>
                <p>Daftar ini hanya menampilkan penilaian yang dibuat oleh pegawai yang sedang login.</p>
              </div>
              <Badge text={`${myFilteredEvaluations.length} data`} tone="neutral" />
            </div>

            <DataTable
              headers={[
                "No",
                "Pegawai Dinilai",
                "Periode",
                "Nilai",
                "Status",
                "Diperbarui",
                "Aksi"
              ]}
            >
              {myFilteredEvaluations.length ? (
                myFilteredEvaluations.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{item.employeeName}</strong>
                      <div className="muted-text">{item.employeeNip}</div>
                    </td>
                    <td>{formatMonthLabel(item.evaluationYear, item.evaluationMonth)}</td>
                    <td>
                      <strong>{formatNumber(item.finalScore)}</strong>
                    </td>
                    <td>
                      <Badge text={getScoreLabel(item.finalScore)} tone={getScoreTone(item.finalScore)} />
                    </td>
                    <td>{formatDateTime(item.updatedAt || item.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => openEditForm(item)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty-state-cell">
                    Belum ada pegawai yang Anda nilai pada periode ini.
                  </td>
                </tr>
              )}
            </DataTable>
          </div>

          {isFormOpen ? (
            <div className="berakhlak-dialog-backdrop" onClick={closeForm}>
              <div className="berakhlak-dialog" onClick={(event) => event.stopPropagation()}>
                <div className="berakhlak-dialog-header">
                  <div>
                    <span className="hero-eyebrow">{editingEvaluationId ? "Edit Nilai" : "Input Nilai"}</span>
                    <h3>Form penilaian 360 BerAKHLAK</h3>
                    <p>
                      {editingEvaluationId
                        ? "Perbarui nilai yang sudah pernah Anda kirim."
                        : "Pegawai yang sudah Anda nilai pada periode bulan yang sama tidak akan muncul lagi pada daftar target."}
                    </p>
                  </div>
                  <button type="button" className="button-secondary" onClick={closeForm}>
                    Tutup
                  </button>
                </div>

                <form className="form-grid" onSubmit={handleSubmit}>
                  <label>
                    <span>Tahun</span>
                    <select
                      value={form.evaluationYear}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          evaluationYear: Number(event.target.value)
                        }))
                      }
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Bulan</span>
                    <select
                      value={form.evaluationMonth}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          evaluationMonth: Number(event.target.value)
                        }))
                      }
                    >
                      {MONTH_OPTIONS.map((month, index) => (
                        <option key={month} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Nama Penilai</span>
                    <input
                      readOnly
                      value={
                        currentEmployee
                          ? `${currentEmployee.fullName} · ${currentEmployee.nip}`
                          : `${user?.fullName || "-"} · ${user?.nip || "-"}`
                      }
                    />
                  </label>

                  <label>
                    <span>Pegawai Dinilai</span>
                    {editingEvaluationId ? (
                      <input
                        readOnly
                        value={
                          availableEmployees.find((employee) => employee.id === form.employeeId)
                            ? `${availableEmployees.find((employee) => employee.id === form.employeeId)?.fullName} · ${availableEmployees.find((employee) => employee.id === form.employeeId)?.nip}`
                            : `${myEvaluations.find((item) => item.employeeId === form.employeeId)?.employeeName || "-"} · ${myEvaluations.find((item) => item.employeeId === form.employeeId)?.employeeNip || "-"}`
                        }
                      />
                    ) : (
                      <select
                        value={form.employeeId}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            employeeId: Number(event.target.value)
                          }))
                        }
                        required
                      >
                        <option value={0}>Pilih pegawai dinilai</option>
                        {availableEmployees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.fullName} · {employee.nip}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>

                  <div className="field-full question-group-stack">
                    {questionGroups.map((group) => (
                      <div className="question-card" key={group.key}>
                        <div className="question-card-head">
                          <div className="question-card-title">
                            <span className="question-card-icon">{group.icon}</span>
                            <div>
                              <h4>{group.label}</h4>
                              <p>Tiga indikator penilaian dengan nilai awal 50.</p>
                            </div>
                          </div>
                          <span
                            className="badge score-badge-dynamic"
                            style={getScoreBadgeStyle(
                              formSummary.find((item) => item.label === group.label)?.value || 0
                            )}
                          >
                            {formatNumber(
                              formSummary.find((item) => item.label === group.label)?.value || 0
                            )}
                          </span>
                        </div>

                        <div className="question-list">
                          {group.questions.map((question) => {
                            const questionScore = form[question.key];
                            const questionScoreStyle = getScoreBadgeStyle(questionScore);

                            return (
                              <div className="range-field" key={question.key}>
                                <div className="range-head">
                                  <span>{question.label}</span>
                                  <strong
                                    className="score-value-pill"
                                    style={questionScoreStyle}
                                  >
                                    {questionScore}
                                  </strong>
                                </div>
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={questionScore}
                                  style={getSliderStyle(questionScore)}
                                  onChange={(event) => handleSliderChange(question.key, event.target.value)}
                                />
                                <div className="range-scale">
                                  <small>0</small>
                                  <small>50</small>
                                  <small>100</small>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <label className="field-full">
                    <span>Catatan Penilaian</span>
                    <textarea
                      rows={4}
                      value={form.note}
                      onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                      placeholder="Tambahkan catatan jika diperlukan"
                    />
                  </label>

                  <div className="form-actions">
                    <button type="button" className="button-secondary" onClick={closeForm}>
                      Tutup Form
                    </button>
                    <button type="submit" className="button-primary" disabled={isSubmitting}>
                      {isSubmitting
                        ? "Menyimpan..."
                        : editingEvaluationId
                          ? "Simpan Perbaikan"
                          : "Simpan Penilaian"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === "recap" ? (
        <div className="page-stack">
          <div className="panel">
            <div className="panel-heading compact panel-heading-split">
              <div>
                <h3>Rekap penilaian saya</h3>
                <p>Riwayat penilaian yang sudah dikirim oleh pegawai yang sedang login.</p>
              </div>
              <Badge text={currentEmployee?.fullName || user?.fullName || "Pegawai login"} tone="neutral" />
            </div>

            <div className="filter-toolbar">
              <label>
                <span>Tahun</span>
                <select value={recapYear} onChange={(event) => setRecapYear(Number(event.target.value))}>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Bulan</span>
                <select
                  value={recapMonth}
                  onChange={(event) => setRecapMonth(Number(event.target.value))}
                >
                  <option value={ALL_MONTH_VALUE}>Seluruh Bulan</option>
                  {MONTH_OPTIONS.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="inline-summary" style={{ marginBottom: "1rem" }}>
              <Badge text={recapPeriodLabel} tone="neutral" />
              <span className="muted-text">
                {recapMonth === ALL_MONTH_VALUE
                  ? "Rata-rata pegawai dihitung dari seluruh bulan dalam tahun yang sama."
                  : "Rata-rata pegawai dihitung pada bulan yang dipilih."}
              </span>
            </div>

            <DataTable
              headers={
                recapMonth === ALL_MONTH_VALUE
                  ? [
                      "Update Terakhir",
                      "Pegawai Dinilai",
                      "Periode",
                      "Rata-rata Nilai",
                      "Predikat",
                      "Keterangan"
                    ]
                  : [
                      "Tanggal",
                      "Pegawai Dinilai",
                      "Periode",
                      "Nilai",
                      "Rata-rata Pegawai",
                      "Predikat",
                      "Catatan"
                    ]
              }
            >
              {recapMonth === ALL_MONTH_VALUE ? (
                myRecapYearlyEmployeeRows.length ? (
                  myRecapYearlyEmployeeRows.map((item) => (
                    <tr key={item.employeeId}>
                      <td>{formatDateTime(item.latestDate)}</td>
                      <td>
                        <strong>{item.employeeName}</strong>
                        <div className="muted-text">{item.employeeNip}</div>
                      </td>
                      <td>Seluruh bulan {recapYear}</td>
                      <td>
                        <strong style={{ color: getScoreColor(item.averageScore) }}>
                          {formatNumber(item.averageScore)}
                        </strong>
                      </td>
                      <td>
                        <Badge
                          text={getScoreLabel(item.averageScore)}
                          tone={getScoreTone(item.averageScore)}
                        />
                      </td>
                      <td>
                        <div>{`Rata-rata ${item.totalInputs} input pada tahun ${recapYear}`}</div>
                        <div className="muted-text">
                          {item.latestNote || "Ringkasan seluruh bulan tahun yang sama"}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-state-cell">
                      Belum ada riwayat penilaian pada periode {recapPeriodLabel}.
                    </td>
                  </tr>
                )
              ) : myRecapEvaluations.length ? (
                myRecapEvaluations.map((item) => {
                  const employeeAverageScore = myEmployeeAverageMap.get(item.employeeId) || 0;

                  return (
                    <tr key={item.id}>
                      <td>{formatDateTime(item.updatedAt || item.createdAt)}</td>
                      <td>
                        <strong>{item.employeeName}</strong>
                        <div className="muted-text">{item.employeeNip}</div>
                      </td>
                      <td>{formatMonthLabel(item.evaluationYear, item.evaluationMonth)}</td>
                      <td>{formatNumber(item.finalScore)}</td>
                      <td>
                        <strong style={{ color: getScoreColor(employeeAverageScore) }}>
                          {formatNumber(employeeAverageScore)}
                        </strong>
                        <div className="muted-text">
                          {`Rata-rata bulan ${MONTH_OPTIONS[recapMonth - 1]} ${recapYear}`}
                        </div>
                      </td>
                      <td>
                        <Badge text={getScoreLabel(item.finalScore)} tone={getScoreTone(item.finalScore)} />
                      </td>
                      <td>{item.note || "-"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="empty-state-cell">
                    Belum ada riwayat penilaian pada periode {recapPeriodLabel}.
                  </td>
                </tr>
              )}
            </DataTable>
          </div>
        </div>
      ) : null}

      {activeTab === "progress" ? (
        <div className="page-stack">
          <div className="panel">
            <div className="panel-heading compact">
              <div>
                <h3>Dashboard rekap penilai</h3>
                <p>Monitoring progres seluruh penilai pada tahun dan bulan yang dipilih. Pilih Seluruh Bulan untuk melihat akumulasi satu tahun.</p>
              </div>
            </div>

            <div className="filter-toolbar">
              <label>
                <span>Tahun</span>
                <select value={progressYear} onChange={(event) => setProgressYear(Number(event.target.value))}>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Bulan</span>
                <select value={progressMonth} onChange={(event) => setProgressMonth(Number(event.target.value))}>
                  <option value={ALL_MONTH_VALUE}>Seluruh Bulan</option>
                  {MONTH_OPTIONS.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </label>

              <label className="filter-search-field">
                <span>Cari penilai</span>
                <input
                  value={progressSearch}
                  onChange={(event) => setProgressSearch(event.target.value)}
                  placeholder="Cari nama penilai"
                />
              </label>
            </div>

            <div className="summary-banner">
              <span>
                Menampilkan data {progressMonth === ALL_MONTH_VALUE ? `seluruh bulan tahun ${progressYear}` : formatMonthLabel(progressYear, progressMonth)}.
              </span>
              <strong>
                {allFilteredProgress.length} penilaian · {reviewerProgressRows.length} penilai
              </strong>
            </div>

            <div
              className="stats-grid stats-grid-four compact-stats-grid form-dashboard-widgets"
              style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, alignItems: "stretch" }}
            >
              <StyledMetricCard title="Total Penilai" value={reviewerProgressRows.length} caption={progressMonth === ALL_MONTH_VALUE ? "Jumlah penilai pada tahun aktif" : "Jumlah penilai pada periode aktif"} variant="blue" />
              <StyledMetricCard title="Total Penilaian" value={allFilteredProgress.length} caption={progressMonth === ALL_MONTH_VALUE ? "Total input seluruh penilai pada tahun aktif" : "Total input seluruh penilai"} variant="teal" />
              <StyledMetricCard
                title="Rata rata per Penilai"
                value={formatNumber(reviewerProgressRows.length ? allFilteredProgress.length / reviewerProgressRows.length : 0)}
                caption={progressMonth === ALL_MONTH_VALUE ? "Rata rata jumlah target yang dinilai sepanjang tahun aktif" : "Rata rata jumlah target yang dinilai"}
                variant="violet"
              />
              <StyledMetricCard
                title="Tingkat Penyelesaian"
                value={`${formatNumber(reviewerProgressRows.length ? reviewerProgressRows.reduce((sum, item) => sum + item.percentage, 0) / reviewerProgressRows.length : 0)}%`}
                caption={progressMonth === ALL_MONTH_VALUE ? "Rata rata progres seluruh penilai pada tahun aktif" : "Rata rata progres seluruh penilai"}
                variant="amber"
              />
            </div>
          </div>

          <div className="panel dashboard-table-panel">
            <div className="panel-heading compact panel-heading-split">
              <div>
                <h3>Tabel progres penilai</h3>
                <p>Progres penilai berdasarkan target pegawai yang harus dinilai.</p>
              </div>
              <Badge text={`${reviewerProgressRows.length} penilai`} tone="neutral" />
            </div>

            <div className="progress-summary-strip">
              <span className="progress-summary-icon" aria-hidden="true">
                📊
              </span>
              <span>
                <strong>Summary Progress:</strong>{" "}
                <span className="progress-summary-good">
                  {reviewerProgressSummary.startedCount} pegawai sudah menilai
                </span>{" "}
                <span className="progress-summary-separator">|</span>{" "}
                <span className="progress-summary-danger">
                  {reviewerProgressSummary.notStartedCount} pegawai belum menilai
                </span>
                {reviewerProgressSummary.completedCount ? (
                  <>
                    {" "}<span className="progress-summary-separator">|</span>{" "}
                    <span className="progress-summary-complete">
                      {reviewerProgressSummary.completedCount} pegawai sudah lengkap
                    </span>
                  </>
                ) : null}
              </span>
            </div>

            <div className="table-wrap progress-table-wrap">
              <table className="table progress-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Penilai</th>
                    <th>Jumlah Dinilai</th>
                    <th>Target</th>
                    <th>Persentase</th>
                    <th>Status</th>
                    <th>Terakhir Menilai</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewerProgressRows.length ? (
                    reviewerProgressRows.map((item, index) => {
                      const visualState = getReviewerProgressVisualState(item.percentage);
                      const clampedPercentage = Math.max(0, Math.min(100, item.percentage));

                      return (
                        <tr
                          key={item.evaluatorEmployeeId}
                          className={`progress-row progress-row-${visualState.tone}`}
                        >
                          <td className="progress-no-cell">{index + 1}</td>
                          <td>
                            <div className="progress-reviewer">
                              <span className={`progress-score-dot progress-score-dot-${visualState.tone}`}>
                                {Math.round(clampedPercentage)}
                              </span>
                              <div>
                                <strong>{item.evaluatorName}</strong>
                                <div className={`progress-note progress-note-${visualState.tone}`}>
                                  <span className="progress-note-icon" aria-hidden="true">
                                    ⚠
                                  </span>
                                  <span>{visualState.note}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="progress-count-cell">
                            <strong className={`progress-count-value progress-count-value-${visualState.tone}`}>
                              {item.completedCount}
                            </strong>
                            <span
                              className={`progress-count-icon ${
                                item.completedCount > 0 ? "progress-count-icon-done" : "progress-count-icon-empty"
                              }`}
                              aria-hidden="true"
                            >
                              {item.completedCount > 0 ? "☑" : "✕"}
                            </span>
                          </td>
                          <td>
                            <span className="progress-target-text">{item.targetCount} pegawai</span>
                          </td>
                          <td>
                            <div className="progress-percent-cell">
                              <strong>{formatNumber(item.percentage)}%</strong>
                              <div className="progress-bar-row">
                                <div className="progress-bar-track" aria-hidden="true">
                                  <span
                                    className={`progress-bar-fill progress-bar-fill-${visualState.tone}`}
                                    style={{ width: `${clampedPercentage}%` }}
                                  />
                                </div>
                                <small>
                                  {item.completedCount}/{item.targetCount}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`progress-badge ${visualState.tone}`}>
                              <span aria-hidden="true">{visualState.icon}</span>
                              {visualState.label}
                            </span>
                          </td>
                          <td className="progress-last-cell">
                            {item.latestCreatedAt ? formatDateTime(item.latestCreatedAt) : "Belum pernah"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="empty-state-cell">
                        Belum ada progres penilai pada periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "dashboard" ? (
        <div className="page-stack">
          <div className="panel">
            <div className="panel-heading compact panel-heading-split">
              <div>
                <h3>Ringkasan nilai admin</h3>
                <p>
                  Rekap nilai seluruh pegawai dari penilaian 360 BerAKHLAK berdasarkan periode yang dipilih.
                </p>
              </div>
              <Badge text={dashboardPeriodLabel} tone="neutral" />
            </div>

            <div className="filter-toolbar">
              <label>
                <span>Tahun</span>
                <select
                  value={dashboardYear}
                  onChange={(event) => setDashboardYear(Number(event.target.value))}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Bulan</span>
                <select
                  value={dashboardMonth}
                  onChange={(event) => setDashboardMonth(Number(event.target.value))}
                >
                  <option value={ALL_MONTH_VALUE}>Seluruh Bulan</option>
                  {MONTH_OPTIONS.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Nama Pegawai</span>
                <select
                  value={dashboardEmployeeId}
                  onChange={(event) => setDashboardEmployeeId(Number(event.target.value))}
                >
                  <option value={ALL_EMPLOYEE_VALUE}>Seluruh Pegawai</option>
                  {dashboardEmployeeOptions.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName} ({employee.nip})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="summary-banner">
              <span>
                Menampilkan data {dashboardPeriodLabel} untuk {dashboardEmployeeLabel}.
              </span>
              <strong>
                {(dashboard?.totalEvaluations || 0)} penilaian · {(dashboard?.totalEmployeesEvaluated || 0)} pegawai dinilai
              </strong>
            </div>

            <div className="stats-grid compact-stats-grid">
              <StyledMetricCard
                title="Nilai Tertinggi"
                value={formatNumber(dashboardHighestScoreItem?.averageScore || 0)}
                caption={dashboardHighestScoreCaption}
                variant="teal"
                valueStyle={dashboardHighestScoreItem ? getAverageMetricValueStyle(dashboardHighestScoreItem.averageScore, true) : undefined}
                captionStyle={dashboardHighestScoreItem ? getAverageMetricCaptionStyle(dashboardHighestScoreItem.averageScore, true) : undefined}
              />
              <StyledMetricCard
                title="Nilai Terendah"
                value={formatNumber(dashboardLowestScoreItem?.averageScore || 0)}
                caption={dashboardLowestScoreCaption}
                variant="blue"
                valueStyle={dashboardLowestScoreItem ? getAverageMetricValueStyle(dashboardLowestScoreItem.averageScore, true) : undefined}
                captionStyle={dashboardLowestScoreItem ? getAverageMetricCaptionStyle(dashboardLowestScoreItem.averageScore, true) : undefined}
              />
              <StyledMetricCard
                title="Rata rata Nilai"
                value={formatNumber(dashboard?.averageScore || 0)}
                caption={
                  dashboardMonth === ALL_MONTH_VALUE
                    ? "Rata rata seluruh bulan pada tahun terpilih"
                    : "Rata rata nilai pada periode aktif"
                }
                variant="violet"
                valueStyle={dashboard?.averageScore ? getAverageMetricValueStyle(dashboard.averageScore, true) : undefined}
                captionStyle={dashboard?.averageScore ? getAverageMetricCaptionStyle(dashboard.averageScore, true) : undefined}
              />
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading compact panel-heading-split">
              <div>
                <h3>Top nilai pegawai</h3>
                <p>{dashboardTopTableSummaryLabel}</p>
              </div>
              <Badge
                text={`${dashboardSortedTopTableRows.length || 0} ${isSingleEmployeeAllMonthView ? "periode" : "pegawai"}`}
                tone="neutral"
              />
            </div>

            <div
              style={{
                overflowX: "auto",
                borderRadius: 18,
                border: "1px solid rgba(191, 219, 254, 0.4)",
                boxShadow: "0 14px 30px rgba(15, 23, 42, 0.06)",
                background: "#ffffff"
              }}
            >
              <table style={{ width: "100%", minWidth: 1240, borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr>
                    {dashboardTopTableColumns.map((column) => {
                      const isActive = dashboardTopTableSortKey === column.key;
                      return (
                        <th
                          key={column.key}
                          style={column.highlight ? dashboardTopTableAverageHeaderStyle : dashboardTopTableHeaderBaseStyle}
                        >
                          <button
                            type="button"
                            onClick={() => handleDashboardTopTableSort(column.key)}
                            style={dashboardTopTableHeaderButtonStyle}
                          >
                            <span>{column.label}</span>
                            <span style={{ opacity: isActive ? 1 : 0.72 }}>
                              {getDashboardSortIndicator(isActive, dashboardTopTableSortDirection)}
                            </span>
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {dashboardSortedTopTableRows.length ? (
                    dashboardSortedTopTableRows.map((item) => (
                      <tr key={item.rowKey} style={{ background: "#ffffff" }}>
                        <td style={getDashboardTopTableCellStyle(false)}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <strong style={{ color: "#0f172a", fontSize: "0.98rem" }}>{item.label}</strong>
                            <span style={{ color: "#64748b", fontSize: "0.82rem" }}>{item.sublabel}</span>
                          </div>
                        </td>
                        <td style={getDashboardTopTableCellStyle(false)}>
                          <div style={getDashboardTopTableScoreTextStyle(item.pelayanan)}>{formatNumber(item.pelayanan)}</div>
                        </td>
                        <td style={getDashboardTopTableCellStyle(false)}>
                          <div style={getDashboardTopTableScoreTextStyle(item.akuntabel)}>{formatNumber(item.akuntabel)}</div>
                        </td>
                        <td style={getDashboardTopTableCellStyle(false)}>
                          <div style={getDashboardTopTableScoreTextStyle(item.kompeten)}>{formatNumber(item.kompeten)}</div>
                        </td>
                        <td style={getDashboardTopTableCellStyle(false)}>
                          <div style={getDashboardTopTableScoreTextStyle(item.harmonis)}>{formatNumber(item.harmonis)}</div>
                        </td>
                        <td style={getDashboardTopTableCellStyle(false)}>
                          <div style={getDashboardTopTableScoreTextStyle(item.loyal)}>{formatNumber(item.loyal)}</div>
                        </td>
                        <td style={getDashboardTopTableCellStyle(false)}>
                          <div style={getDashboardTopTableScoreTextStyle(item.adaptif)}>{formatNumber(item.adaptif)}</div>
                        </td>
                        <td style={getDashboardTopTableCellStyle(false)}>
                          <div style={getDashboardTopTableScoreTextStyle(item.kolaboratif)}>{formatNumber(item.kolaboratif)}</div>
                        </td>
                        <td style={getDashboardTopTableCellStyle(true)}>
                          <div style={getDashboardTopTableScoreTextStyle(item.averageScore, true)}>{formatNumber(item.averageScore)}</div>
                        </td>
                        <td style={getDashboardTopTableCellStyle(false)}>
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <span style={getDashboardTopTableCountBadgeStyle()}>{item.evaluationCount}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={dashboardTopTableColumns.length}
                        className="empty-state-cell"
                        style={{ padding: "18px 16px" }}
                      >
                        {isSingleEmployeeAllMonthView
                          ? "Belum ada riwayat nilai pegawai untuk seluruh bulan pada tahun ini."
                          : "Belum ada data dashboard admin pada periode ini."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {showDashboardDimensionChart ? (
            <div className="panel">
              <div className="panel-heading compact panel-heading-split">
                <div>
                  <h3>Grafik nilai komponen BerAKHLAK</h3>
                  <p>{dashboardDimensionChartDescription}</p>
                </div>
                <Badge text={`${dashboardDimensionRows.length} komponen`} tone="neutral" />
              </div>

              {dashboardDimensionRows.length ? (
                <div style={getDimensionChartWrapStyle(dashboardDimensionRows.length)}>
                  {dashboardDimensionRows.map((item) => (
                    <div key={item.key} style={getDimensionChartRowStyle(item.value)}>
                      <span style={getDimensionChartLabelStyle(item.value)}>{item.label}</span>
                      <div style={getDimensionChartTrackStyle()}>
                        <div style={getDimensionChartFillStyle(item.value)} />
                      </div>
                      <strong style={getDimensionChartValueStyle(item.value)}>{formatNumber(item.value)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-card">Belum ada data komponen BerAKHLAK pada periode ini.</div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
