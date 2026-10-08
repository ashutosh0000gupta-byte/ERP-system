import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { Wallet, Search, Play, Check, X, Calendar, AlertCircle } from "lucide-react";

export default function Salary() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchSalaries();
  }, [month, year]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/snmr/salaries?month=${month}&year=${year}`);
      setSalaries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!window.confirm(`Generate salaries for ${month}/${year}? This will deduct active advances.`)) return;
    
    setIsGenerating(true);
    try {
      await api.post("/snmr/salaries/generate", { month, year });
      fetchSalaries();
    } catch (err) {
      console.error("Failed to generate", err);
      alert("Failed to generate salaries.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePay = async (id) => {
    try {
      await api.post(`/snmr/salaries/${id}/pay`);
      fetchSalaries();
    } catch (err) {
      console.error("Failed to mark as paid", err);
    }
  };

  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Salary & Payments</h1>
            <p style={styles.subtitle}>Generate wages and process payouts for workers.</p>
          </div>
          
          <div style={styles.headerActions}>
            <div style={styles.controlGroup}>
              <label style={styles.label}>Month</label>
              <select style={styles.input} value={month} onChange={e => setMonth(Number(e.target.value))}>
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div style={styles.controlGroup}>
              <label style={styles.label}>Year</label>
              <select style={styles.input} value={year} onChange={e => setYear(Number(e.target.value))}>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button style={styles.generateBtn} onClick={handleGenerate} disabled={isGenerating}>
              <Play size={16} /> {isGenerating ? "Generating..." : "Generate Payroll"}
            </button>
          </div>
        </div>

        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading wages...</p>
            </div>
          ) : salaries.length === 0 ? (
            <div style={styles.emptyState}>
              <Wallet size={48} color="#cbd5e1" />
              <h3 style={styles.emptyTitle}>No wages generated</h3>
              <p style={styles.emptyDesc}>Click 'Generate Payroll' to calculate wages for {month}/{year}.</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Worker</th>
                  <th style={styles.th}>Days (Pr/Tot)</th>
                  <th style={styles.th}>Wage/Day</th>
                  <th style={styles.th}>Gross Amt</th>
                  <th style={styles.th}>Adv. Deducted</th>
                  <th style={styles.th}>Net Payable</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map(s => (
                  <tr key={s.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={styles.avatar}>{s.worker?.fullName.charAt(0) || '?'}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{s.worker?.fullName || 'Unknown'}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{s.worker?.workerId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 600 }}>{s.presentDays}</span> / {s.totalDays}
                    </td>
                    <td style={styles.td}>₹{s.dailyWage}</td>
                    <td style={styles.td}>₹{s.grossAmount}</td>
                    <td style={styles.td}><span style={{ color: "#e11d48" }}>-₹{s.advanceDeducted}</span></td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 700, fontSize: "15px", color: "#0f766e" }}>₹{s.netAmount}</span>
                    </td>
                    <td style={styles.td}>
                      {s.status === "Paid" ? (
                        <span style={styles.statusPaid}>Paid</span>
                      ) : (
                        <span style={styles.statusPending}>Pending</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {s.status !== "Paid" && (
                        <button onClick={() => handlePay(s.id)} style={styles.payBtn}>
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

const styles = {
  container: { padding: "32px", maxWidth: "1300px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "32px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "15px", color: "#64748b", margin: 0 },
  headerActions: { display: "flex", gap: "16px", alignItems: "flex-end" },
  controlGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#475569" },
  input: { padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#f8fafc", width: "140px" },
  generateBtn: { display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)", height: "42px" },
  tableCard: { background: "#fff", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  tableHead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "16px 20px", fontSize: "13px", fontWeight: "600", color: "#475569", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.2s ease" },
  td: { padding: "16px 20px", verticalAlign: "middle", fontSize: "14px" },
  avatar: { width: "34px", height: "34px", borderRadius: "50%", background: "#f0fdf4", color: "#166534", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" },
  statusPaid: { background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" },
  statusPending: { background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" },
  payBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", color: "#64748b" },
  spinner: { width: "30px", height: "30px", border: "3px solid #f1f5f9", borderTop: "3px solid #0f766e", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "16px" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#334155", margin: "16px 0 8px 0" },
  emptyDesc: { color: "#64748b", margin: 0 }
};
