import { useEffect, useMemo, useState } from "react";
import { fetchRankings } from "@/features/evaluations/api/evaluationApi";
import { Badge } from "@/shared/components/Badge";
import { DataTable } from "@/shared/components/DataTable";
import { SectionHeader } from "@/shared/components/SectionHeader";
import { StatsCard } from "@/shared/components/StatsCard";
import { RankingItem } from "@/shared/types";
import { formatNumber, getScoreLabel } from "@/shared/utils/format";
import "@/shared/styles/employee-management-insights.css";

const getScoreTone = (score: number): "neutral" | "success" | "warning" => {
  if (score >= 80) return "success";
  if (score >= 70) return "neutral";
  return "warning";
};

export const RankingsPage = () => {
  const [rankings, setRankings] = useState<RankingItem[]>([]);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    const data = await fetchRankings();
    setRankings(data);
  };

  const topPerformer = rankings[0] || null;
  const averageScore = useMemo(() => {
    if (!rankings.length) return 0;
    const total = rankings.reduce((sum, item) => sum + Number(item.averageScore || 0), 0);
    return Number((total / rankings.length).toFixed(2));
  }, [rankings]);

  const strongPerformers = rankings.filter((item) => Number(item.averageScore) >= 80).length;
  const focusPerformers = rankings.filter((item) => Number(item.averageScore) < 70).length;

  const scoreBands = useMemo(
    () => [
      {
        label: "Istimewa",
        count: rankings.filter((item) => Number(item.averageScore) >= 90).length
      },
      {
        label: "Sangat Baik",
        count: rankings.filter(
          (item) => Number(item.averageScore) >= 80 && Number(item.averageScore) < 90
        ).length
      },
      {
        label: "Baik",
        count: rankings.filter(
          (item) => Number(item.averageScore) >= 70 && Number(item.averageScore) < 80
        ).length
      },
      {
        label: "Perlu Pembinaan",
        count: rankings.filter((item) => Number(item.averageScore) < 70).length
      }
    ],
    [rankings]
  );

  const maxBandCount = useMemo(() => {
    return Math.max(...scoreBands.map((item) => item.count), 1);
  }, [scoreBands]);

  const topFive = rankings.slice(0, 5);
  const podium = rankings.slice(0, 3);

  return (
    <div className="page-stack">
      <SectionHeader
        title="Rangking Pegawai"
        description="Rangking kini lebih menarik dengan grafik, tabel yang lebih informatif, dan insight yang mudah dibaca."
      />

      <div className="hero-panel ranking-hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">Peta performa pegawai</span>
          <h2>Lihat posisi, pemerataan nilai, dan fokus pembinaan dalam satu layar</h2>
          <p>
            Data rangking ditampilkan dalam bentuk kartu, grafik batang, dan tabel rinci
            agar lebih mudah dipakai saat evaluasi pimpinan.
          </p>

          <div className="hero-metrics">
            <div className="hero-metric-card">
              <small>Peringkat teratas</small>
              <strong>{topPerformer?.fullName || "Belum ada data"}</strong>
              <span>
                {topPerformer
                  ? `${formatNumber(topPerformer.averageScore)} poin`
                  : "Tambahkan penilaian terlebih dahulu"}
              </span>
            </div>
            <div className="hero-metric-card">
              <small>Rata rata umum</small>
              <strong>{formatNumber(averageScore)}</strong>
              <span>{getScoreLabel(averageScore)}</span>
            </div>
            <div className="hero-metric-card">
              <small>Total pegawai</small>
              <strong>{rankings.length}</strong>
              <span>{strongPerformers} pegawai berada di atas skor 80</span>
            </div>
          </div>
        </div>

        <div className="hero-side-card">
          <div className="panel-heading compact">
            <h3>Komposisi predikat</h3>
            <p>Distribusi pegawai berdasarkan skor rata rata.</p>
          </div>
          <div className="band-list">
            {scoreBands.map((band) => (
              <div className="band-row" key={band.label}>
                <div className="band-row-head">
                  <span>{band.label}</span>
                  <strong>{band.count}</strong>
                </div>
                <div className="bar-track small">
                  <div
                    className="bar-fill"
                    style={{ width: `${(band.count / maxBandCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-grid stats-grid-four">
        <StatsCard
          title="Jumlah Peringkat"
          value={rankings.length}
          caption="Total pegawai yang masuk ke perhitungan rangking"
        />
        <StatsCard
          title="Rata rata Umum"
          value={formatNumber(averageScore)}
          caption="Rata rata skor dari seluruh pegawai"
        />
        <StatsCard
          title="Performa Kuat"
          value={strongPerformers}
          caption="Pegawai dengan skor rata rata 80 ke atas"
        />
        <StatsCard
          title="Fokus Pembinaan"
          value={focusPerformers}
          caption="Pegawai dengan skor rata rata di bawah 70"
        />
      </div>

      <div className="analytics-grid analytics-grid-balanced">
        <div className="panel">
          <div className="panel-heading compact">
            <h3>Podium tiga besar</h3>
            <p>Tiga pegawai dengan performa tertinggi saat ini.</p>
          </div>
          <div className="podium-grid">
            {podium.length ? (
              podium.map((item, index) => (
                <div className={`podium-card podium-rank-${index + 1}`} key={item.id}>
                  <div className="podium-badge">#{item.rank}</div>
                  <strong>{item.fullName}</strong>
                  <span>{item.position || "Jabatan belum diisi"}</span>
                  <div className="podium-score">{formatNumber(item.averageScore)}</div>
                  <Badge
                    text={getScoreLabel(item.averageScore)}
                    tone={getScoreTone(item.averageScore)}
                  />
                </div>
              ))
            ) : (
              <div className="empty-state">Belum ada data rangking yang dapat ditampilkan.</div>
            )}
          </div>
        </div>

        <div className="panel-stack">
          <div className="panel">
            <div className="panel-heading compact">
              <h3>Perbandingan top 5</h3>
              <p>Grafik batang untuk melihat selisih performa pegawai teratas.</p>
            </div>
            <div className="chart-rows">
              {topFive.length ? (
                topFive.map((item) => (
                  <div className="chart-row" key={item.id}>
                    <div className="chart-row-head">
                      <div>
                        <strong>{item.fullName}</strong>
                        <small>{item.position || "Jabatan belum diisi"}</small>
                      </div>
                      <span>{formatNumber(item.averageScore)}</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${item.averageScore}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">Belum ada data perbandingan skor.</div>
              )}
            </div>
          </div>

          <div className="panel insight-panel">
            <div className="panel-heading compact">
              <h3>Insight rangking</h3>
              <p>Gunakan insight ini untuk evaluasi cepat.</p>
            </div>
            <div className="insight-list">
              <div className="insight-item">
                <strong>Pegawai teratas</strong>
                <p>
                  {topPerformer
                    ? `${topPerformer.fullName} memimpin dengan skor ${formatNumber(topPerformer.averageScore)}.`
                    : "Belum ada data rangking."}
                </p>
              </div>
              <div className="insight-item">
                <strong>Kualitas umum</strong>
                <p>
                  Nilai rata rata seluruh pegawai berada di {formatNumber(averageScore)}
                  {" "}dengan predikat {getScoreLabel(averageScore)}.
                </p>
              </div>
              <div className="insight-item">
                <strong>Prioritas tindak lanjut</strong>
                <p>
                  {focusPerformers > 0
                    ? `${focusPerformers} pegawai masih berada di bawah skor 70 dan sebaiknya dipantau lebih dekat.`
                    : "Belum ada pegawai di bawah skor 70."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading compact panel-heading-split">
          <div>
            <h3>Tabel rangking lengkap</h3>
            <p>Urutan pegawai dari skor rata rata tertinggi ke terendah.</p>
          </div>
          <Badge text={`${rankings.length} pegawai`} tone="neutral" />
        </div>
        <DataTable
          headers={["Peringkat", "Pegawai", "Jabatan", "Rata rata", "Evaluasi", "Predikat", "Insight"]}
        >
          {rankings.length ? (
            rankings.map((item) => (
              <tr key={item.id} className={item.rank <= 3 ? "table-row-highlight" : undefined}>
                <td>
                  <strong>#{item.rank}</strong>
                </td>
                <td>
                  <strong>{item.fullName}</strong>
                  <div className="muted-text">{item.nip}</div>
                </td>
                <td>
                  <strong>{item.position || "Belum diisi"}</strong>
                  <div className="muted-text">{item.departmentName || "Unit belum tersedia"}</div>
                </td>
                <td>{formatNumber(item.averageScore)}</td>
                <td>{item.totalEvaluations}</td>
                <td>
                  <Badge
                    text={getScoreLabel(item.averageScore)}
                    tone={getScoreTone(item.averageScore)}
                  />
                </td>
                <td>
                  {item.averageScore >= 85
                    ? "Sangat konsisten dan layak menjadi role model."
                    : item.averageScore >= 75
                      ? "Performa stabil dan tetap perlu dijaga."
                      : "Perlu pendampingan lebih dekat pada periode berikutnya."}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="empty-state-cell">
                Belum ada data rangking yang tersimpan.
              </td>
            </tr>
          )}
        </DataTable>
      </div>
    </div>
  );
};
