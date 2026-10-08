import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/snmr/workers");
      setWorkers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", margin: 0, color: "#1e293b" }}>Worker Master</h1>
          <button style={{ background: "#0f766e", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
            + Add Worker
          </button>
        </div>

        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading workers...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "16px", textAlign: "left", color: "#475569", fontWeight: 600, fontSize: "14px" }}>ID</th>
                  <th style={{ padding: "16px", textAlign: "left", color: "#475569", fontWeight: 600, fontSize: "14px" }}>Name</th>
                  <th style={{ padding: "16px", textAlign: "left", color: "#475569", fontWeight: 600, fontSize: "14px" }}>Trade</th>
                  <th style={{ padding: "16px", textAlign: "left", color: "#475569", fontWeight: 600, fontSize: "14px" }}>Site</th>
                  <th style={{ padding: "16px", textAlign: "left", color: "#475569", fontWeight: 600, fontSize: "14px" }}>Daily Wage</th>
                  <th style={{ padding: "16px", textAlign: "left", color: "#475569", fontWeight: 600, fontSize: "14px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(w => (
                  <tr key={w.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "16px", color: "#0f172a", fontWeight: 500 }}>{w.workerId}</td>
                    <td style={{ padding: "16px", color: "#334155" }}>{w.fullName}</td>
                    <td style={{ padding: "16px", color: "#64748b" }}>{w.skillTrade}</td>
                    <td style={{ padding: "16px", color: "#64748b" }}>{w.site?.name || "Unassigned"}</td>
                    <td style={{ padding: "16px", color: "#64748b" }}>₹{w.dailyWage}</td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ background: w.status === "Active" ? "#dcfce7" : "#f1f5f9", color: w.status === "Active" ? "#166534" : "#475569", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && workers.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No workers found.</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
