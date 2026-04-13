import React, { useEffect, useState } from "react";
import axios from "axios";

export const AttendancePage = () => {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/attendance");
        const resData = res.data.data; // ambil data dari backend
        setData(resData?.records || []);
        setMeta(resData?.meta || {});
      } catch (e) {
        console.error("Error fetching attendance", e);
        setData([]);
        setMeta({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {data.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Pegawai</th>
              <th>NIP</th>
              <th>Bulan</th>
              <th>Tahun</th>
              <th>Jumlah Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row:any) => (
              <tr key={row.id}>
                <td>{row.employeeName}</td>
                <td>{row.nip}</td>
                <td>{row.assessmentMonth}</td>
                <td>{row.assessmentYear}</td>
                <td>{row.attendanceDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>Belum ada data kehadiran</div>
      )}
    </div>
  );
};