import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createAccount,
  deleteAccount,
  fetchAccounts,
  updateAccount
} from "@/features/accounts/api/accountApi";
import { fetchEmployees } from "@/features/employees/api/employeeApi";
import { Badge } from "@/shared/components/Badge";
import { DataTable } from "@/shared/components/DataTable";
import { SectionHeader } from "@/shared/components/SectionHeader";
import {
  AccountPayload,
  AccountRole,
  Employee,
  UserAccount
} from "@/shared/types";

const roleOptions: AccountRole[] = ["admin", "supervisor", "operator", "user"];

const initialForm: AccountPayload = {
  employeeId: 0,
  username: "",
  password: "123456",
  role: "user",
  isActive: true
};

export const AccountsPage = () => {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);
  const [form, setForm] = useState<AccountPayload>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      setForm({
        employeeId: selectedAccount.employeeId,
        username: selectedAccount.username,
        password: "",
        role: selectedAccount.role,
        isActive: selectedAccount.isActive
      });
      return;
    }

    setForm(initialForm);
  }, [selectedAccount]);

  const employeeOptions = useMemo(() => {
    if (selectedAccount) {
      return employees;
    }

    const registeredEmployeeIds = new Set(accounts.map((item) => item.employeeId));
    return employees.filter((employee) => !registeredEmployeeIds.has(employee.id));
  }, [accounts, employees, selectedAccount]);

  const loadData = async () => {
    const [accountData, employeeData] = await Promise.all([
      fetchAccounts(),
      fetchEmployees()
    ]);

    setAccounts(accountData);
    setEmployees(employeeData);
  };

  const handleSelectEmployee = (employeeId: number) => {
    const selectedEmployee = employees.find((item) => item.id === employeeId);

    setForm((prev) => ({
      ...prev,
      employeeId,
      username: selectedEmployee && (!selectedAccount || !prev.username)
        ? selectedEmployee.nip
        : prev.username
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      if (selectedAccount) {
        await updateAccount(selectedAccount.id, form);
        setMessage("Akun pegawai berhasil diperbarui.");
      } else {
        await createAccount(form);
        setMessage("Akun pegawai berhasil dibuat.");
      }

      setSelectedAccount(null);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menyimpan akun pegawai.");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Hapus akun pegawai ini?");
    if (!confirmed) return;

    try {
      await deleteAccount(id);
      if (selectedAccount?.id === id) {
        setSelectedAccount(null);
      }
      setMessage("Akun pegawai berhasil dihapus.");
      setError("");
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menghapus akun pegawai.");
    }
  };

  const handleResetPassword = async (account: UserAccount) => {
    const confirmed = window.confirm(
      `Reset password akun ${account.fullName} menjadi 123456?`
    );
    if (!confirmed) return;

    try {
      await updateAccount(account.id, {
        employeeId: account.employeeId,
        username: account.username,
        password: "123456",
        role: account.role,
        isActive: account.isActive
      });
      setMessage(`Password akun ${account.fullName} berhasil direset menjadi 123456.`);
      setError("");
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal mereset password akun.");
    }
  };

  return (
    <div className="page-stack">
      <SectionHeader
        title="Akun Pegawai"
        description="Setiap pegawai memiliki akun dengan role admin, supervisor, operator, atau user."
      />

      <div className="notice-card">
        <strong>Aturan akun default</strong>
        <p>
          Pegawai baru otomatis dibuatkan akun dengan username sesuai NIP,
          password <strong>123456</strong>, dan role <strong>user</strong>.
          Gunakan halaman ini untuk mengubah role, status akun, atau reset password.
        </p>
      </div>

      <div className="two-column">
        <div className="panel">
          <div className="panel-heading">
            <h3>{selectedAccount ? "Ubah Akun Pegawai" : "Tambah Akun Pegawai"}</h3>
            <p>Kelola akun login untuk setiap pegawai.</p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              <span>Pegawai</span>
              <select
                value={form.employeeId}
                onChange={(event) => handleSelectEmployee(Number(event.target.value))}
                required
              >
                <option value={0}>Pilih pegawai</option>
                {employeeOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName} | {employee.nip}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Username</span>
              <input
                type="text"
                value={form.username}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, username: event.target.value }))
                }
                required
              />
            </label>

            <label>
              <span>{selectedAccount ? "Password Baru" : "Password"}</span>
              <input
                type="text"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder={selectedAccount ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                required={!selectedAccount}
              />
            </label>

            <label>
              <span>Role</span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
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

            <label className="field-full checkbox-field">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, isActive: event.target.checked }))
                }
              />
              <span>Akun aktif</span>
            </label>

            {message ? <div className="alert success">{message}</div> : null}
            {error ? <div className="alert danger">{error}</div> : null}

            <div className="form-actions">
              <button type="submit" className="button-primary">
                {selectedAccount ? "Simpan Perubahan" : "Simpan Akun"}
              </button>
              {selectedAccount ? (
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => {
                    setSelectedAccount(null);
                    setMessage("");
                    setError("");
                  }}
                >
                  Batal
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h3>Daftar Akun Pegawai</h3>
            <p>Total {accounts.length} akun terdaftar.</p>
          </div>

          <DataTable
            headers={[
              "Pegawai",
              "Username",
              "Role",
              "Status",
              "Aksi"
            ]}
          >
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>
                  <strong>{account.fullName}</strong>
                  <div className="muted-text">{account.nip}</div>
                  <div className="muted-text">
                    {account.departmentName} | {account.position}
                  </div>
                </td>
                <td>{account.username}</td>
                <td>
                  <Badge
                    text={account.role}
                    tone={
                      account.role === "admin"
                        ? "success"
                        : account.role === "supervisor"
                          ? "warning"
                          : "neutral"
                    }
                  />
                </td>
                <td>
                  <Badge
                    text={account.isActive ? "Aktif" : "Nonaktif"}
                    tone={account.isActive ? "success" : "warning"}
                  />
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="button-secondary"
                      onClick={() => {
                        setSelectedAccount(account);
                        setMessage("");
                        setError("");
                      }}
                    >
                      Ubah
                    </button>
                    <button
                      className="button-secondary"
                      onClick={() => void handleResetPassword(account)}
                    >
                      Reset
                    </button>
                    <button
                      className="button-danger"
                      onClick={() => void handleDelete(account.id)}
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
    </div>
  );
};
