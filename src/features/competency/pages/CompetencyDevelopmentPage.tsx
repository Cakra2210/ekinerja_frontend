import { useEffect, useMemo, useState } from "react";
import { fetchCompetencyDevelopmentRecap, saveCompetencyDevelopmentActivity, deleteCompetencyDevelopmentActivity } from "@/features/competency/api/competencyApi";
import { fetchEmployees } from "@/features/employees/api/employeeApi";
import { Badge } from "@/shared/components/Badge";
import { DataTable } from "@/shared/components/DataTable";
import { SectionHeader } from "@/shared/components/SectionHeader";
import { StatsCard } from "@/shared/components/StatsCard";
import {
  CompetencyDevelopmentActivity,
  CompetencyDevelopmentPayload,
  CompetencyDevelopmentRecap,
  Employee
} from "@/shared/types";
import { formatDate, formatNumber, getScoreLabel } from "@/shared/utils/format";
import "@/shared/styles/employee-management-insights.css";
import "@/features/attendance/styles/attendance-assessment.css";
import "@/features/competency/styles/competency-development.css";

const ROLE_OPTIONS = [
  { value: "peserta", label: "Peserta" },
  { value: "narasumber", label: "Narasumber" }
] as const;

const ACTIVITY_TYPE_OPTIONS = [
  "Pelatihan",
  "Bimtek",
  "Webinar",
  "Workshop",
  "Capacity Building",
  "Sosialisasi",
  "Coaching",
  "Mentoring"
];

const QUARTER_OPTIONS = [
  { value: 1, label: "Triwulan I" },
  { value: 2, label: "Triwulan II" },
  { value: 3, label: "Triwulan III" },
  { value: 4, label: "Triwulan IV" }
];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

const initialFormState: CompetencyDevelopmentPayload = {
  employeeId: 0,
  activityName: "",
  activityType: "Pelatihan",
  startDate: currentDate.toISOString().slice(0, 10),
  endDate: currentDate.toISOString().slice(0, 10),
  activityRole: "peserta",
  learningHours: 1,
  invitationFile: null,
  certificateFile: null,
  note: ""
};

type CompetencyRowTone = "danger" | "warning" | "progress" | "success";

const getRowTone = (score: number): CompetencyRowTone => {
  if (score >= 100) return "success";
  if (score >= 75) return "progress";
  if (score > 0) return "warning";
  return "danger";
};

const getQuarterLabel = (quarter: number) =>
  QUARTER_OPTIONS.find((item) => item.value === quarter)?.label || `Triwulan ${quarter}`;

const getFileUrl = (relativePath?: string | null) => {
  if (!relativePath) return null;

  const apiBaseUrl =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:5000/api";
  const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");

  if (/^https?:\/\//i.test(relativePath)) {
    return relativePath;
  }

  return `${serverBaseUrl}${relativePath.startsWith("/") ? "" : "/"}${relativePath}`;
};

