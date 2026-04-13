import { FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { changePassword, mustChangePassword, user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = useMemo(() => {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    return from && from !== "/change-password" ? from : "/dashboard";
  }, [location.state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await changePassword(mustChangePassword ? undefined : currentPassword, newPassword, confirmPassword);
      setSuccessMessage("Password berhasil diperbarui. Anda akan diarahkan ke aplikasi.");
      window.setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 800);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memperbarui password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-loading-screen change-password-screen">
      <div className="change-password-card">
        <div className="change-password-header">
          <span className="change-password-badge">
            {mustChangePassword ? "Wajib diperbarui" : "Ubah password"}
          </span>
          <h1>Perbarui password akun</h1>
          <p>
            {mustChangePassword
              ? `Halo ${user?.fullName || "pegawai"}, demi keamanan akun, Anda wajib mengganti password sebelum melanjutkan.`
              : "Gunakan password yang lebih kuat dan mudah Anda ingat."}
          </p>
        </div>

        <form className="change-password-form" onSubmit={handleSubmit}>
          {mustChangePassword ? (
            <div className="login-alert info">
              Demi memudahkan login pertama, Anda tidak perlu memasukkan password saat ini.
              Silakan langsung buat password baru.
            </div>
          ) : (
            <label className="login-field">
              <span>Password saat ini</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Masukkan password saat ini"
              />
            </label>
          )}

          <label className="login-field">
            <span>Password baru</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
            />
          </label>

          <label className="login-field">
            <span>Konfirmasi password baru</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Ulangi password baru"
            />
          </label>

          <div className="change-password-hints">
            <div>Gunakan kombinasi huruf dan angka agar lebih aman.</div>
            <div>Hindari memakai NIP atau nama sendiri sebagai password.</div>
            {mustChangePassword ? (
              <div>Password baru akan langsung menjadi password login utama Anda.</div>
            ) : null}
          </div>

          {errorMessage ? <div className="login-alert error">{errorMessage}</div> : null}
          {successMessage ? <div className="login-alert success">{successMessage}</div> : null}

          <div className="change-password-actions">
            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
            <button type="button" className="button button-secondary" onClick={logout}>
              Keluar dari sesi ini
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
