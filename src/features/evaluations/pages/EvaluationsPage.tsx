import { useEffect, useMemo, useState } from "react";
import { fetchEmployees } from "@/features/employees/api/employeeApi";
import { createEvaluation, fetchEvaluations } from "@/features/evaluations/api/evaluationApi";
import { fetchCriteria, fetchPeriods } from "@/features/references/api/referenceApi";
import { Badge } from "@/shared/components/Badge";
import { DataTable } from "@/shared/components/DataTable";
import { EvaluationForm } from "@/features/evaluations/components/EvaluationForm";
import { SectionHeader } from "@/shared/components/SectionHeader";
import { StatsCard } from "@/shared/components/StatsCard";
import {
  Criterion,
  Employee,
  Evaluation,
  EvaluationPayload,
  Period
} from "@/shared/types";
import { formatDate, formatNumber, getScoreLabel } from "@/shared/utils/format";
import "@/shared/styles/employee-management-insights.css";

type DimensionKey =
  | "teamwork"
  | "discipline"
  | "productivity"
  | "initiative"
  | "communication";

const dimensionLabels: Record<DimensionKey, string> = {
  teamwork: "Kerja Sama",
  discipline: "Disiplin",
  productivity: "Produktivitas",
  initiative: "Inisiatif",
  communication: "Komunikasi"
};

const getScoreTone = (score: number): "neutral" | "success" | "warning" => {
  if (score >= 80) return "success";
  if (score >= 70) return "neutral";
  return "warning";
};

