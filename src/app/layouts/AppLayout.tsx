import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  configurationAccessRoles,
  configurationItems,
  employeeManagementItems,
  type NavigationItem
} from "@/app/config/navigation";

type SidebarIconName =
  | "home"
  | "system"
  | "settings"
  | "ranking"
  | "evaluation"
  | "berakhlak"
  | "attendance"
  | "employees"
  | "accounts"
  | "positions"
  | "master"
  | "logout"
  | "chevron";

const getIconNameFromPath = (path: string): SidebarIconName => {
  if (path.includes("/dashboard")) {
    return "home";
  }

  if (path.includes("/rankings")) {
    return "ranking";
  }

  if (path.includes("/evaluations")) {
    return "evaluation";
  }

  if (path.includes("/berakhlak-360")) {
    return "berakhlak";
  }

  if (path.includes("/attendance-assessment")) {
    return "attendance";
  }

  if (path.includes("/configuration/employees")) {
    return "employees";
  }

  if (path.includes("/configuration/accounts")) {
    return "accounts";
  }

  if (path.includes("/configuration/positions")) {
    return "positions";
  }

  return "master";
};

const getToneFromIconName = (name: SidebarIconName) => {
  switch (name) {
    case "home":
      return "home";
    case "system":
    case "ranking":
      return "system";
    case "settings":
    case "positions":
      return "settings";
    case "evaluation":
      return "evaluation";
    case "berakhlak":
      return "berakhlak";
    case "attendance":
      return "attendance";
    case "employees":
      return "employees";
    case "accounts":
      return "accounts";
    case "logout":
      return "logout";
    default:
      return "default";
  }
};

const SidebarIcon = ({ name }: { name: SidebarIconName }) => {
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 11.8 12 5l8 6.8V20a1 1 0 0 1-1 1h-4.8v-5.4H9.8V21H5a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "system":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v8A1.5 1.5 0 0 1 18.5 16h-13A1.5 1.5 0 0 1 4 14.5zM9 19h6m-8 0h10" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 8.25A3.75 3.75 0 1 1 8.25 12 3.75 3.75 0 0 1 12 8.25zm0-5.25 1.05 2.63a7.2 7.2 0 0 1 1.9.79L17.6 5.3l1.1 1.1-1.12 2.65c.33.6.6 1.23.79 1.9L21 12l-2.63 1.05a7.2 7.2 0 0 1-.79 1.9l1.12 2.65-1.1 1.1-2.65-1.12a7.2 7.2 0 0 1-1.9.79L12 21l-1.05-2.63a7.2 7.2 0 0 1-1.9-.79L6.4 18.7l-1.1-1.1 1.12-2.65a7.2 7.2 0 0 1-.79-1.9L3 12l2.63-1.05c.19-.67.46-1.3.79-1.9L5.3 6.4l1.1-1.1 2.65 1.12c.6-.33 1.23-.6 1.9-.79z" />
        </svg>
      );
    case "ranking":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 20V10h3v10zm5 0V4h3v16zm5 0v-7h3v7zM2 20v-5h3v5z" />
        </svg>
      );
    case "evaluation":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm7 1.5V8h3.5M9 12h6m-6 3h6m-6 3h4" />
        </svg>
      );
    case "berakhlak":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20.5 4.9 16V8L12 3.5 19.1 8v8zM9.2 12.3l1.8 1.9 3.8-4" />
        </svg>
      );
    case "attendance":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 2v3m10-3v3M5 6h14a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1zm2 5h10m-10 4h6" />
        </svg>
      );
    case "employees":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1m10-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5 8v-1a3 3 0 0 0-2.2-2.9M16 6.3a3 3 0 0 1 0 5.4" />
        </svg>
      );
    case "accounts":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 8a7 7 0 0 1 14 0m2-9V9m0 0V6m0 3h-3m3 0h3" />
        </svg>
      );
    case "positions":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm5-4h6a2 2 0 0 1 2 2v2H7V6a2 2 0 0 1 2-2z" />
        </svg>
      );
    case "master":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5h6v6H5zm8 0h6v6h-6zM5 13h6v6H5zm8 0h6v6h-6z" />
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 17 15 12 10 7m5 5H4m6 9H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        </svg>
      );
    case "chevron":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    default:
      return null;
  }
};

const SidebarIconBadge = ({ name }: { name: SidebarIconName }) => (
  <span className="settings-link-icon" data-tone={getToneFromIconName(name)}>
    <SidebarIcon name={name} />
  </span>
);

const ProfileAvatar = () => {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="36" fill="#f2f2f2" />
      <circle cx="36" cy="25" r="11" fill="#8f8f94" />
      <path
        d="M20.5 53.5a15.5 15.5 0 0 1 31 0"
        fill="#8f8f94"
        stroke="#8f8f94"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
};

