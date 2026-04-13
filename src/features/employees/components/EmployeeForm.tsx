import { FormEvent, useEffect, useMemo, useState } from "react";
import { AccountRole, Employee, EmployeePayload, Position } from "@/shared/types";

type EmployeeFormProps = {
  positions: Position[];
  onSubmit: (payload: EmployeePayload) => Promise<void>;
  selectedEmployee?: Employee | null;
  onCancelEdit?: () => void;
};

const roleOptions: AccountRole[] = ["admin", "supervisor", "operator", "user"];

const employmentOptions = ["PNS", "CPNS", "PPPK"] as const;
const activeOptions = [
  { value: "aktif", label: "Aktif" },
  { value: "tidak_aktif", label: "Tidak Aktif" }
] as const;

const initialState: EmployeePayload = {
  fullName: "",
  nip: "",
  positionId: 0,
  employmentStatus: "PNS",
  activeStatus: "aktif",
  effectiveDate: "",
  username: "",
  password: "",
  role: "user"
};

export const EmployeeForm = ({
  positions,
  onSubmit,
  selectedEmployee,
  onCancelEdit
}: EmployeeFormProps) => {
  const [form, setForm] = useState<EmployeePayload>(initialState);
  const isEditMode = Boolean(selectedEmployee);

  useEffect(() => {
    if (selectedEmployee) {
      setForm({
        fullName: selectedEmployee.fullName,
        nip: selectedEmployee.nip,
        positionId: selectedEmployee.positionId ?? 0,
        employmentStatus:
          selectedEmployee.employmentStatus === "PNS" ||
          selectedEmployee.employmentStatus === "CPNS" ||
          selectedEmployee.employmentStatus === "PPPK"
            ? selectedEmployee.employmentStatus
            : "PNS",
        activeStatus:
          selectedEmployee.activeStatus === "tidak_aktif"
            ? "tidak_aktif"
            : "aktif",
        effectiveDate:
          selectedEmployee.activeStatus === "tidak_aktif"
            ? selectedEmployee.exitDate || ""
            : selectedEmployee.joinDate || "",
        username: selectedEmployee.accountUsername || selectedEmployee.nip,
        password: "",
        role: selectedEmployee.accountRole || "user"
      });
      return;
    }

    setForm(initialState);
  }, [selectedEmployee]);

  const dateLabel = useMemo(
    () => (form.activeStatus === "tidak_aktif" ? "Tanggal Keluar" : "Tanggal Bergabung"),
    [form.activeStatus]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(form);

    if (!isEditMode) {
      setForm(initialState);
    }
  };

  return (
    <div className="panel">
      <div className="panel-heading">
        <h3>{isEditMode ? "Ubah Pegawai" : "Tambah Pegawai"}</h3>
        <p>Isi data pegawai, jabatan, status, dan akun login.</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Nama</span>
          <input
            type="text"
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({ ...current, fullName: event.target.value }))
            }
            placeholder="Masukkan nama pegawai"
            required
          />
        </label>

        <label>
          <span>NIP</span>
          <input
            type="text"
            value={form.nip}
            onChange={(event) =>
              setForm((current) => ({ ...current, nip: event.target.value }))
            }
            placeholder="Masukkan NIP"
            required
          />
        </label>

        <label>
          <span>Nama Jabatan</span>
          <select
            value={form.positionId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                positionId: Number(event.target.value)
              }))
            }
            required
          >
            <option value={0}>Pilih jabatan</option>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Status Kepegawaian</span>
          <select
            value={form.employmentStatus}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                employmentStatus: event.target.value as "PNS" | "CPNS" | "PPPK"
              }))
            }
            required
          >
            {employmentOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Status Aktif</span>
          <select
            value={form.activeStatus}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                activeStatus: event.target.value as "aktif" | "tidak_aktif"
              }))
            }
            required
          >
            {activeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{dateLabel}</span>
          <input
            type="date"
            value={form.effectiveDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                effectiveDate: event.target.value
              }))
            }
            required
          />
        </label>

        <label>
          <span>Username</span>
          <input
            type="text"
            value={form.username}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                username: event.target.value
              }))
            }
            placeholder="Masukkan username"
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value
              }))
            }
            placeholder={
              isEditMode
                ? "Kosongkan jika tidak ingin mengubah password"
                : "Masukkan password"
            }
            required={!isEditMode}
          />
        </label>

        <label>
          <span>Role</span>
          <select
            value={form.role}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                role: event.target.value as AccountRole
              }))
            }
            required
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>

        <div className="form-actions">
          <button type="submit" className="button-primary">
            {isEditMode ? "Simpan Perubahan" : "Simpan Pegawai"}
          </button>
          {isEditMode && (
            <button
              type="button"
              className="button-secondary"
              onClick={onCancelEdit}
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
