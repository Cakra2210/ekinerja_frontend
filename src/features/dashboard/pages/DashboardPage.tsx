import { useEffect, useState } from "react";
import { fetchDashboard } from "@/features/dashboard/api/dashboardApi";
import { SectionHeader } from "@/shared/components/SectionHeader";
import { StatsCard } from "@/shared/components/StatsCard";
import { DataTable } from "@/shared/components/DataTable";
import { DashboardResponse } from "@/shared/types";
import { formatNumber, getScoreLabel } from "@/shared/utils/format";

export const DashboardPage = () => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    const data = await fetchDashboard();
    setDashboard(data);
  };

  if (!dashboard) {
    return <div className="loading-state">Memuat dashboard...</div>;
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Dashboard Kinerja"
        description="Pantau jumlah pegawai, nilai rata rata, dan performa terbaik."
      />

      <div className="stats-grid">
        <StatsCard
          title="Jumlah Pegawai"
          value={dashboard.totals.totalEmployees}
          caption="Data aktif di sistem"
        />
        <StatsCard
          title="Total Penilaian"
          value={dashboard.totals.totalEvaluations}
          caption="Seluruh input penilaian"
        />
        <StatsCard
          title="Rata Rata Nilai"
          value={formatNumber(dashboard.totals.averageScore)}
          caption={getScoreLabel(dashboard.totals.averageScore)}
        />
      </div>

      <div className="two-column">
        <div className="panel">
          <div className="panel-heading">
            <h3>5 Pegawai Terbaik</h3>
            <p>Urutan berdasarkan rata rata nilai.</p>
          </div>

          <DataTable
            headers={["Nama", "NIP", "Jabatan", "Departemen", "Nilai"]}
          >
            {dashboard.topEmployees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.full_name}</td>
                <td>{employee.nip}</td>
                <td>{employee.position}</td>
                <td>{employee.department}</td>
                <td>{formatNumber(employee.average_score || 0)}</td>
              </tr>
            ))}
          </DataTable>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h3>Ringkasan Departemen</h3>
            <p>Perbandingan jumlah pegawai dan rata rata nilai.</p>
          </div>

          <div className="department-list">
            {dashboard.departmentSummary.map((item) => (
              <div className="department-item" key={item.department}>
                <div>
                  <strong>{item.department}</strong>
                  <small>{item.total_employees} pegawai</small>
                </div>
                <div className="department-score">
                  {formatNumber(item.average_score)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
