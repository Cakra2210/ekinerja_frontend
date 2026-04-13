import { BerakhlakDashboard } from "@/features/berakhlak/api/berakhlakApi";
import { DataTable } from "@/shared/components/DataTable";
import { Employee } from "@/shared/types";

type Props = {
  dashboard: BerakhlakDashboard | null;
  employees: Employee[];
  selectedYear: number;
  selectedMonth: number;
  selectedEmployeeId: number;
  onChangeYear: (value: number) => void;
  onChangeMonth: (value: number) => void;
  onChangeEmployee: (value: number) => void;
  onResetFilters: () => void;
  isLoading: boolean;
  isAdmin: boolean;
};

const yearOptions = (() => {
  const now = new Date().getFullYear();
  return [now - 1, now, now + 1];
})();

const monthOptions = [
  "Semua bulan",
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

export const BerakhlakDashboardPanel = ({
  dashboard,
  employees,
  selectedYear,
  selectedMonth,
  selectedEmployeeId,
  onChangeYear,
  onChangeMonth,
  onChangeEmployee,
  onResetFilters,
  isLoading,
  isAdmin
}: Props) => {
  return (
    <div className="berakhlak-grid">
      <section className="panel berakhlak-wide-panel">
        <div className="panel-header">
          <div>
            <h3>Filter Dashboard</h3>
            <p>Filter ini juga dipakai tab Rekap Data dan Rekap Penilai.</p>
          </div>
        </div>

        <div className="berakhlak-form-grid">
          <label>
            <span>Tahun</span>
            <select value={selectedYear} onChange={(event) => onChangeYear(Number(event.target.value))}>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Bulan</span>
            <select value={selectedMonth} onChange={(event) => onChangeMonth(Number(event.target.value))}>
              {monthOptions.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Pegawai</span>
            <select
              value={selectedEmployeeId}
              onChange={(event) => onChangeEmployee(Number(event.target.value))}
            >
              <option value={0}>Semua pegawai</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="berakhlak-filter-actions">
          <button type="button" className="btn btn-secondary" onClick={onResetFilters}>
            Reset Filter
          </button>
        </div>
      </section>

      <section className="panel berakhlak-wide-panel">
        <div className="panel-header">
          <div>
            <h3>Skor Pegawai</h3>
            <p>
              {isAdmin
                ? "Admin dapat melihat seluruh skor pegawai sesuai filter aktif."
                : "Anda hanya melihat skor pegawai yang pernah Anda nilai sendiri."}
            </p>
          </div>
        </div>

        <DataTable
          headers={["Pegawai", "NIP", "Skor Rata-rata", "Jumlah Penilaian", "Terakhir Dinilai"]}
          isLoading={isLoading}
          emptyMessage="Belum ada skor pegawai untuk filter ini."
        >
          {(dashboard?.employeeScores || []).map((item) => (
            <tr key={`${item.employeeId}-${item.evaluationYear || "all"}-${item.evaluationMonth || "all"}`}>
              <td>{item.fullName}</td>
              <td>{item.nip}</td>
              <td>{item.averageScore.toFixed(2)}</td>
              <td>{item.totalEvaluations}</td>
              <td>{item.lastEvaluatedAt || "-"}</td>
            </tr>
          ))}
        </DataTable>
      </section>
    </div>
  );
};
