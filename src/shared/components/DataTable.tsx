import { ReactNode } from "react";

type DataTableProps = {
  headers: string[];
  children?: ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
};

export const DataTable = ({
  headers,
  children,
  isLoading = false,
  emptyMessage = "Belum ada data untuk ditampilkan."
}: DataTableProps) => {
  const childCount = Array.isArray(children)
    ? children.filter(Boolean).length
    : children
      ? 1
      : 0;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="table-empty-state">
                Memuat data...
              </td>
            </tr>
          ) : childCount > 0 ? (
            children
          ) : (
            <tr>
              <td colSpan={headers.length} className="table-empty-state">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
