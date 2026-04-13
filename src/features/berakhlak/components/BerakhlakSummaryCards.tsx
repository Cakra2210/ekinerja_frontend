
type Props = {
  totalEvaluations: number;
  totalEmployees: number;
  averageScore: number;
  activeMonthCount: number;
};

export const BerakhlakSummaryCards = ({
  totalEvaluations,
  totalEmployees,
  averageScore,
  activeMonthCount
}: Props) => {
  return (
    <div className="berakhlak-summary-top">
      <article className="berakhlak-top-card">
        <span>Total Penilaian</span>
        <strong>{totalEvaluations}</strong>
      </article>
      <article className="berakhlak-top-card">
        <span>Pegawai Dinilai</span>
        <strong>{totalEmployees}</strong>
      </article>
      <article className="berakhlak-top-card">
        <span>Rata-rata Skor</span>
        <strong>{averageScore.toFixed(2)}</strong>
      </article>
      <article className="berakhlak-top-card">
        <span>Periode Aktif</span>
        <strong>{activeMonthCount}</strong>
      </article>
    </div>
  );
};
