import { FormEvent, useMemo, useState } from "react";
import { Criterion, Employee, EvaluationPayload, Period } from "@/shared/types";

type EvaluationFormProps = {
  employees: Employee[];
  periods: Period[];
  criteria: Criterion[];
  onSubmit: (payload: EvaluationPayload) => Promise<void>;
};

const initialState: EvaluationPayload = {
  employeeId: 0,
  periodId: 0,
  evaluatorName: "",
  teamwork: 80,
  discipline: 80,
  productivity: 80,
  initiative: 80,
  communication: 80,
  note: ""
};

export const EvaluationForm = ({
  employees,
  periods,
  criteria,
  onSubmit
}: EvaluationFormProps) => {
  const [form, setForm] = useState<EvaluationPayload>(initialState);

  const previewScore = useMemo(() => {
    return (
      form.teamwork * 0.2 +
      form.discipline * 0.2 +
      form.productivity * 0.25 +
      form.initiative * 0.15 +
      form.communication * 0.2
    ).toFixed(2);
  }, [form]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialState);
  };

  return (
    <div className="panel">
      <div className="panel-heading">
        <h3>Form Penilaian</h3>
        <p>Nilai diisi dalam rentang 0 sampai 100.</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Pegawai</span>
          <select
            value={form.employeeId}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                employeeId: Number(event.target.value)
              }))
            }
            required
          >
            <option value={0}>Pilih pegawai</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.fullName} · {employee.nip}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Periode</span>
          <select
            value={form.periodId}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                periodId: Number(event.target.value)
              }))
            }
            required
          >
            <option value={0}>Pilih periode</option>
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Nama Penilai</span>
          <input
            type="text"
            value={form.evaluatorName}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                evaluatorName: event.target.value
              }))
            }
            required
          />
        </label>

        {criteria.map((criterion) => {
          const keyMap: Record<
            string,
            "teamwork" | "discipline" | "productivity" | "initiative" | "communication"
          > = {
            TEAM: "teamwork",
            DISC: "discipline",
            PROD: "productivity",
            INIT: "initiative",
            COMM: "communication"
          };

          const field = keyMap[criterion.code];

          if (!field) {
            return null;
          }

          return (
            <label key={criterion.id}>
              <span>
                {criterion.name} ({criterion.weight}%)
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={form[field]}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    [field]: Number(event.target.value)
                  }))
                }
                required
              />
            </label>
          );
        })}

        <label className="field-full">
          <span>Catatan</span>
          <textarea
            rows={4}
            value={form.note}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, note: event.target.value }))
            }
            placeholder="Tambahkan catatan penilaian"
          />
        </label>

        <div className="score-preview">
          <span>Preview nilai akhir</span>
          <strong>{previewScore}</strong>
        </div>

        <div className="form-actions">
          <button type="submit" className="button-primary">
            Simpan Penilaian
          </button>
        </div>
      </form>
    </div>
  );
};
