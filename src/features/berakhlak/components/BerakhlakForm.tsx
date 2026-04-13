import { BerakhlakPayload } from "@/features/berakhlak/api/berakhlakApi";
import { Badge } from "@/shared/components/Badge";
import { Employee } from "@/shared/types";

type QuestionGroup = {
  key: string;
  label: string;
  questions: ReadonlyArray<{
    key: keyof BerakhlakPayload;
    label: string;
  }>;
};

type Props = {
  employees: Employee[];
  form: BerakhlakPayload;
  dimensions: {
    pelayananAvg: number;
    akuntabelAvg: number;
    kompetenAvg: number;
    harmonisAvg: number;
    loyalAvg: number;
    adaptifAvg: number;
    kolaboratifAvg: number;
    finalScore: number;
  };
  questionGroups: readonly QuestionGroup[];
  completionText: string;
  selectedEmployee: Employee | null;
  existingOwnEvaluationId: number | null;
  isSubmitting: boolean;
  isEditing: boolean;
  canSubmit: boolean;
  monthOptions: string[];
  onFieldChange: (key: keyof BerakhlakPayload, value: string | number) => void;
  onScoreChange: (key: keyof BerakhlakPayload, value: number) => void;
  onSubmit: () => void;
  onReset: () => void;
  onEditExisting: () => void;
};

const getScoreTone = (score: number) => {
  if (score >= 80) return "success";
  if (score >= 60) return "neutral";
  return "warning";
};

const getRangeTone = (score: number) => {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  return "red";
};

const buildRangeStyle = (score: number) => ({
  background: `linear-gradient(to right, var(--range-${getRangeTone(score)}) 0%, var(--range-${getRangeTone(score)}) ${score}%, rgba(148, 163, 184, 0.22) ${score}%, rgba(148, 163, 184, 0.22) 100%)`
});

export const BerakhlakForm = ({
  employees,
  form,
  dimensions,
  questionGroups,
  completionText,
  selectedEmployee,
  existingOwnEvaluationId,
  isSubmitting,
  isEditing,
  canSubmit,
  monthOptions,
  onFieldChange,
  onScoreChange,
  onSubmit,
  onReset,
  onEditExisting
}: Props) => {
  return (
    <div className="berakhlak-grid">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Form Penilaian</h3>
            <p>Pilih pegawai dan periode penilaian, lalu isi indikator pada popup ini.</p>
          </div>
        </div>

        <div className="berakhlak-form-grid">

          <label>
            <span>Pegawai yang Dinilai</span>
            <select
              value={form.employeeId}
              onChange={(event) => onFieldChange("employeeId", Number(event.target.value))}
            >
              <option value={0}>Pilih pegawai</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName} — {employee.nip}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Tahun</span>
            <input
              type="number"
              min={2020}
              max={2100}
              value={form.evaluationYear}
              onChange={(event) => onFieldChange("evaluationYear", Number(event.target.value))}
            />
          </label>

          <label>
            <span>Bulan</span>
            <select
              value={form.evaluationMonth}
              onChange={(event) => onFieldChange("evaluationMonth", Number(event.target.value))}
            >
              {monthOptions.map((monthLabel, index) => (
                <option key={monthLabel} value={index + 1}>
                  {monthLabel}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedEmployee ? (
          <div className="berakhlak-selected-employee">
            <strong>{selectedEmployee.fullName}</strong>
            <span>
              {selectedEmployee.nip} · {selectedEmployee.position}
            </span>
          </div>
        ) : null}

        {existingOwnEvaluationId && !isEditing ? (
          <div className="berakhlak-inline-warning">
            <div>
              <strong>Penilaian periode ini sudah ada.</strong>
              <p>Anda hanya bisa menilai pegawai yang sama sekali dalam sebulan. Gunakan edit untuk memperbaiki nilainya.</p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={onEditExisting}>
              Edit Penilaian
            </button>
          </div>
        ) : null}

        <div className="berakhlak-progress-card">
          <div>
            <h4>Kelengkapan penilaian</h4>
            <p>{completionText}</p>
          </div>
          <div className={`badge badge-${getScoreTone(dimensions.finalScore)}`}>
            Skor akhir {dimensions.finalScore}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Ringkasan Dimensi</h3>
            <p>Nilai dasar tiap indikator adalah 0.</p>
          </div>
        </div>

        <div className="berakhlak-summary-grid">
          {[
            ["Pelayanan", dimensions.pelayananAvg],
            ["Akuntabel", dimensions.akuntabelAvg],
            ["Kompeten", dimensions.kompetenAvg],
            ["Harmonis", dimensions.harmonisAvg],
            ["Loyal", dimensions.loyalAvg],
            ["Adaptif", dimensions.adaptifAvg],
            ["Kolaboratif", dimensions.kolaboratifAvg]
          ].map(([label, value]) => (
            <article key={String(label)} className={`berakhlak-dimension-card tone-${getRangeTone(Number(value))}`}>
              <h4>{label}</h4>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel berakhlak-wide-panel berakhlak-indicator-panel">
        <div className="berakhlak-question-groups">
          {questionGroups.map((group) => (
            <div key={group.key} className="berakhlak-question-group">
              <h4>{group.label}</h4>
              <div className="berakhlak-question-list">
                {group.questions.map((question) => {
                  const currentValue = Number(form[question.key]);
                  const tone = getRangeTone(currentValue);
                  return (
                    <label key={question.key} className={`berakhlak-question-item tone-${tone}`}>
                      <span>{question.label}</span>
                      <div className="berakhlak-range-stack">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={currentValue}
                          style={buildRangeStyle(currentValue)}
                          onChange={(event) =>
                            onScoreChange(question.key, Number(event.target.value))
                          }
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={currentValue}
                          className={`score-input score-input-${tone}`}
                          onChange={(event) =>
                            onScoreChange(question.key, Number(event.target.value))
                          }
                        />
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel berakhlak-wide-panel">
        <div className="panel-header">
          <div>
            <h3>Catatan Penilai</h3>
            <p>Gunakan catatan singkat untuk konteks penilaian atau area perbaikan.</p>
          </div>
          <Badge text={isEditing ? "Mode Edit" : "Data Baru"} tone={isEditing ? "warning" : "success"} />
        </div>

        <textarea
          className="berakhlak-note"
          rows={4}
          value={form.note}
          onChange={(event) => onFieldChange("note", event.target.value)}
          placeholder="Contoh: sangat kooperatif pada pekerjaan lintas tim, tetapi masih perlu meningkatkan dokumentasi."
        />

        <div className="berakhlak-actions">
          <button type="button" className="btn btn-secondary" onClick={onReset}>
            Reset Form
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting || Boolean(existingOwnEvaluationId && !isEditing)}
          >
            {isSubmitting
              ? "Menyimpan..."
              : isEditing
                ? "Simpan Perubahan"
                : "Simpan Penilaian"}
          </button>
        </div>
      </section>
    </div>
  );
};
