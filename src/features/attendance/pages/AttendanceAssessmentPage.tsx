import { useEffect, useMemo, useState } from "react";
import { fetchAttendanceAssessments, saveAttendanceAssessment } from "@/features/attendance/api/attendanceApi";
import { fetchEmployees } from "@/features/employees/api/employeeApi";
import { Badge } from "@/shared/components/Badge";
import { DataTable } from "@/shared/components/DataTable";
import { SectionHeader } from "@/shared/components/SectionHeader";
import { StatsCard } from "@/shared/components/StatsCard";
import {
  AttendanceAssessment,
  AttendanceAssessmentPayload,
  Employee
} from "@/shared/types";
import { formatNumber, getScoreLabel } from "@/shared/utils/format";
import "@/shared/styles/employee-management-insights.css";
import "@/features/attendance/styles/attendance-assessment.css";

const monthOptions = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" }
];

const attendanceWeights = {
  tl1: 0.5,
  tl2: 1,
  tl3: 1.5,
  tl4: 2,
  psw1: 0.5,
  psw2: 1,
  psw3: 1.5,
  psw4: 2
};

const currentYear = new Date().getFullYear();
const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

const initialFormState: AttendanceAssessmentPayload = {
  employeeId: 0,
  assessmentYear: currentYear,
  assessmentMonth: new Date().getMonth() + 1,
  attendanceDays: 22,
  tl1Count: 0,
  tl2Count: 0,
  tl3Count: 0,
  tl4Count: 0,
  psw1Count: 0,
  psw2Count: 0,
  psw3Count: 0,
  psw4Count: 0,
  note: ""
};

const getFilterMonthLabel = (month: number | "all") => {
  if (month === "all") return "Seluruh Bulan";
  return monthOptions.find((item) => item.value === month)?.label || `Bulan ${month}`;
};

type AttendanceRowTone = "danger" | "warning" | "progress" | "success";

const getRowTone = (score: number): AttendanceRowTone => {
  if (score >= 90) return "success";
  if (score >= 75) return "progress";
  if (score >= 60) return "warning";
  return "danger";
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Belum ada";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Belum ada";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};

const clampNonNegative = (value: number) => Math.max(0, Number.isFinite(value) ? value : 0);

type AttendanceTableRow = {
  key: string;
  employeeName: string;
  position: string;
  periodTitle: string;
  periodSubtitle: string;
  totalTl: number;
  totalPsw: number;
  attendanceDays: number;
  totalPenaltyIndex: number;
  scoreValue: number;
  scoreCaption: string;
  lastUpdatedAt: string | null;
  lastUpdatedCaption: string;
  rowTone: AttendanceRowTone;
  actionRecord: AttendanceAssessment | null;
};

