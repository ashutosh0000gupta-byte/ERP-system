import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Download, FileSpreadsheet, TrendingUp, Filter, Calendar } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("salary");
  const [dateRange, setDateRange] = useState("this_month");

  const reports = [
    { id: 1, title: "Monthly Payroll Summary", type: "salary", format: "Excel / CSV", icon: <FileSpreadsheet size={24} color="#0f766e" /> },
    { id: 2, title: "Site Wise Expense Report", type: "expense", format: "PDF / Excel", icon: <TrendingUp size={24} color="#e11d48" /> },
    { id: 3, title: "Worker Attendance Log", type: "attendance", format: "Excel / CSV", icon: <Calendar size={24} color="#0284c7" /> }
  ];

  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Reports & Analytics</h1>
            <p style={styles.subtitle}>Download and analyze financial and operational data.</p>
          </div>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.filterGroup}>
            <select style={styles.select} value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="all">All Reports</option>
              <option value="salary">Payroll & Salary</option>
              <option value="expense">Site Expenses</option>
              <option value="attendance">Attendance</option>
            </select>
            <select style={styles.select} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        <div style={styles.grid}>
          {reports
            .filter(r => reportType === "all" || r.type === reportType)
            .map(report => (
            <div key={report.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.iconBox}>{report.icon}</div>
                <div style={styles.cardActions}>
                  <button style={styles.downloadBtn}>
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
              <h3 style={styles.cardTitle}>{report.title}</h3>
              <p style={styles.cardMeta}>Format: {report.format}</p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

const styles = {
  container: { padding: "32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
  title: { fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "15px", color: "#64748b", margin: 0 },
  toolbar: { display: "flex", gap: "16px", marginBottom: "24px", background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" },
  filterGroup: { display: "flex", gap: "12px", width: "100%" },
  select: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#f8fafc", color: "#334155", minWidth: "180px", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" },
  card: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", transition: "transform 0.2s" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  iconBox: { width: "48px", height: "48px", background: "#f1f5f9", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle: { margin: "0 0 8px 0", fontSize: "16px", fontWeight: "700", color: "#0f172a" },
  cardMeta: { margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "500" },
  downloadBtn: { display: "flex", alignItems: "center", gap: "6px", background: "#f0fdfa", color: "#0f766e", border: "1px solid #ccfbf1", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "background 0.2s" }
};
