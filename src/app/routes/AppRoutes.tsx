import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { AppLayout } from "@/app/layouts/AppLayout";
import { configurationAccessRoles } from "@/app/config/navigation";
import { AccountsPage } from "@/features/accounts";
import { AttendanceAssessmentPage } from "@/features/attendance";
import { CompetencyDevelopmentPage } from "@/features/competency";
import { ChangePasswordPage, LoginPage, UnauthorizedPage } from "@/features/auth";
import { Berakhlak360Page } from "@/features/berakhlak";
import { DashboardPage } from "@/features/dashboard";
import { EmployeesPage } from "@/features/employees";
import { EvaluationsPage, RankingsPage } from "@/features/evaluations";
import { PositionManagementPage, WorkUnitProfilePage } from "@/features/references";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route
            path="/employee-management"
            element={<Navigate to="/employee-management/rankings" replace />}
          />
          <Route
            path="/employee-management/rankings"
            element={<RankingsPage />}
          />
          <Route
            path="/employee-management/evaluations"
            element={<EvaluationsPage />}
          />
          <Route
            path="/employee-management/berakhlak-360"
            element={<Berakhlak360Page />}
          />
          <Route
            path="/employee-management/attendance-assessment"
            element={<AttendanceAssessmentPage />}
          />
          <Route
            path="/employee-management/competency-development"
            element={<CompetencyDevelopmentPage />}
          />

          <Route
            path="/configuration"
            element={<Navigate to="/configuration/employees" replace />}
          />
          <Route element={<ProtectedRoute allowedRoles={configurationAccessRoles} />}>
            <Route path="/configuration/employees" element={<EmployeesPage />} />
            <Route path="/configuration/accounts" element={<AccountsPage />} />
            <Route
              path="/configuration/positions"
              element={<PositionManagementPage />}
            />
            <Route
              path="/configuration/master-data"
              element={<WorkUnitProfilePage />}
            />
          </Route>

          <Route
            path="/employees"
            element={<Navigate to="/configuration/employees" replace />}
          />
          <Route
            path="/accounts"
            element={<Navigate to="/configuration/accounts" replace />}
          />
          <Route
            path="/positions"
            element={<Navigate to="/configuration/positions" replace />}
          />
          <Route
            path="/master-data"
            element={<Navigate to="/configuration/master-data" replace />}
          />
          <Route
            path="/rankings"
            element={<Navigate to="/employee-management/rankings" replace />}
          />
          <Route
            path="/evaluations"
            element={<Navigate to="/employee-management/evaluations" replace />}
          />
          <Route
            path="/berakhlak-360"
            element={<Navigate to="/employee-management/berakhlak-360" replace />}
          />
          <Route
            path="/attendance-assessment"
            element={<Navigate to="/employee-management/attendance-assessment" replace />}
          />
          <Route
            path="/competency-development"
            element={<Navigate to="/employee-management/competency-development" replace />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
