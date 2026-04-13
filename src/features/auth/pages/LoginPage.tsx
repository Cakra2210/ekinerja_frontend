import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, mustChangePassword } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
    "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={mustChangePassword ? "/change-password" : redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const session = await login(username, password);
      navigate(session.mustChangePassword ? "/change-password" : redirectTo, {
        replace: true,
        state: { from: location.state?.from }
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Login gagal diproses"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-hero">
          <div className="login-brand-mark">KP</div>
          <h1>Sistem Kinerja Pegawai</h1>
          <p>
            Masuk ke aplikasi untuk mengelola data pegawai, penilaian, ranking,
            dan Penilaian 360 BerAKHLAK.
          </p>

          <div className="login-hero-points">
            <div className="login-hero-point">
              <span className="login-point-dot blue" />
              <div>
                <strong>Dashboard cepat</strong>
                <p>Pantau ringkasan nilai, progres, dan ranking pegawai.</p>
              </div>
            </div>

            <div className="login-hero-point">
              <span className="login-point-dot green" />
              <div>
                <strong>Data terintegrasi</strong>
                <p>Login memakai akun pegawai yang tersimpan di database.</p>
              </div>
            </div>

            <div className="login-hero-point">
              <span className="login-point-dot orange" />
              <div>
                <strong>Akses lebih rapi</strong>
                <p>Setiap pegawai dapat masuk memakai username dan password.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="login-card-wrap">
          <div className="login-card">
            <div className="login-card-header">
              <h2>Login</h2>
              <p>Masukkan username dan password akun pegawai.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <label className="login-field">
                <span>Username</span>
                <input
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                />
              </label>

              <label className="login-field">
                <span>Password</span>
                <input
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </label>

              {errorMessage ? (
                <div className="login-alert error">{errorMessage}</div>
              ) : null}

              <button type="submit" className="login-submit" disabled={isSubmitting}>
                {isSubmitting ? "Memproses..." : "Masuk ke Aplikasi"}
              </button>
            </form>

            <div className="login-helper-card">
              <h3>Catatan Login</h3>
              <ul>
                <li>Username mengikuti akun yang ada pada menu Pegawai.</li>
                <li>Password mengikuti password yang tersimpan saat akun dibuat.</li>
                <li>
                  Untuk akun baru atau hasil reset, password awal dapat dipaksa ganti saat login pertama.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
