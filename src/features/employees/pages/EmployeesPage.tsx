import { useEffect, useState } from "react";
import {
  createEmployee,
  deleteEmployee,
  fetchEmployees,
  updateEmployee
} from "@/features/employees/api/employeeApi";
import { fetchPositions } from "@/features/references/api/referenceApi";
import { Badge } from "@/shared/components/Badge";
import { DataTable } from "@/shared/components/DataTable";
import { EmployeeForm } from "@/features/employees/components/EmployeeForm";
import { SectionHeader } from "@/shared/components/SectionHeader";
import { Employee, EmployeePayload, Position } from "@/shared/types";
import { formatDate } from "@/shared/utils/format";

const renderDate = (value?: string | null) => {
  if (!value) return "-";
  return formatDate(value);
};

export const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    const [employeeData, positionData] = await Promise.all([
      fetchEmployees(),
      fetchPositions()
    ]);

    setEmployees(employeeData);
    setPositions(positionData);
  };

  const handleOpenAddForm = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedEmployee(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (payload: EmployeePayload) => {
    if (selectedEmployee) {
      await updateEmployee(selectedEmployee.id, payload);
    } else {
      await createEmployee(payload);
    }

    handleCloseForm();
    await loadData();
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Hapus data pegawai ini?");
    if (!confirmed) return;

    await deleteEmployee(id);

    if (selectedEmployee?.id === id) {
      handleCloseForm();
    }

    await loadData();
  };

  return (
    <div className="page-stack">
      <SectionHeader
        title="Manajemen Pegawai"
        description="Kelola data pegawai, jabatan, status kepegawaian, status aktif, dan akun login."
      />

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
              <h3>Daftar Pegawai</h3>
              <p>Total {employees.length} pegawai terdaftar.</p>
            </div>

            <div className="action-buttons">
              <button className="button-primary" onClick={handleOpenAddForm}>
                Tambah Pegawai
              </button>
              {isFormOpen && (
                <button className="button-secondary" onClick={handleCloseForm}>
                  Tutup Form
                </button>
              )}
            </div>
          </div>
        </div>

        {isFormOpen && (
          <div style={{ marginBottom: "22px" }}>
            <EmployeeForm
              positions={positions}
              onSubmit={handleSubmit}
              selectedEmployee={selectedEmployee}
              onCancelEdit={handleCloseForm}
            />
          </div>
        )}

        <DataTable
          headers={[
            "Nama",
            "NIP",
            "Jabatan",
            "Status Kepegawaian",
            "Status Aktif",
            "Tanggal",
            "Username",
            "Role",
            "Aksi"
          ]}
        >
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.fullName}</td>
              <td>{employee.nip}</td>
              <td>{employee.positionName || employee.position || "-"}</td>
              <td>
                <Badge text={employee.employmentStatus} tone="neutral" />
              </td>
              <td>
                <Badge
                  text={employee.activeStatus === "tidak_aktif" ? "Tidak Aktif" : "Aktif"}
                  tone={employee.activeStatus === "tidak_aktif" ? "warning" : "success"}
                />
              </td>
              <td>{renderDate(employee.effectiveDate)}</td>
              <td>{employee.accountUsername || "-"}</td>
              <td>
                <Badge text={employee.accountRole || "user"} tone="neutral" />
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="button-secondary"
                    onClick={() => handleOpenEditForm(employee)}
                  >
                    Ubah
                  </button>
                  <button
                    className="button-danger"
                    onClick={() => void handleDelete(employee.id)}
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
