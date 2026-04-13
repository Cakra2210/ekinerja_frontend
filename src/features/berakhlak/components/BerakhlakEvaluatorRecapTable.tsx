import { BerakhlakEvaluation } from "@/features/berakhlak/api/berakhlakApi";
import { DataTable } from "@/shared/components/DataTable";

type Props = {
  evaluations: BerakhlakEvaluation[];
  monthOptions: string[];
  isLoading: boolean;
};

export const BerakhlakEvaluatorRecapTable = ({ evaluations, monthOptions, isLoading }: Props) => {
  const grouped = Object.values(
    evaluations.reduce<Record<string, {
      evaluatorEmployeeId: number;
      evaluatorName: string;
      evaluatorNip: string;
      totalEvaluations: number;
      employees: string[];
      periods: string[];
    }>>((accumulator, item) => {
      const key = String(item.evaluatorEmployeeId);
      if (!accumulator[key]) {
        accumulator[key] = {
          evaluatorEmployeeId: item.evaluatorEmployeeId,
          evaluatorName: item.evaluatorName,
          evaluatorNip: item.evaluatorNip,
          totalEvaluations: 0,
          employees: [],
          periods: []
        };
      }

      accumulator[key].totalEvaluations += 1;
      const employeeLabel = `${item.employeeName} (${item.employeeNip})`;
      const periodLabel = `${monthOptions[item.evaluationMonth - 1]} ${item.evaluationYear}`;
      if (!accumulator[key].employees.includes(employeeLabel)) accumulator[key].employees.push(employeeLabel);
      if (!accumulator[key].periods.includes(periodLabel)) accumulator[key].periods.push(periodLabel);
      return accumulator;
    }, {})
  ).sort((a, b) => b.totalEvaluations - a.totalEvaluations || a.evaluatorName.localeCompare(b.evaluatorName));

  return (
    <section className="panel berakhlak-wide-panel">
      <div className="panel-header">
        <div>
          <h3>Rekap Penilai</h3>
          <p>Khusus admin. Menampilkan pegawai yang telah dinilai oleh masing-masing penilai berdasarkan filter aktif.</p>
        </div>
      </div>

      <DataTable
        headers={["Penilai", "Jumlah Penilaian", "Pegawai yang Dinilai", "Periode"]}
        isLoading={isLoading}
        emptyMessage="Belum ada data penilai sesuai filter."
      >
        {grouped.map((item) => (
          <tr key={item.evaluatorEmployeeId}>
            <td>
              <div className="berakhlak-table-cell">
                <strong>{item.evaluatorName}</strong>
                <span>{item.evaluatorNip}</span>
              </div>
            </td>
            <td>{item.totalEvaluations}</td>
            <td>{item.employees.join(", ")}</td>
            <td>{item.periods.join(", ")}</td>
          </tr>
        ))}
      </DataTable>
    </section>
  );
};