export const CompetencyDevelopmentPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recapRows, setRecapRows] = useState<CompetencyDevelopmentRecap[]>([]);
  const [activityRows, setActivityRows] = useState<CompetencyDevelopmentActivity[]>([]);
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterQuarter, setFilterQuarter] = useState(currentQuarter);
  const [filterEmployeeId, setFilterEmployeeId] = useState<number | "all">("all");
  const [form, setForm] = useState<CompetencyDevelopmentPayload>(initialFormState);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetHours, setTargetHours] = useState(5);

  useEffect(() => {
    void initializePage();
  }, []);

  useEffect(() => {
    void loadCompetencyData();
  }, [filterEmployeeId, filterQuarter, filterYear]);

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

  const initializePage = async () => {
    try {
      const employeeData = await fetchEmployees();
      const activeEmployees = employeeData.filter(
        (item) => String(item.activeStatus || "aktif") !== "tidak_aktif"
      );
      setEmployees(activeEmployees);
    } catch (error) {
      console.error(error);
      setErrorMessage("Data pegawai belum dapat dimuat");
    }
  };

  const loadCompetencyData = async () => {
    try {
      setErrorMessage("");
      const response = await fetchCompetencyDevelopmentRecap({
        year: filterYear,
        quarter: filterQuarter,
        employeeId: filterEmployeeId === "all" ? undefined : Number(filterEmployeeId)
      });

      setRecapRows(response.recap);
      setActivityRows(response.activities);
      setTargetHours(response.meta?.quarterTargetHours || 5);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Data pengembangan kompetensi belum dapat dimuat"
      );
    }
  };

  const handleChange = <K extends keyof CompetencyDevelopmentPayload>(
    key: K,
    value: CompetencyDevelopmentPayload[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const resetForm = () => {
    setForm({
      ...initialFormState,
      startDate: currentDate.toISOString().slice(0, 10),
      endDate: currentDate.toISOString().slice(0, 10)
    });
  };

  const handleOpenCreateForm = () => {
    resetForm();
    setFeedback("");
    setErrorMessage("");
    setIsFormVisible(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const response = await saveCompetencyDevelopmentActivity(form);
      setFeedback(response.message || "Aktivitas pengembangan kompetensi berhasil disimpan");
      resetForm();
      setIsFormVisible(false);
      await loadCompetencyData();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Aktivitas pengembangan kompetensi gagal disimpan"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Hapus aktivitas pengembangan kompetensi ini?");
    if (!confirmed) return;

    try {
      await deleteCompetencyDevelopmentActivity(id);
      setFeedback("Aktivitas pengembangan kompetensi berhasil dihapus.");
      await loadCompetencyData();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Aktivitas pengembangan kompetensi gagal dihapus"
      );
    }
  };

  const activeFilterEmployee = useMemo(
    () => employees.find((item) => item.id === Number(filterEmployeeId)) || null,
    [employees, filterEmployeeId]
  );

  const filterBadgeLabel = useMemo(
    () => `${getQuarterLabel(filterQuarter)} · ${filterYear}`,
    [filterQuarter, filterYear]
  );

  const filterSummaryLabel = useMemo(() => {
    const employeeText = activeFilterEmployee?.fullName || "seluruh pegawai";
    return `Menampilkan data ${getQuarterLabel(filterQuarter)} ${filterYear} untuk ${employeeText}. Monitoring dilakukan per triwulan dengan target minimal ${targetHours} jam ekuivalen.`;
  }, [activeFilterEmployee, filterQuarter, filterYear, targetHours]);

  const selectedRoleIndex = useMemo(
    () => (form.activityRole === "narasumber" ? 1.25 : 1),
    [form.activityRole]
  );

  const estimatedEquivalentHours = useMemo(
    () => Number((Number(form.learningHours || 0) * selectedRoleIndex).toFixed(2)),
    [form.learningHours, selectedRoleIndex]
  );

  const totalEquivalentHours = useMemo(
    () => recapRows.reduce((sum, item) => sum + Number(item.equivalentHours || 0), 0),
    [recapRows]
  );

  const totalActualHours = useMemo(
    () => recapRows.reduce((sum, item) => sum + Number(item.actualHours || 0), 0),
    [recapRows]
  );

  const achievedCount = useMemo(
    () => recapRows.filter((item) => Number(item.quarterScore) >= 100).length,
    [recapRows]
  );

  const averageScore = useMemo(() => {
    if (!recapRows.length) return 0;
    const total = recapRows.reduce((sum, item) => sum + Number(item.quarterScore || 0), 0);
    return Number((total / recapRows.length).toFixed(2));
  }, [recapRows]);

  const reportedEmployeeCount = useMemo(
    () => recapRows.filter((item) => Number(item.activityCount || 0) > 0).length,
    [recapRows]
  );

  const reportingPercentage = useMemo(() => {
    if (!recapRows.length) return 0;
    return Number(((reportedEmployeeCount / recapRows.length) * 100).toFixed(2));
  }, [recapRows.length, reportedEmployeeCount]);

  const topPerformer = useMemo(
    () => recapRows.slice().sort((a, b) => Number(b.quarterScore || 0) - Number(a.quarterScore || 0))[0] || null,
    [recapRows]
  );

  const needAttention = useMemo(
    () => recapRows.slice().sort((a, b) => Number(a.quarterScore || 0) - Number(b.quarterScore || 0))[0] || null,
    [recapRows]
  );

  return (
    <div className="page-stack">
      <SectionHeader
        title="Pengembangan Kompetensi"
        description="Pelaporan aktivitas pelatihan, bimtek, webinar, workshop, dan capacity building pegawai untuk monitoring triwulanan dan evaluasi perbaikan kinerja."
      />

      <div className="hero-panel evaluation-hero attendance-hero competency-hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">Submenu baru manajemen pegawai</span>
          <h2>Pelaporan pengembangan kompetensi dengan pola rekap yang konsisten</h2>
          <p>
            Setiap pegawai melaporkan aktivitas pengembangan kompetensi yang diikuti dalam satu bulan terakhir.
            Data ini dipakai untuk monitoring triwulanan dan evaluasi dampaknya terhadap peningkatan kinerja.
          </p>
          <div className="hero-metrics">
            <div className="hero-metric-card">
              <small>Pegawai aktif</small>
              <strong>{employees.length}</strong>
              <span>Siap melaporkan aktivitas pengembangan kompetensi</span>
            </div>
            <div className="hero-metric-card">
              <small>Capaian terbaik</small>
              <strong>{topPerformer ? formatNumber(Number(topPerformer.quarterScore || 0)) : "0"}</strong>
              <span>
                {topPerformer
                  ? `${topPerformer.employeeName} · ${getQuarterLabel(filterQuarter)}`
                  : "Belum ada data triwulan aktif"}
              </span>
            </div>
            <div className="hero-metric-card">
              <small>Perlu perhatian</small>
              <strong>{needAttention ? formatNumber(Number(needAttention.quarterScore || 0)) : "0"}</strong>
              <span>
                {needAttention
                  ? `${needAttention.employeeName} · ${getQuarterLabel(filterQuarter)}`
                  : "Belum ada data triwulan aktif"}
              </span>
            </div>
          </div>
        </div>

        <div className="hero-side-card competency-side-card">
          <div className="panel-heading compact">
            <h3>Aturan monitoring kompetensi</h3>
            <p>Gunakan data ini untuk pelaporan rutin, monitoring triwulan, dan evaluasi hasil program.</p>
          </div>

          <div className="attendance-index-grid competency-index-grid">
            <div className="attendance-index-item">
              <strong>Target</strong>
              <span>{formatNumber(targetHours)} jam ekuivalen per triwulan</span>
            </div>
            <div className="attendance-index-item">
              <strong>Peserta</strong>
              <span>Jam diakui sesuai durasi kegiatan</span>
            </div>
            <div className="attendance-index-item">
              <strong>Narasumber</strong>
              <span>Jam diakui lebih tinggi untuk kontribusi materi</span>
            </div>
            <div className="attendance-index-item">
              <strong>Dokumen</strong>
              <span>Undangan dan sertifikat dapat dilampirkan</span>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading compact panel-heading-split">
          <div>
            <h3>Ringkasan filter aktif</h3>
            <p>Gunakan filter ini untuk meninjau capaian kompetensi pada triwulan tertentu atau satu pegawai tertentu.</p>
          </div>
          <Badge text={filterBadgeLabel} tone="neutral" />
        </div>

        <div className="filter-toolbar attendance-filter-toolbar competency-filter-toolbar">
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
            <span>Triwulan</span>
            <select
              value={filterQuarter}
              onChange={(event) => setFilterQuarter(Number(event.target.value))}
            >
              {QUARTER_OPTIONS.map((quarter) => (
                <option key={quarter.value} value={quarter.value}>
                  {quarter.label}
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
            aria-controls="competency-input-form"
          >
            {isFormVisible ? "Tutup Form" : "Input Aktivitas"}
          </button>
        </div>

        <div className="summary-banner attendance-filter-banner">
          <span>{filterSummaryLabel}</span>
          <strong>{activityRows.length} aktivitas tercatat</strong>
        </div>
      </div>

      {feedback ? <div className="attendance-feedback success">{feedback}</div> : null}
      {errorMessage ? <div className="attendance-feedback danger">{errorMessage}</div> : null}

      {isFormVisible ? (
        <div
          className="attendance-modal-backdrop"
          onClick={() => setIsFormVisible(false)}
          role="presentation"
        >
          <div
            className="attendance-modal competency-modal"
            id="competency-input-form"
            role="dialog"
            aria-modal="true"
            aria-labelledby="competency-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="attendance-modal-header">
              <div className="panel-heading compact panel-heading-split">
                <div>
                  <h3 id="competency-modal-title">Form rekap pengembangan kompetensi</h3>
                  <p>
                    Input setiap pelatihan, bimtek, webinar, workshop, atau capacity building yang diikuti pegawai.
                  </p>
                </div>
                <Badge text={getQuarterLabel(filterQuarter)} tone="neutral" />
              </div>

              <button
                type="button"
                className="attendance-modal-close"
                onClick={() => setIsFormVisible(false)}
                aria-label="Tutup form pengembangan kompetensi"
              >
                ×
              </button>
            </div>

            <div className="attendance-modal-body">
              <div className="attendance-filter-note competency-filter-note">
                Gunakan form ini untuk pelaporan aktivitas yang baru diikuti. Dokumen undangan dan sertifikat dapat dilampirkan agar monitoring lebih mudah diverifikasi.
              </div>

              <form className="form-grid attendance-form-grid competency-form-grid" onSubmit={handleSubmit}>
                <label>
                  <span>Pegawai</span>
                  <select
                    value={form.employeeId}
                    onChange={(event) => handleChange("employeeId", Number(event.target.value))}
                    required
                  >
                    <option value={0}>Pilih pegawai</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName} · {employee.position || "Tanpa jabatan"}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Jenis kegiatan</span>
                  <select
                    value={form.activityType}
                    onChange={(event) => handleChange("activityType", event.target.value)}
                    required
                  >
                    {ACTIVITY_TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field-full">
                  <span>Nama kegiatan</span>
                  <input
                    value={form.activityName}
                    onChange={(event) => handleChange("activityName", event.target.value)}
                    placeholder="Contoh: Webinar Reformasi Birokrasi dan penguatan budaya kerja"
                    required
                  />
                </label>

                <label>
                  <span>Tanggal mulai kegiatan</span>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) => handleChange("startDate", event.target.value)}
                    required
                  />
                </label>

                <label>
                  <span>Tanggal selesai kegiatan</span>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) => handleChange("endDate", event.target.value)}
                    required
                  />
                </label>

                <label>
                  <span>Peran dalam kegiatan</span>
                  <select
                    value={form.activityRole}
                    onChange={(event) =>
                      handleChange(
                        "activityRole",
                        event.target.value as CompetencyDevelopmentPayload["activityRole"]
                      )
                    }
                    required
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Jam pembelajaran</span>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={form.learningHours}
                    onChange={(event) => handleChange("learningHours", Number(event.target.value))}
                    required
                  />
                </label>

                <label>
                  <span>Upload undangan</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                    onChange={(event) =>
                      handleChange("invitationFile", event.target.files?.[0] || null)
                    }
                  />
                  <small className="competency-field-help">
                    PDF, DOC, DOCX, JPG, PNG, atau WEBP. Maksimal 5 MB.
                  </small>
                </label>

                <label>
                  <span>Upload sertifikat</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                    onChange={(event) =>
                      handleChange("certificateFile", event.target.files?.[0] || null)
                    }
                  />
                  <small className="competency-field-help">
                    Opsional. Lampiran sertifikat untuk bukti hasil kegiatan.
                  </small>
                </label>

                <label className="field-full">
                  <span>Catatan</span>
                  <textarea
                    rows={3}
                    placeholder="Isi ringkasan materi, manfaat, atau rencana tindak lanjut setelah kegiatan"
                    value={form.note}
                    onChange={(event) => handleChange("note", event.target.value)}
                  />
                </label>

                <div className="field-full attendance-preview-grid competency-preview-grid">
                  <div className="attendance-preview-card">
                    <small>Jam ekuivalen estimasi</small>
                    <strong>{formatNumber(estimatedEquivalentHours)}</strong>
                    <span>{form.activityRole === "narasumber" ? "Peran narasumber memberi bobot lebih tinggi" : "Peran peserta dihitung sesuai jam kegiatan"}</span>
                  </div>
                  <div className="attendance-preview-card">
                    <small>Periode monitoring</small>
                    <strong>{getQuarterLabel(Math.ceil((new Date(form.endDate || currentDate.toISOString().slice(0, 10)).getMonth() + 1) / 3))}</strong>
                    <span>{form.endDate ? `Berdasarkan tanggal selesai ${formatDate(form.endDate)}` : "Pilih tanggal selesai kegiatan"}</span>
                  </div>
                </div>

                <div className="form-actions attendance-form-actions">
                  <button type="submit" className="button-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Menyimpan..." : "Simpan Aktivitas Kompetensi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      <div className="stats-grid stats-grid-four">
        <StatsCard
          title="Pegawai Melapor"
          value={reportedEmployeeCount}
          caption="Jumlah pegawai yang sudah memiliki aktivitas pada filter aktif"
        />
        <StatsCard
          title="Persentase Pelaporan"
          value={`${formatNumber(reportingPercentage)}%`}
          caption="Persentase pegawai yang sudah tercatat pada periode aktif"
        />
        <StatsCard
          title="Jam Ekuivalen"
          value={formatNumber(totalEquivalentHours)}
          caption="Akumulasi jam ekuivalen seluruh pegawai pada filter aktif"
        />
        <StatsCard
          title="Rata rata Nilai"
          value={formatNumber(averageScore)}
          caption={`${achievedCount} pegawai sudah mencapai target triwulan`}
        />
      </div>

      <div className="panel">
        <div className="panel-heading compact panel-heading-split">
          <div>
            <h3>Rekap nilai pengembangan kompetensi</h3>
            <p>Tampilan rekap mengikuti pola form rekap presensi bulanan agar konsisten dengan halaman lain.</p>
          </div>
          <Badge text={`${recapRows.length} pegawai`} tone="neutral" />
        </div>

        <div className="attendance-progress-table competency-progress-table">
          <DataTable
            headers={[
              "No",
              "Pegawai",
              "Aktivitas",
              "Jam Aktual / Ekuivalen",
              "Nilai Triwulan",
              "Status",
              "Terakhir Lapor"
            ]}
          >
            {recapRows.length ? (
              recapRows.map((row, index) => {
                const tone = getRowTone(Number(row.quarterScore || 0));
                const completed = Number(row.quarterScore || 0) >= 100;

                return (
                  <tr key={row.employeeId} className={`attendance-table-row tone-${tone}`}>
                    <td className="attendance-cell-number">
                      <span className={`attendance-row-number tone-${tone}`}>{index + 1}</span>
                    </td>
                    <td className="attendance-cell-employee">
                      <strong>{row.employeeName}</strong>
                      <div className="table-muted-text">{row.position || row.nip}</div>
                    </td>
                    <td className="attendance-cell-period competency-activity-cell">
                      <strong>{row.activityCount} kegiatan</strong>
                      <div className="table-muted-text">
                        {row.narasumberCount} narasumber · {row.pesertaCount} peserta
                      </div>
                    </td>
                    <td className="attendance-cell-infraction competency-hours-cell">
                      <div className="attendance-inline-pills">
                        <span className="attendance-mini-pill">Aktual {formatNumber(Number(row.actualHours || 0))}</span>
                        <span className="attendance-mini-pill">Ekuiv {formatNumber(Number(row.equivalentHours || 0))}</span>
                      </div>
                      <div className="table-muted-text">Target {formatNumber(targetHours)} jam</div>
                    </td>
                    <td className="attendance-cell-score competency-score-cell">
                      <strong>{formatNumber(Number(row.quarterScore || 0))}%</strong>
                      <div className="table-muted-text">{getScoreLabel(Number(row.quarterScore || 0))}</div>
                      <div className="attendance-score-bar" aria-hidden="true">
                        <span
                          className={`attendance-score-bar-fill tone-${tone}`}
                          style={{ width: `${Math.min(100, Number(row.quarterScore || 0))}%` }}
                        />
                      </div>
                    </td>
                    <td>
                      <Badge
                        text={
                          completed
                            ? "Target Tercapai"
                            : Number(row.activityCount || 0) > 0
                              ? "Perlu Tambahan Jam"
                              : "Belum Melapor"
                        }
                        tone={completed ? "success" : Number(row.activityCount || 0) > 0 ? "warning" : "neutral"}
                      />
                    </td>
                    <td>
                      <strong>{row.lastActivityDate ? formatDate(row.lastActivityDate) : "Belum pernah"}</strong>
                      <div className="table-muted-text">
                        Sisa {formatNumber(Number(row.remainingHours || 0))} jam
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="empty-state-cell">
                  Belum ada data pengembangan kompetensi pada filter aktif.
                </td>
              </tr>
            )}
          </DataTable>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading compact panel-heading-split">
          <div>
            <h3>Log aktivitas pengembangan kompetensi</h3>
            <p>Detail aktivitas dan dokumen pendukung yang masuk pada periode filter aktif.</p>
          </div>
          <Badge text={`${activityRows.length} log`} tone="neutral" />
        </div>

        <DataTable
          headers={[
            "Periode Kegiatan",
            "Pegawai",
            "Aktivitas",
            "Peran / Jam",
            "Dokumen",
            "Catatan",
            "Aksi"
          ]}
        >
          {activityRows.length ? (
            activityRows.map((activity) => {
              const invitationUrl = getFileUrl(activity.invitationFileUrl || activity.invitationFilePath);
              const certificateUrl = getFileUrl(activity.certificateFileUrl || activity.certificateFilePath);

              return (
                <tr key={activity.id}>
                  <td>
                    <div className="competency-name-stack">
                      <strong>{formatDate(activity.startDate)}</strong>
                      <small>s.d. {formatDate(activity.endDate)}</small>
                    </div>
                  </td>
                  <td>
                    <div className="competency-name-stack">
                      <strong>{activity.employeeName}</strong>
                      <small>{activity.position || activity.nip}</small>
                    </div>
                  </td>
                  <td>
                    <div className="competency-name-stack">
                      <strong>{activity.activityName}</strong>
                      <small>{activity.activityType}</small>
                    </div>
                  </td>
                  <td>
                    <div className="competency-name-stack">
                      <strong>{ROLE_OPTIONS.find((item) => item.value === activity.activityRole)?.label || activity.activityRole}</strong>
                      <small>{formatNumber(Number(activity.learningHours || 0))} jam · ekuivalen {formatNumber(Number(activity.equivalentHours || 0))}</small>
                    </div>
                  </td>
                  <td>
                    <div className="competency-document-stack">
                      {invitationUrl ? (
                        <a href={invitationUrl} target="_blank" rel="noreferrer" className="competency-file-link">
                          Undangan
                        </a>
                      ) : (
                        <span className="table-muted-text">Undangan belum ada</span>
                      )}
                      {certificateUrl ? (
                        <a href={certificateUrl} target="_blank" rel="noreferrer" className="competency-file-link">
                          Sertifikat
                        </a>
                      ) : (
                        <span className="table-muted-text">Sertifikat belum ada</span>
                      )}
                    </div>
                  </td>
                  <td>{activity.note || "-"}</td>
                  <td>
                    <button
                      type="button"
                      className="button-danger"
                      onClick={() => void handleDelete(activity.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} className="empty-state-cell">
                Belum ada log aktivitas pada periode aktif.
              </td>
            </tr>
          )}
        </DataTable>
      </div>
    </div>
  );
};