const SidebarItem = ({
  path,
  label,
  iconName
}: {
  path: string;
  label: string;
  iconName?: SidebarIconName;
}) => {
  const resolvedIconName = iconName ?? getIconNameFromPath(path);

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        isActive ? "settings-link active" : "settings-link"
      }
    >
      <SidebarIconBadge name={resolvedIconName} />
      <span className="settings-link-label">{label}</span>
    </NavLink>
  );
};

type SidebarGroupProps = {
  label: string;
  items: NavigationItem[];
  isOpen: boolean;
  onToggle: () => void;
  isActive: boolean;
  iconName: SidebarIconName;
};

const SidebarGroup = ({
  label,
  items,
  isOpen,
  onToggle,
  isActive,
  iconName
}: SidebarGroupProps) => {
  return (
    <div className={isActive ? "settings-group active" : "settings-group"}>
      <button
        type="button"
        className={
          isOpen
            ? isActive
              ? "settings-group-toggle open active"
              : "settings-group-toggle open"
            : isActive
              ? "settings-group-toggle active"
              : "settings-group-toggle"
        }
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <SidebarIconBadge name={iconName} />
        <span className="settings-link-label">{label}</span>
        <span className="settings-group-arrow" aria-hidden="true">
          <SidebarIcon name="chevron" />
        </span>
      </button>

      {isOpen ? (
        <div className="settings-submenu">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: isSubItemActive }) =>
                isSubItemActive ? "settings-sublink active" : "settings-sublink"
              }
            >
              <span className="settings-sublink-label">{item.label}</span>
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const canAccessConfiguration = useMemo(
    () => configurationAccessRoles.includes(user?.role ?? "user"),
    [user?.role]
  );

  const isEmployeeManagementActive = useMemo(
    () => location.pathname.startsWith("/employee-management"),
    [location.pathname]
  );

  const isConfigurationActive = useMemo(
    () => location.pathname.startsWith("/configuration"),
    [location.pathname]
  );

  const [isEmployeeManagementOpen, setIsEmployeeManagementOpen] = useState(
    isEmployeeManagementActive
  );
  const [isConfigurationOpen, setIsConfigurationOpen] = useState(
    isConfigurationActive && canAccessConfiguration
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isEmployeeManagementActive) {
      setIsEmployeeManagementOpen(true);
    }

    if (isConfigurationActive && canAccessConfiguration) {
      setIsConfigurationOpen(true);
    }
  }, [canAccessConfiguration, isConfigurationActive, isEmployeeManagementActive]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell settings-shell">
      <button
        type="button"
        className={isSidebarOpen ? "sidebar-overlay open" : "sidebar-overlay"}
        aria-label="Tutup menu"
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={
          isSidebarOpen ? "sidebar settings-sidebar open" : "sidebar settings-sidebar"
        }
      >
        <div className="sidebar-mobile-head">
          <div className="settings-mobile-title">Navigasi</div>
          <button
            type="button"
            className="sidebar-close-button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-profile-avatar" aria-hidden="true">
            <ProfileAvatar />
          </div>
          <div className="sidebar-profile-meta">
            <strong>{user?.fullName || "Pengguna"}</strong>
            <span>@{user?.username || "akun"}</span>
            <small>{String(user?.role || "user").toUpperCase()}</small>
          </div>
        </div>

        <nav className="settings-nav" aria-label="Menu aplikasi">
          <SidebarItem path="/dashboard" label="Home" iconName="home" />

          <SidebarGroup
            label="Manajemen Pegawai"
            items={employeeManagementItems}
            isOpen={isEmployeeManagementOpen}
            onToggle={() => setIsEmployeeManagementOpen((current) => !current)}
            isActive={isEmployeeManagementActive}
            iconName="system"
          />

          {canAccessConfiguration ? (
            <SidebarGroup
              label="Pengaturan Sistem"
              items={configurationItems}
              isOpen={isConfigurationOpen}
              onToggle={() => setIsConfigurationOpen((current) => !current)}
              isActive={isConfigurationActive}
              iconName="settings"
            />
          ) : null}
        </nav>

        <div className="settings-sidebar-footer">
          <button
            type="button"
            className="settings-link settings-link-button"
            onClick={handleLogout}
          >
            <SidebarIconBadge name="logout" />
            <span className="settings-link-label">Keluar</span>
          </button>
        </div>
      </aside>

      <main className="content">
        <div className="mobile-topbar settings-mobile-topbar">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Buka menu"
          >
            ☰
          </button>

          <div className="mobile-topbar-title">
            <strong>Kinerja Pegawai</strong>
            <span>{user?.fullName || "Pengguna"}</span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
};
