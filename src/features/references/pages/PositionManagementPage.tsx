import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createPosition,
  deletePosition,
  fetchPositions,
  updatePosition
} from "@/features/references/api/referenceApi";
import { DataTable } from "@/shared/components/DataTable";
import { SectionHeader } from "@/shared/components/SectionHeader";
import { Position, PositionPayload } from "@/shared/types";

const initialForm: PositionPayload = {
  name: "",
  totalPositions: 1
};

export const PositionManagementPage = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [form, setForm] = useState<PositionPayload>(initialForm);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    void loadPositions();
  }, []);

  const totalPositionCount = useMemo(
    () => positions.reduce((total, item) => total + item.totalPositions, 0),
    [positions]
  );

  const loadPositions = async () => {
    const data = await fetchPositions();
    setPositions(data);
  };

  const resetForm = () => {
    setForm(initialForm);
    setSelectedPosition(null);
    setIsFormOpen(false);
  };

  const handleOpenAddForm = () => {
    setSelectedPosition(null);
    setForm(initialForm);
    setIsFormOpen(true);
  };

  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    setForm({
      name: position.name,
      totalPositions: position.totalPositions
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedPosition) {
        await updatePosition(selectedPosition.id, form);
      } else {
        await createPosition(form);
      }

      await loadPositions();
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Hapus data jabatan ini?");
    if (!confirmed) return;

    await deletePosition(id);

    if (selectedPosition?.id === id) {
      resetForm();
    }

    await loadPositions();
  };

  return (
    <div className="page-stack">
      <SectionHeader
        title="Master Jabatan"
        description="Kelola daftar jabatan dan jumlah kebutuhan formasi pada organisasi."
      />

      <div className="stats-grid">
        <div className="stats-card">
          <span className="stats-label">Total jenis jabatan</span>
          <strong>{positions.length}</strong>
          <small>Jumlah master jabatan yang sudah dibuat.</small>
        </div>
        <div className="stats-card">
          <span className="stats-label">Total kebutuhan jabatan</span>
          <strong>{totalPositionCount}</strong>
          <small>Akumulasi jumlah jabatan dari seluruh formasi.</small>
        </div>
        <div className="stats-card">
          <span className="stats-label">Status pengelolaan</span>
          <strong>{positions.length > 0 ? "Aktif" : "Kosong"}</strong>
          <small>Tambahkan data jabatan agar master konfigurasi lengkap.</small>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "16px",
              flexWrap: "wrap"
            }}
          >
            <div>
              <h3>Daftar Jabatan</h3>
              <p>Total {positions.length} data jabatan tersimpan.</p>
            </div>

            <div className="action-buttons">
              <button className="button-primary" onClick={handleOpenAddForm}>
                Tambah Jabatan
              </button>
              {isFormOpen && (
                <button className="button-secondary" onClick={resetForm}>
                  Tutup Form
                </button>
              )}
            </div>
          </div>
        </div>

        {isFormOpen && (
          <div style={{ marginBottom: "22px" }}>
            <div className="panel" style={{ marginBottom: 0 }}>
              <div className="panel-heading">
                <h3>{selectedPosition ? "Ubah Jabatan" : "Tambah Jabatan"}</h3>
                <p>Isi nama jabatan dan jumlah jabatan yang dibutuhkan.</p>
              </div>

              <form className="form-grid" onSubmit={(event) => void handleSubmit(event)}>
                <label className="field-full">
                  <span>Nama Jabatan</span>
                  <input
                    type="text"
                    placeholder="Contoh: Supervisor Operasional"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value
                      }))
                    }
                    required
                  />
                </label>

                <label className="field-full">
                  <span>Jumlah Jabatan</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Masukkan jumlah jabatan"
                    value={form.totalPositions}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        totalPositions: Number(event.target.value)
                      }))
                    }
                    required
                  />
                </label>

                <div className="form-actions">
                  <button className="button-primary" type="submit" disabled={isSubmitting}>
                    {selectedPosition ? "Simpan Perubahan" : "Simpan Jabatan"}
                  </button>
                  <button className="button-secondary" type="button" onClick={resetForm}>
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <DataTable headers={["Nama Jabatan", "Jumlah Jabatan", "Aksi"]}>
          {positions.map((position) => (
            <tr key={position.id}>
              <td>{position.name}</td>
              <td>{position.totalPositions}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="button-secondary"
                    onClick={() => handleEdit(position)}
                  >
                    Ubah
                  </button>
                  <button
                    className="button-danger"
                    onClick={() => void handleDelete(position.id)}
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
};
