import { FormEvent, useEffect, useMemo, useState } from "react";
import { fetchEmployees } from "@/features/employees/api/employeeApi";
import {
  fetchWorkUnitProfile,
  saveWorkUnitProfile
} from "@/features/references/api/referenceApi";
import { SectionHeader } from "@/shared/components/SectionHeader";
import { Employee, WorkUnitProfilePayload } from "@/shared/types";

const initialForm: WorkUnitProfilePayload = {
  workUnitName: "",
  satkerCode: "",
  address: "",
  city: "",
  regency: "",
  province: "",
  postalCode: "",
  headEmployeeId: null,
  headName: "",
  commitmentOfficerEmployeeId: null,
  commitmentOfficerName: "",
  dipaNumber: "",
  dipaDate: "",
  website: "",
  email: "",
  phone: ""
};

export const WorkUnitProfilePage = () => {
  const [form, setForm] = useState<WorkUnitProfilePayload>(initialForm);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadData();
  }, []);

  const filledFieldsCount = useMemo(() => {
    const values = [
      form.workUnitName,
      form.satkerCode,
      form.address,
      form.city,
      form.regency,
      form.province,
      form.postalCode,
      form.headEmployeeId ? "selected" : "",
      form.commitmentOfficerEmployeeId ? "selected" : "",
      form.dipaNumber,
      form.dipaDate,
      form.website,
      form.email,
      form.phone
    ];

    return values.filter((value) => String(value).trim()).length;
  }, [form]);

  const loadData = async () => {
    setIsLoading(true);

    try {
      const [profile, employeeRows] = await Promise.all([
        fetchWorkUnitProfile(),
        fetchEmployees()
      ]);

      setEmployees(employeeRows);

      if (profile) {
        setForm({
          workUnitName: profile.workUnitName ?? "",
          satkerCode: profile.satkerCode ?? "",
          address: profile.address ?? "",
          city: profile.city ?? "",
          regency: profile.regency ?? "",
          province: profile.province ?? "",
          postalCode: profile.postalCode ?? "",
          headEmployeeId: profile.headEmployeeId ?? null,
          headName: profile.headName ?? "",
          commitmentOfficerEmployeeId:
            profile.commitmentOfficerEmployeeId ?? null,
          commitmentOfficerName: profile.commitmentOfficerName ?? "",
          dipaNumber: profile.dipaNumber ?? "",
          dipaDate: profile.dipaDate ?? "",
          website: profile.website ?? "",
          email: profile.email ?? "",
          phone: profile.phone ?? ""
        });
      } else {
        setForm(initialForm);
      }
    } catch (error) {
      console.error(error);
      window.alert("Gagal memuat data profil satuan kerja.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: keyof WorkUnitProfilePayload, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const handleEmployeeChange = (
    key: "headEmployeeId" | "commitmentOfficerEmployeeId",
    value: string
  ) => {
    const numericValue = value ? Number(value) : null;

    setForm((current) => ({
      ...current,
      [key]: numericValue
    }));
  };

  const getEmployeeName = (
    employeeId: number | null,
    fallbackName?: string
  ): string => {
    if (!employeeId) {
      return fallbackName ?? "";
    }

    const employee = employees.find((item) => item.id === employeeId);
    return employee?.fullName ?? fallbackName ?? "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await saveWorkUnitProfile({
        ...form,
        headName: getEmployeeName(form.headEmployeeId, form.headName),
        commitmentOfficerName: getEmployeeName(
          form.commitmentOfficerEmployeeId,
          form.commitmentOfficerName
        )
      });
      await loadData();
      window.alert("Profil satuan kerja berhasil disimpan.");
    } catch (error) {
      console.error(error);
      window.alert("Profil satuan kerja gagal disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    void loadData();
  };

  const headName = getEmployeeName(form.headEmployeeId, form.headName);
  const commitmentOfficerName = getEmployeeName(
    form.commitmentOfficerEmployeeId,
    form.commitmentOfficerName
  );

  if (isLoading) {
    return <div className="loading-state">Memuat profil satuan kerja...</div>;
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Profil Satuan Kerja"
        description="Lengkapi identitas satuan kerja dan pilih kepala serta PPK dari daftar pegawai."
      />

      <div className="stats-grid">
        <div className="stats-card">
          <span className="stats-label">Kelengkapan data</span>
          <strong>{filledFieldsCount}/14</strong>
          <small>Jumlah field profil yang sudah terisi.</small>
        </div>
        <div className="stats-card">
          <span className="stats-label">Kode satker</span>
          <strong>{form.satkerCode || "-"}</strong>
          <small>Identitas kode resmi satuan kerja.</small>
        </div>
        <div className="stats-card">
          <span className="stats-label">Nomor DIPA</span>
          <strong>{form.dipaNumber || "-"}</strong>
          <small>Dokumen anggaran aktif satuan kerja.</small>
        </div>
      </div>

      <div className="two-column">
        <div className="panel">
          <div className="panel-heading">
            <h3>Form Profil Satuan Kerja</h3>
            <p>Isi data identitas dan pilih nama pejabat dari daftar pegawai.</p>
          </div>

          <form className="form-grid" onSubmit={(event) => void handleSubmit(event)}>
            <label className="field-full">
              <span>Nama Satuan Kerja</span>
              <input
                type="text"
                value={form.workUnitName}
                onChange={(event) => handleChange("workUnitName", event.target.value)}
                placeholder="Masukkan nama satuan kerja"
                required
              />
            </label>

            <label>
              <span>Kode Satker</span>
              <input
                type="text"
                value={form.satkerCode}
                onChange={(event) => handleChange("satkerCode", event.target.value)}
                placeholder="Masukkan kode satker"
                required
              />
            </label>

            <label>
              <span>Kode Pos</span>
              <input
                type="text"
                value={form.postalCode}
                onChange={(event) => handleChange("postalCode", event.target.value)}
                placeholder="Masukkan kode pos"
              />
            </label>

            <label className="field-full">
              <span>Alamat</span>
              <textarea
                rows={4}
                value={form.address}
                onChange={(event) => handleChange("address", event.target.value)}
                placeholder="Masukkan alamat lengkap"
                required
              />
            </label>

            <label>
              <span>Kota</span>
              <input
                type="text"
                value={form.city}
                onChange={(event) => handleChange("city", event.target.value)}
                placeholder="Masukkan kota"
              />
            </label>

            <label>
              <span>Kabupaten</span>
              <input
                type="text"
                value={form.regency}
                onChange={(event) => handleChange("regency", event.target.value)}
                placeholder="Masukkan kabupaten"
              />
            </label>

            <label>
              <span>Propinsi</span>
              <input
                type="text"
                value={form.province}
                onChange={(event) => handleChange("province", event.target.value)}
                placeholder="Masukkan propinsi"
              />
            </label>

            <label>
              <span>No Telepon</span>
              <input
                type="text"
                value={form.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                placeholder="Masukkan nomor telepon"
              />
            </label>

            <label>
              <span>Nama Kepala</span>
              <select
                value={form.headEmployeeId ?? ""}
                onChange={(event) =>
                  handleEmployeeChange("headEmployeeId", event.target.value)
                }
              >
                <option value="">Pilih pegawai</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName} | {employee.nip}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Nama Pejabat Pembuat Komitmen</span>
              <select
                value={form.commitmentOfficerEmployeeId ?? ""}
                onChange={(event) =>
                  handleEmployeeChange(
                    "commitmentOfficerEmployeeId",
                    event.target.value
                  )
                }
              >
                <option value="">Pilih pegawai</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName} | {employee.nip}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Nomor DIPA</span>
              <input
                type="text"
                value={form.dipaNumber}
                onChange={(event) => handleChange("dipaNumber", event.target.value)}
                placeholder="Masukkan nomor DIPA"
              />
            </label>

            <label>
              <span>Tanggal DIPA</span>
              <input
                type="date"
                value={form.dipaDate}
                onChange={(event) => handleChange("dipaDate", event.target.value)}
              />
            </label>

            <label>
              <span>Website</span>
              <input
                type="url"
                value={form.website}
                onChange={(event) => handleChange("website", event.target.value)}
                placeholder="https://satker.go.id"
              />
            </label>

            <label>
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => handleChange("email", event.target.value)}
                placeholder="email@satker.go.id"
              />
            </label>

            <div className="form-actions">
              <button className="button-primary" type="submit" disabled={isSubmitting}>
                Simpan Profil
              </button>
              <button className="button-secondary" type="button" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h3>Ringkasan Profil</h3>
            <p>Pratinjau singkat data satuan kerja yang sedang aktif.</p>
          </div>

          <div className="department-list">
            <div className="department-item">
              <div>
                <strong>Nama Satuan Kerja</strong>
                <small>{form.workUnitName || "Belum diisi"}</small>
              </div>
            </div>
            <div className="department-item">
              <div>
                <strong>Lokasi</strong>
                <small>
                  {[form.address, form.city, form.regency, form.province]
                    .filter(Boolean)
                    .join(", ") || "Belum diisi"}
                </small>
              </div>
            </div>
            <div className="department-item">
              <div>
                <strong>Pimpinan</strong>
                <small>{headName || "Belum dipilih"}</small>
              </div>
            </div>
            <div className="department-item">
              <div>
                <strong>Pejabat Pembuat Komitmen</strong>
                <small>{commitmentOfficerName || "Belum dipilih"}</small>
              </div>
            </div>
            <div className="department-item">
              <div>
                <strong>Kontak</strong>
                <small>
                  {[form.phone, form.email, form.website]
                    .filter(Boolean)
                    .join(" | ") || "Belum diisi"}
                </small>
              </div>
            </div>
            {employees.length === 0 && (
              <div className="department-item">
                <div>
                  <strong>Daftar pegawai kosong</strong>
                  <small>
                    Tambahkan data pegawai terlebih dahulu agar nama kepala dan
                    PPK bisa dipilih dari daftar.
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
