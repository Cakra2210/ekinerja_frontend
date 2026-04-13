import { AccountRole } from "@/shared/types";

export type NavigationItem = {
  path: string;
  label: string;
};

export const employeeManagementItems: NavigationItem[] = [
  { path: "/employee-management/rankings", label: "Rangking" },
  { path: "/employee-management/evaluations", label: "Penilaian" },
  {
    path: "/employee-management/berakhlak-360",
    label: "Penilaian 360 BerAKHLAK"
  },
  {
    path: "/employee-management/attendance-assessment",
    label: "Penilaian Kehadiran"
  },
  {
    path: "/employee-management/competency-development",
    label: "Pengembangan Kompetensi"
  }
];

export const configurationItems: NavigationItem[] = [
  { path: "/configuration/employees", label: "Pegawai" },
  { path: "/configuration/accounts", label: "Akun Pegawai" },
  { path: "/configuration/positions", label: "Manajemen Jabatan" },
  { path: "/configuration/master-data", label: "Master Data" }
];

export const configurationAccessRoles: AccountRole[] = ["admin", "operator"];