export const AttendanceAssessmentPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceAssessment[]>([]);
  const [formPeriodRecords, setFormPeriodRecords] = useState<AttendanceAssessment[]>([]);
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  const [filterEmployeeId, setFilterEmployeeId] = useState<number | "all">("all");
  const [form, setForm] = useState<AttendanceAssessmentPayload>(initialFormState);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const createInitialForm = (
    overrides: Partial<AttendanceAssessmentPayload> = {}
  ): AttendanceAssessmentPayload => ({
    ...initialFormState,
    assessmentYear: filterYear,
    assessmentMonth:
      filterMonth === "all" ? initialFormState.assessmentMonth : Number(filterMonth),
    ...overrides
  });

  useEffect(() => {
    void initializePage();
  }, []);

  useEffect(() => {
    void loadAssessments();
  }, [filterYear, filterMonth, filterEmployeeId]);

  useEffect(() => {
    if (!isFormVisible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFormVisible(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isFormVisible]);

  useEffect(() => {
    if (!isFormVisible || isEditing) return;
    void loadFormPeriodRecords(form.assessmentYear, form.assessmentMonth);
  }, [form.assessmentMonth, form.assessmentYear, isEditing, isFormVisible]);

  const initializePage = async () => {
    try {
      const employeeData = await fetchEmployees();
      const activeEmployees = employeeData.filter(
        (item) => String(item.activeStatus || "aktif") !== "tidak_aktif"
      );
      setEmployees(activeEmployees);
    } catch (error) {
      console.error(error);
    }
  };

  const loadAssessments = async () => {
    try {
      const response = await fetchAttendanceAssessments({
        year: filterYear,
        month: filterMonth === "all" ? undefined : Number(filterMonth),
        employeeId: filterEmployeeId === "all" ? undefined : Number(filterEmployeeId)
      });

      setRecords(response.data);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Data penilaian kehadiran belum dapat dimuat"
      );
    }
  };

  const loadFormPeriodRecords = async (year: number, month: number) => {
    try {
      const response = await fetchAttendanceAssessments({
        year,
        month
      });

      setFormPeriodRecords(response.data);
    } catch (error) {
      console.error(error);
      setFormPeriodRecords([]);
    }
  };

  const activeFilterEmployee = useMemo(
    () => employees.find((item) => item.id === Number(filterEmployeeId)) || null,
    [employees, filterEmployeeId]
  );

  const occupiedEmployeeIds = useMemo(
    () => new Set(formPeriodRecords.map((item) => item.employeeId)),
    [formPeriodRecords]
  );

  const availableFormEmployees = useMemo(
    () =>
      employees.filter((employee) => {
        if (isEditing && employee.id === Number(form.employeeId)) {
          return true;
        }

        return !occupiedEmployeeIds.has(employee.id);
      }),
    [employees, form.employeeId, isEditing, occupiedEmployeeIds]
  );

  const filterBadgeLabel = useMemo(
    () => `${getFilterMonthLabel(filterMonth)} .${filterYear}`,
    [filterMonth, filterYear]
  );

  const filterSummaryLabel = useMemo(() => {
    const monthText =
      filterMonth === "all" ? "seluruh bulan" : getFilterMonthLabel(filterMonth).toLowerCase();
    const employeeText = activeFilterEmployee?.fullName || "seluruh pegawai";
    return `Menampilkan data tahun ${filterYear} · ${monthText} · ${employeeText}.`;
  }, [activeFilterEmployee, filterMonth, filterYear]);

  const formPeriodLabel = useMemo(
    () =>
      `${monthOptions.find((item) => item.value === form.assessmentMonth)?.label || `Bulan ${form.assessmentMonth}`} ${form.assessmentYear}`,
    [form.assessmentMonth, form.assessmentYear]
  );

  const formPenaltyIndex = useMemo(() => {
    const penalty =
      form.tl1Count * attendanceWeights.tl1 +
      form.tl2Count * attendanceWeights.tl2 +
      form.tl3Count * attendanceWeights.tl3 +
      form.tl4Count * attendanceWeights.tl4 +
      form.psw1Count * attendanceWeights.psw1 +
      form.psw2Count * attendanceWeights.psw2 +
      form.psw3Count * attendanceWeights.psw3 +
      form.psw4Count * attendanceWeights.psw4;

    return Number(penalty.toFixed(2));
  }, [form]);

  const formMonthlyScore = useMemo(() => {
    const score = 100 - (formPenaltyIndex / Math.max(form.attendanceDays, 1)) * 100;
    return Number(Math.max(0, score).toFixed(2));
  }, [form.attendanceDays, formPenaltyIndex]);

  const monthlyAverage = useMemo(() => {
    if (!records.length) return 0;
    const total = records.reduce((sum, item) => sum + Number(item.monthlyScore || 0), 0);
    return Number((total / records.length).toFixed(2));
  }, [records]);

  const distinctEmployees = useMemo(
    () => new Set(records.map((item) => item.employeeId)).size,
    [records]
  );

  const targetEmployeeCount = useMemo(() => {
    if (filterEmployeeId === "all") {
      return employees.length;
    }

    return activeFilterEmployee ? 1 : 0;
  }, [activeFilterEmployee, employees.length, filterEmployeeId]);

  const assessedEmployeePercentage = useMemo(() => {
    if (!targetEmployeeCount) return 0;
    return Number(((distinctEmployees / targetEmployeeCount) * 100).toFixed(2));
  }, [distinctEmployees, targetEmployeeCount]);

  const mostDisciplined = useMemo(() => {
    return (
      records
        .slice()
        .sort((a, b) => Number(b.monthlyScore || 0) - Number(a.monthlyScore || 0))[0] || null
    );
  }, [records]);

  const needAttention = useMemo(() => {
    return (
      records
        .slice()
        .sort((a, b) => Number(a.monthlyScore || 0) - Number(b.monthlyScore || 0))[0] || null
    );
  }, [records]);

  const showYearlyRecap = filterMonth === "all" && filterEmployeeId === "all";

  const tableRows = useMemo<AttendanceTableRow[]>(() => {
    if (!showYearlyRecap) {
      return records.map((record) => {
        const monthlyScore = Number(record.monthlyScore || 0);

        return {
          key: String(record.id),
          employeeName: record.employeeName,
          position: record.position || "Jabatan belum diisi",
          periodTitle: `${record.monthLabel} ${record.assessmentYear}`,
          periodSubtitle: "Rekap bulanan",
          totalTl:
            Number(record.tl1Count || 0) +
            Number(record.tl2Count || 0) +
            Number(record.tl3Count || 0) +
            Number(record.tl4Count || 0),
          totalPsw:
            Number(record.psw1Count || 0) +
            Number(record.psw2Count || 0) +
            Number(record.psw3Count || 0) +
            Number(record.psw4Count || 0),
          attendanceDays: Number(record.attendanceDays || 0),
          totalPenaltyIndex: Number(record.totalPenaltyIndex || 0),
          scoreValue: monthlyScore,
          scoreCaption: getScoreLabel(monthlyScore),
          lastUpdatedAt: record.updatedAt || record.createdAt || null,
          lastUpdatedCaption: "",
          rowTone: getRowTone(monthlyScore),
          actionRecord: record
        };
      });
    }

    const groupedRows = new Map<number, AttendanceAssessment[]>();

    records.forEach((record) => {
      const employeeRecords = groupedRows.get(record.employeeId) || [];
      employeeRecords.push(record);
      groupedRows.set(record.employeeId, employeeRecords);
    });

    return Array.from(groupedRows.values())
      .map((employeeRecords) => {
        const sortedRecords = employeeRecords
          .slice()
          .sort((a, b) => Number(a.assessmentMonth || 0) - Number(b.assessmentMonth || 0));
        const firstRecord = sortedRecords[0];
        const latestRecord = employeeRecords
          .slice()
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt || 0).getTime() -
              new Date(a.updatedAt || a.createdAt || 0).getTime()
          )[0];
        const totalAttendanceDays = sortedRecords.reduce(
          (sum, item) => sum + Number(item.attendanceDays || 0),
          0
        );
        const totalTl = sortedRecords.reduce(
          (sum, item) =>
            sum +
            Number(item.tl1Count || 0) +
            Number(item.tl2Count || 0) +
            Number(item.tl3Count || 0) +
            Number(item.tl4Count || 0),
          0
        );
        const totalPsw = sortedRecords.reduce(
          (sum, item) =>
            sum +
            Number(item.psw1Count || 0) +
            Number(item.psw2Count || 0) +
            Number(item.psw3Count || 0) +
            Number(item.psw4Count || 0),
          0
        );
        const totalPenaltyIndex = Number(
          sortedRecords
            .reduce((sum, item) => sum + Number(item.totalPenaltyIndex || 0), 0)
            .toFixed(2)
        );
        const annualScore = Number(
          (
            sortedRecords.reduce((sum, item) => sum + Number(item.monthlyScore || 0), 0) /
            Math.max(sortedRecords.length, 1)
          ).toFixed(2)
        );

        return {
          key: `annual-${firstRecord.employeeId}`,
          employeeName: firstRecord.employeeName,
          position: firstRecord.position || "Jabatan belum diisi",
          periodTitle: `Tahun ${filterYear}`,
          periodSubtitle: `${sortedRecords.length} bulan direkap`,
          totalTl,
          totalPsw,
          attendanceDays: totalAttendanceDays,
          totalPenaltyIndex,
          scoreValue: annualScore,
          scoreCaption: `${sortedRecords.length} bulan masuk rekap`,
          lastUpdatedAt: latestRecord?.updatedAt || latestRecord?.createdAt || null,
          lastUpdatedCaption: "",
          rowTone: getRowTone(annualScore),
          actionRecord: null
        };
      })
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName, "id"));
  }, [filterYear, records, showYearlyRecap]);

  const tableAverageScore = useMemo(() => {
    if (!tableRows.length) return 0;
    const total = tableRows.reduce((sum, item) => sum + Number(item.scoreValue || 0), 0);
    return Number((total / tableRows.length).toFixed(2));
  }, [tableRows]);

  const tableHeaders = useMemo(
    () =>
      showYearlyRecap
        ? [
            "No",
            "Pegawai",
            "Periode",
            "TL / PSW",
            "Indeks",
            "Nilai Setahun",
            "Terakhir Diubah"
          ]
        : [
            "No",
            "Pegawai",
            "Periode",
            "TL / PSW",
            "Indeks",
            "Nilai Bulanan",
            "Terakhir Diubah",
            "Aksi"
          ],
    [showYearlyRecap]
  );

  const tablePanelDescription = useMemo(
    () =>
      showYearlyRecap
        ? "Kombinasi filter seluruh bulan dan seluruh pegawai menampilkan rekap setahun per pegawai pada tahun aktif."
        : "Data bulanan lengkap dengan nilai kehadiran yang otomatis menyesuaikan periode aktif.",
    [showYearlyRecap]
  );

  const tableBadgeLabel = useMemo(
    () =>
      showYearlyRecap
        ? `${tableRows.length} rekap setahun`
        : `${tableRows.length} rekap`,
    [showYearlyRecap, tableRows.length]
  );

  const summaryTotalLabel = useMemo(
    () =>
      showYearlyRecap
        ? `${tableRows.length} rekap setahun · ${distinctEmployees} pegawai`
        : `${records.length} rekap · ${distinctEmployees} pegawai`,
    [distinctEmployees, records.length, showYearlyRecap, tableRows.length]
  );

  const handleChange = <K extends keyof AttendanceAssessmentPayload>(

    key: K,
    value: AttendanceAssessmentPayload[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const handleOpenCreateForm = () => {
    setIsEditing(false);
    setForm(createInitialForm());
    setIsFormVisible(true);
    setFeedback("");
    setErrorMessage("");
  };

  const handleEditRecord = (record: AttendanceAssessment) => {
    setIsEditing(true);
    setForm({
      employeeId: record.employeeId,
      assessmentYear: record.assessmentYear,
      assessmentMonth: record.assessmentMonth,
      attendanceDays: record.attendanceDays,
      tl1Count: record.tl1Count,
      tl2Count: record.tl2Count,
      tl3Count: record.tl3Count,
      tl4Count: record.tl4Count,
      psw1Count: record.psw1Count,
      psw2Count: record.psw2Count,
      psw3Count: record.psw3Count,
      psw4Count: record.psw4Count,
      note: record.note || ""
    });
    setFormPeriodRecords([record]);
    setIsFormVisible(true);
    setFeedback(
      `Mode edit aktif untuk ${record.employeeName} periode ${record.monthLabel} ${record.assessmentYear}.`
    );
    setErrorMessage("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    const submittedForm = { ...form };
    const wasEditing = isEditing;

    try {
      const response = await saveAttendanceAssessment(submittedForm);
      await Promise.all([
        loadAssessments(),
        loadFormPeriodRecords(submittedForm.assessmentYear, submittedForm.assessmentMonth)
      ]);

      setFeedback(response.message || "Rekap kehadiran berhasil disimpan");
      setIsFormVisible(true);

      if (wasEditing) {
        setForm(submittedForm);
        setIsEditing(true);
      } else {
        setForm(
          createInitialForm({
            assessmentYear: submittedForm.assessmentYear,
            assessmentMonth: submittedForm.assessmentMonth
          })
        );
        setIsEditing(false);
      }
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Rekap kehadiran belum berhasil disimpan"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <SectionHeader
        title="Penilaian Kehadiran"
        description="Rekap presensi bulanan pegawai dan hitung nilai kehadiran otomatis untuk tiap pegawai."
      />

      <div className="hero-panel evaluation-hero attendance-hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">Submenu baru manajemen pegawai</span>
          <h2>Rekap presensi bulanan dalam satu alur kerja</h2>
          <p>
            Modul ini menilai kehadiran berdasarkan rekap TL dan PSW tiap bulan.
            Setelah data bulanan tersimpan, sistem otomatis menghitung nilai bulanan
            untuk setiap pegawai.
          </p>
          <div className="hero-metrics">
            <div className="hero-metric-card">
              <small>Pegawai aktif</small>
              <strong>{employees.length}</strong>
              <span>Siap direkap untuk periode berjalan</span>
            </div>
            <div className="hero-metric-card">
              <small>Nilai terbaik</small>
              <strong>
                {mostDisciplined ? formatNumber(Number(mostDisciplined.monthlyScore || 0)) : "0"}
              </strong>
              <span>
                {mostDisciplined
                  ? `${mostDisciplined.employeeName} · ${mostDisciplined.monthLabel} ${mostDisciplined.assessmentYear}`
                  : "Belum ada data penilaian kehadiran"}
              </span>
            </div>
            <div className="hero-metric-card">
              <small>Perlu perhatian</small>
              <strong>{needAttention ? formatNumber(Number(needAttention.monthlyScore || 0)) : "0"}</strong>
              <span>
                {needAttention
                  ? `${needAttention.employeeName} · ${needAttention.monthLabel} ${needAttention.assessmentYear}`
                  : "Belum ada data penilaian kehadiran"}
              </span>
            </div>
          </div>
        </div>

        <div className="hero-side-card">
          <div className="panel-heading compact">
            <h3>Indeks pelanggaran presensi</h3>
            <p>Indeks ini mengurangi skor kehadiran tiap bulan.</p>
          </div>

          <div className="attendance-index-grid">
            {Object.entries(attendanceWeights).map(([key, weight]) => (
              <div key={key} className="attendance-index-item">
                <strong>{key.toUpperCase()}</strong>
                <span>Indeks {formatNumber(weight)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading compact panel-heading-split">
          <div>
            <h3>Ringkasan filter aktif</h3>
            <p>Pakai filter ini untuk melihat rekap bulanan tertentu atau seluruh bulan dalam tahun yang dipilih.</p>
          </div>
          <Badge text={filterBadgeLabel} tone="neutral" />
        </div>

        <div className="filter-toolbar attendance-filter-toolbar">
          <label>
            <span>Tahun</span>
            <select
              value={filterYear}
              onChange={(event) => setFilterYear(Number(event.target.value))}
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
              value={filterMonth}
              onChange={(event) => {
                const value = event.target.value;
                setFilterMonth(value === "all" ? "all" : Number(value));
              }}
            >
              <option value="all">Seluruh Bulan</option>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Nama Pegawai</span>
            <select
              value={filterEmployeeId}
              onChange={(event) => {
                const value = event.target.value;
                setFilterEmployeeId(value === "all" ? "all" : Number(value));
              }}
            >
              <option value="all">Seluruh Pegawai</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="button-primary attendance-toggle-button"
            onClick={() => {
              if (isFormVisible) {
                setIsFormVisible(false);
                return;
              }

              handleOpenCreateForm();
            }}
            aria-expanded={isFormVisible}
            aria-controls="attendance-input-form"
          >
            {isFormVisible ? "Tutup Form" : "Input Presensi"}
          </button>
        </div>

        <div className="summary-banner attendance-filter-banner">
          <span>{filterSummaryLabel}</span>
          <strong>
            {summaryTotalLabel}
          </strong>
        </div>
      </div>

      {isFormVisible ? (
        <div
          className="attendance-modal-backdrop"
          onClick={() => setIsFormVisible(false)}
          role="presentation"
        >
          <div
            className="attendance-modal"
            id="attendance-input-form"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="attendance-modal-header">
              <div className="panel-heading compact panel-heading-split">
                <div>
                  <h3 id="attendance-modal-title">
                    {isEditing ? "Edit rekap presensi bulanan" : "Form rekap presensi bulanan"}
                  </h3>
                  <p>
                    {isEditing
                      ? "Perbaiki data presensi pegawai pada periode ini. Pegawai dan periode dikunci agar perubahan tetap tepat."
                      : "Pilih pegawai yang belum direkap pada periode ini. Pegawai yang sudah diinput otomatis tidak tampil lagi di daftar pilihan."}
                  </p>
                </div>
                <Badge text={formPeriodLabel} tone="neutral" />
              </div>

              <button
                type="button"
                className="attendance-modal-close"
                onClick={() => setIsFormVisible(false)}
                aria-label="Tutup form rekap presensi"
              >
                ×
              </button>
            </div>

            <div className="attendance-modal-body">
              {feedback ? <div className="attendance-feedback success">{feedback}</div> : null}
              {errorMessage ? <div className="attendance-feedback danger">{errorMessage}</div> : null}

              <div className="attendance-filter-note">
                {isEditing
                  ? "Gunakan mode edit ini untuk memperbaiki data presensi yang sudah tersimpan."
                  : availableFormEmployees.length
                    ? `${availableFormEmployees.length} pegawai masih tersedia untuk diinput pada periode ${monthOptions.find((item) => item.value === form.assessmentMonth)?.label || `Bulan ${form.assessmentMonth}`} ${form.assessmentYear}.`
                    : `Semua pegawai aktif sudah memiliki rekap pada periode ${monthOptions.find((item) => item.value === form.assessmentMonth)?.label || `Bulan ${form.assessmentMonth}`} ${form.assessmentYear}. Gunakan tombol Edit pada tabel untuk memperbaiki data.`}
              </div>

              <form className="form-grid attendance-form-grid" onSubmit={handleSubmit}>
                <label>
                  <span>Pegawai</span>
                  <select
                    value={form.employeeId}
                    onChange={(event) => handleChange("employeeId", Number(event.target.value))}
                    required
                    disabled={isEditing}
                  >
                    <option value={0}>Pilih pegawai</option>
                    {availableFormEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName} · {employee.position || "Tanpa jabatan"}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Tahun</span>
                  <select
                    value={form.assessmentYear}
                    onChange={(event) => handleChange("assessmentYear", Number(event.target.value))}
                    disabled={isEditing}
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
                    value={form.assessmentMonth}
                    onChange={(event) => handleChange("assessmentMonth", Number(event.target.value))}
                    disabled={isEditing}
                  >
                    {monthOptions.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Hari hadir efektif</span>
                  <input
                    type="number"
                    min={1}
                    value={form.attendanceDays}
                    onChange={(event) =>
                      handleChange(
                        "attendanceDays",
                        clampNonNegative(Number(event.target.value) || 1)
                      )
                    }
                    required
                  />
                </label>

                <div className="field-full attendance-inline-group">
                  {[
                    ["tl1Count", "TL1"],
                    ["tl2Count", "TL2"],
                    ["tl3Count", "TL3"],
                    ["tl4Count", "TL4"]
                  ].map(([field, label]) => (
                    <label key={field} className="attendance-inline-field">
                      <span>{label}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={String(form[field as keyof AttendanceAssessmentPayload] as number)}
                        onChange={(event) => {
                          const sanitizedValue = event.target.value.replace(/[^0-9]/g, "");
                          handleChange(
                            field as keyof AttendanceAssessmentPayload,
                            clampNonNegative(Number(sanitizedValue || 0)) as never
                          );
                        }}
                      />
                    </label>
                  ))}
                </div>

                <div className="field-full attendance-inline-group">
                  {[
                    ["psw1Count", "PSW1"],
                    ["psw2Count", "PSW2"],
                    ["psw3Count", "PSW3"],
                    ["psw4Count", "PSW4"]
                  ].map(([field, label]) => (
                    <label key={field} className="attendance-inline-field">
                      <span>{label}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={String(form[field as keyof AttendanceAssessmentPayload] as number)}
                        onChange={(event) => {
                          const sanitizedValue = event.target.value.replace(/[^0-9]/g, "");
                          handleChange(
                            field as keyof AttendanceAssessmentPayload,
                            clampNonNegative(Number(sanitizedValue || 0)) as never
                          );
                        }}
                      />
                    </label>
                  ))}
                </div>

                <label className="field-full">
                  <span>Catatan</span>
                  <textarea
                    rows={3}
                    placeholder="Tambahkan catatan presensi bulan ini bila diperlukan"
                    value={form.note}
                    onChange={(event) => handleChange("note", event.target.value)}
                  />
                </label>

                <div className="field-full attendance-preview-grid">
                  <div className="attendance-preview-card">
                    <small>Indeks pengurang</small>
                    <strong>{formatNumber(formPenaltyIndex)}</strong>
                    <span>Akumulasi indeks TL dan PSW bulan ini</span>
                  </div>
                  <div className="attendance-preview-card">
                    <small>Nilai bulanan</small>
                    <strong>{formatNumber(formMonthlyScore)}</strong>
                    <span>{getScoreLabel(formMonthlyScore)}</span>
                  </div>
                </div>

                <div className="form-actions attendance-form-actions">
                  <button
                    type="submit"
                    className="button-primary"
                    disabled={isSubmitting || (!isEditing && !availableFormEmployees.length)}
                  >
                    {isSubmitting
                      ? "Menyimpan..."
                      : isEditing
                        ? "Simpan Perbaikan Presensi"
                        : "Simpan Rekap Kehadiran"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      <div className="stats-grid stats-grid-three">
        <StatsCard
          title="Total Rekap Bulanan"
          value={targetEmployeeCount}
          caption="Jumlah pegawai yang akan dinilai pada periode aktif"
        />
        <StatsCard
          title="Persentase Dinilai"
          value={`${formatNumber(assessedEmployeePercentage)}%`}
          caption="Persentase pegawai yang sudah dinilai pada periode aktif"
        />
        <StatsCard
          title={showYearlyRecap ? "Rata rata Setahun" : "Rata rata Bulanan"}
          value={formatNumber(showYearlyRecap ? tableAverageScore : monthlyAverage)}
          caption={
            showYearlyRecap
              ? "Rata rata nilai kehadiran tahunan dari seluruh pegawai pada tahun aktif"
              : "Rata rata nilai kehadiran dari seluruh rekap pada periode aktif"
          }
        />
      </div>

      <div className="panel">
        <div className="panel-heading compact panel-heading-split">
          <div>
            <h3>Rekap kehadiran bulanan</h3>
            <p>{tablePanelDescription}</p>
          </div>
          <Badge text={tableBadgeLabel} tone="neutral" />
        </div>

        <div className="attendance-progress-table">
          <DataTable headers={tableHeaders}>
            {tableRows.length ? (
              tableRows.map((row, index) => (
                <tr key={row.key} className={`attendance-table-row tone-${row.rowTone}`}>
                  <td className="attendance-cell-number">
                    <span className={`attendance-row-number tone-${row.rowTone}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="attendance-cell-employee">
                    <strong>{row.employeeName}</strong>
                    <div className="table-muted-text">{row.position}</div>
                  </td>
                  <td className="attendance-cell-period">
                    <strong>{row.periodTitle}</strong>
                    <div className="table-muted-text">{row.periodSubtitle}</div>
                  </td>
                  <td className="attendance-cell-infraction">
                    <div className="attendance-inline-pills">
                      <span className="attendance-mini-pill">TL {row.totalTl}</span>
                      <span className="attendance-mini-pill">PSW {row.totalPsw}</span>
                    </div>
                    <div className="table-muted-text">Hari hadir {row.attendanceDays}</div>
                  </td>
                  <td className="attendance-cell-index">
                    <strong>{formatNumber(row.totalPenaltyIndex)}</strong>
                  </td>
                  <td className="attendance-cell-score">
                    {showYearlyRecap ? (
                      <strong>{formatNumber(row.scoreValue)}</strong>
                    ) : (
                      <>
                        <strong>{formatNumber(row.scoreValue)}%</strong>
                        <div className="table-muted-text">{row.scoreCaption}</div>
                        <div className="attendance-score-bar" aria-hidden="true">
                          <span
                            className={`attendance-score-bar-fill tone-${row.rowTone}`}
                            style={{ width: `${Math.max(0, Math.min(100, row.scoreValue))}%` }}
                          />
                        </div>
                      </>
                    )}
                  </td>
                  <td className="attendance-cell-updated">
                    <strong>{formatDateTime(row.lastUpdatedAt)}</strong>
                  </td>
                  {!showYearlyRecap ? (
                    <td className="attendance-cell-action">
                      {row.actionRecord ? (
                        <button
                          type="button"
                          className="button-secondary attendance-table-action"
                          onClick={() => handleEditRecord(row.actionRecord as AttendanceAssessment)}
                        >
                          Edit
                        </button>
                      ) : (
                        <span className="table-muted-text">Pilih bulan tertentu untuk edit</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showYearlyRecap ? 7 : 8} className="empty-state-cell">
                  Belum ada rekap kehadiran pada filter yang dipilih.
                </td>
              </tr>
            )}
          </DataTable>
        </div>
      </div>
    </div>
  );
};
