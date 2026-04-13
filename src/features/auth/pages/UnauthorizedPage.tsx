import { Link, useLocation } from "react-router-dom";

export const UnauthorizedPage = () => {
  const location = useLocation();
  const targetPath = String((location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/dashboard");

  return (
    <div className="unauthorized-screen">
      <div className="unauthorized-card">
        <span className="unauthorized-badge">Akses terbatas</span>
        <h1>Anda tidak memiliki izin untuk membuka halaman ini.</h1>
        <p>
          Hak akses akun Anda tidak mencakup menu yang dituju. Silakan kembali ke
          dashboard atau hubungi admin bila menu ini memang diperlukan.
        </p>
        <div className="unauthorized-actions">
          <Link className="button button-primary" to="/dashboard">
            Kembali ke Dashboard
          </Link>
          <Link className="button button-secondary" to={targetPath}>
            Buka halaman sebelumnya
          </Link>
        </div>
      </div>
    </div>
  );
};
