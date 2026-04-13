import { BerakhlakEvaluation } from "@/features/berakhlak/api/berakhlakApi";
import { DataTable } from "@/shared/components/DataTable";
import { Badge } from "@/shared/components/Badge";

type Props = {
  evaluations: BerakhlakEvaluation[];
  monthOptions: string[];
  isLoading: boolean;
  currentEmployeeId: number;
  isAdmin: boolean;
  onEdit: (evaluation: BerakhlakEvaluation) => void;
};

const getTone = (score: number) => {
  if (score >= 80) return "success" as const;
  if (score >= 60) return "neutral" as const;
  return "warning" as const;
};

export const BerakhlakRecapTable = ({
  evaluations,
  monthOptions,
  isLoading,
  currentEmployeeId,
  isAdmin,
  onEdit
}: Props) => {
  return (
    <section className="panel berakhlak-wide-panel">
      <div className="panel-header">
        <div>
          <h3>Rekap Penilaian</h3>
          <p>Filter mengikuti panel di atas. Edit hanya tersedia untuk penilaian yang Anda buat sendiri.</p>
        </div>
      </div>

      <DataTable
        headers={[
          "Pegawai",
          "Penilai",
          "Periode",
          "Pelayanan",
          "Akuntabel",
          "Kompeten",
          "Skor Akhir",
          "Aksi"
        ]}
        isLoading={isLoading}
        emptyMessage="Belum ada data penilaian sesuai filter."
      >
        {evaluations.map((item) => {
          const isOwnEvaluation = item.evaluatorEmployeeId === currentEmployeeId;
          return (
            <tr key={item.id}>
              <td>
                <div className="berakhlak-table-cell">
                  <strong>{item.employeeName}</strong>
                  <span>{item.employeeNip}</span>
                </div>
              </td>
              <td>
                <div className="berakhlak-table-cell">
                  <strong>{item.evaluatorName}</strong>
                  <span>{item.evaluatorNip}</span>
                </div>
              </td>
              <td>
                {monthOptions[item.evaluationMonth - 1]} {item.evaluationYear}
              </td>
              <td>{item.pelayananAvg.toFixed(2)}</td>
              <td>{item.akuntabelAvg.toFixed(2)}</td>
              <td>{item.kompetenAvg.toFixed(2)}</td>
              <td>
                <Badge tone={getTone(item.finalScore)} text={item.finalScore.toFixed(2)} />
              </td>
              <td>
                {isOwnEvaluation ? (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(item)}>
                    Edit
                  </button>
                ) : isAdmin ? (
                  <span className="table-note-muted">Hanya penilai asli</span>
                ) : (
                  <span className="table-note-muted">Lihat saja</span>
                )}
              </td>
            </tr>
          );
        })}
      </DataTable>
    </section>
  );
};