export const EvaluationsPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    const [employeeData, periodData, criteriaData, evaluationData] = await Promise.all([
      fetchEmployees(),
      fetchPeriods(),
      fetchCriteria(),
      fetchEvaluations()
    ]);

    setEmployees(employeeData);
    setPeriods(periodData);
    setCriteria(criteriaData);
    setEvaluations(evaluationData);
  };

  const handleSubmit = async (payload: EvaluationPayload) => {
    await createEvaluation(payload);
    await loadData();
  };

  const activePeriod = useMemo(
    () => periods.find((item) => item.status?.toLowerCase() === "aktif") || periods[0] || null,
    [periods]
  );

  const averageScore = useMemo(() => {
    if (!evaluations.length) return 0;
    const total = evaluations.reduce((sum, item) => sum + Number(item.finalScore || 0), 0);
    return Number((total / evaluations.length).toFixed(2));
  }, [evaluations]);

  const dimensionAverages = useMemo(() => {
    const keys: DimensionKey[] = [
      "teamwork",
      "discipline",
      "productivity",
      "initiative",
      "communication"
    ];

    return keys.map((key) => {
      if (!evaluations.length) {
        return {
          key,
          label: dimensionLabels[key],
          value: 0
        };
      }

      const total = evaluations.reduce(
        (sum, item) => sum + Number(item[key] || 0),
        0
      );

      return {
        key,
        label: dimensionLabels[key],
        value: Number((total / evaluations.length).toFixed(2))
      };
    });
  }, [evaluations]);

  const bestDimension = useMemo(
    () => dimensionAverages.slice().sort((a, b) => b.value - a.value)[0],
    [dimensionAverages]
  );
  const weakestDimension = useMemo(
    () => dimensionAverages.slice().sort((a, b) => a.value - b.value)[0],
    [dimensionAverages]
  );

  return (
    <div className="page-stack">
      <SectionHeader
        title="Penilaian Pegawai"
        description="Tampilan penilaian kini lebih visual dengan grafik ringkas, insight cepat, dan tabel riwayat yang lebih nyaman dibaca."
      />

      <div className="hero-panel evaluation-hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">Monitoring nilai</span>
          <h2>Form penilaian, insight dimensi, dan riwayat dalam satu halaman</h2>
          <p>
            Masukkan nilai, lihat rata rata tiap dimensi, dan baca riwayat penilaian
            tanpa berpindah halaman.
          </p>
        </div>
        <div className="hero-side-card">
          <div className="panel-heading compact">
            <h3>Insight cepat</h3>
            <p>Gambaran singkat kondisi penilaian saat ini.</p>
          </div>
          <div className="insight-list">
            <div className="insight-item compact">
              <strong>Periode aktif</strong>
              <p>{activePeriod?.name || "Belum ada periode aktif"}</p>
            </div>
            <div className="insight-item compact">
              <strong>Dimensi terbaik</strong>
              <p>
                {bestDimension
                  ? `${bestDimension.label} berada di ${formatNumber(bestDimension.value)}.`
                  : "Belum ada data penilaian."}
              </p>
            </div>
            <div className="insight-item compact">
              <strong>Dimensi terendah</strong>
              <p>
                {weakestDimension
                  ? `${weakestDimension.label} berada di ${formatNumber(weakestDimension.value)}.`
                  : "Belum ada data penilaian."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid stats-grid-four">
        <StatsCard
          title="Total Penilaian"
          value={evaluations.length}
          caption="Jumlah semua penilaian yang tersimpan"
        />
        <StatsCard
          title="Pegawai Dinilai"
          value={new Set(evaluations.map((item) => item.employeeId)).size}
          caption="Pegawai yang sudah menerima penilaian"
        />
        <StatsCard
          title="Rata rata Nilai"
          value={formatNumber(averageScore)}
          caption="Rata rata keseluruhan nilai evaluasi"
        />
        <StatsCard
          title="Pegawai Tersedia"
          value={employees.length}
          caption="Jumlah pegawai yang bisa menjadi objek penilaian"
        />
      </div>

      <div className="analytics-grid analytics-grid-wide">
        <EvaluationForm
          employees={employees}
          periods={periods}
          criteria={criteria}
          onSubmit={handleSubmit}
        />

        <div className="panel-stack">
          <div className="panel">
            <div className="panel-heading compact">
              <h3>Rata rata per dimensi</h3>
              <p>Grafik membantu melihat dimensi yang paling kuat dan paling lemah.</p>
            </div>
            <div className="chart-rows">
              {dimensionAverages.map((item) => (
                <div className="chart-row" key={item.key}>
                  <div className="chart-row-head">
                    <strong>{item.label}</strong>
                    <span>{formatNumber(item.value)}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel insight-panel">
            <div className="panel-heading compact">
              <h3>Insight dimensi</h3>
              <p>Poin yang bisa langsung dipakai untuk tindak lanjut.</p>
            </div>
            <div className="insight-list">
              <div className="insight-item">
                <strong>Produktivitas evaluasi</strong>
                <p>
                  {evaluations.length > 0
                    ? `${evaluations.length} penilaian sudah tersimpan pada sistem.`
                    : "Belum ada penilaian yang tersimpan."}
                </p>
              </div>
              <div className="insight-item">
                <strong>Area unggul</strong>
                <p>
                  {bestDimension
                    ? `${bestDimension.label} menjadi kekuatan utama dengan nilai ${formatNumber(bestDimension.value)}.`
                    : "Belum ada area unggul yang bisa diukur."}
                </p>
              </div>
              <div className="insight-item">
                <strong>Area prioritas</strong>
                <p>
                  {weakestDimension
                    ? `${weakestDimension.label} perlu perhatian tambahan karena berada di ${formatNumber(weakestDimension.value)}.`
                    : "Belum ada area prioritas yang bisa ditentukan."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading compact panel-heading-split">
          <div>
            <h3>Riwayat penilaian</h3>
            <p>Data lengkap penilaian pegawai yang sudah dikirim.</p>
          </div>
          <Badge text={`${evaluations.length} data`} tone="neutral" />
        </div>
        <DataTable
          headers={["Pegawai", "Periode", "Penilai", "Nilai", "Predikat", "Tanggal"]}
        >
          {evaluations.length ? (
            evaluations.map((evaluation) => (
              <tr key={evaluation.id}>
                <td>
                  <strong>{evaluation.employeeName}</strong>
                  <div className="muted-text">{evaluation.nip}</div>
                </td>
                <td>{evaluation.periodName}</td>
                <td>{evaluation.evaluatorName}</td>
                <td>{formatNumber(evaluation.finalScore)}</td>
                <td>
                  <Badge
                    text={getScoreLabel(evaluation.finalScore)}
                    tone={getScoreTone(evaluation.finalScore)}
                  />
                </td>
                <td>{formatDate(evaluation.createdAt)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="empty-state-cell">
                Belum ada penilaian yang tersimpan.
              </td>
            </tr>
          )}
        </DataTable>
      </div>
    </div>
  );
};
