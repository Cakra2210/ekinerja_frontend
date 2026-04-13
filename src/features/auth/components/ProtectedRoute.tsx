import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { LoginUser } from "@/features/auth/api/authApi";

type ProtectedRouteProps = {
  allowedRoles?: LoginUser["role"][];
};

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps = {}) => {
  const location = useLocation();
  const { isAuthenticated, isReady, user, mustChangePassword } = useAuth();

  if (!isReady) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-card">
          <div className="auth-loading-spinner" />
          <p>Menyiapkan sesi aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = user?.role;

    if (!currentRole || !allowedRoles.includes(currentRole)) {
      return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
  }

  return <Outlet />;
};
