import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { CheckSquare, Calendar, Building2, HardHat, Check, X, Clock, Loader2, Download } from "lucide-react";

export default function WorkerAttendance() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [workers, setWorkers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    // Fetch sites on mount
    api.get("/snmr/sites").then(res => {
      setSites(res.data);
      if (res.data.length > 0) {
        setSelectedSite(res.data[0].id);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedSite && date) {
      fetchData();
    }
  }, [selectedSite, date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [workersRes, attendanceRes] = await Promise.all([
        api.get(`/snmr/workers?siteId=${selectedSite}`),
        api.get(`/snmr/attendance?siteId=${selectedSite}&date=${date}`)
      ]);
      // If the backend doesn't filter by siteId properly, we do it here just in case
      const siteWorkers = workersRes.data.filter(w => w.siteId === selectedSite);
      setWorkers(siteWorkers.length > 0 ? siteWorkers : workersRes.data); 
      setAttendanceRecords(attendanceRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMark = async (workerId, status) => {
    setMarkingId(workerId);
    try {
      const res = await api.post("/snmr/attendance", {
        workerId,
        siteId: selectedSite,
        date,
        status,
        otHours: 0
      });
      
      // Update local state
      setAttendanceRecords(prev => {
        const existing = prev.findIndex(r => r.workerId === workerId);
        if (existing >= 0) {
          const newRecords = [...prev];
          newRecords[existing] = res.data;
          return newRecords;
        }
        return [...prev, res.data];
      });
    } catch (err) {
      console.error("Failed to mark attendance", err);
      alert("Failed to mark attendance.");
    } finally {
      setMarkingId(null);
    }
  };

  // Merge workers with their attendance status
  const list = workers.map(w => {
    const record = attendanceRecords.find(r => r.workerId === w.id);
    return {
      ...w,
      attendanceStatus: record?.status || null,
      recordId: record?.id
    };
  });

  const handleExportCSV = () => {
    if (list.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Worker ID", "Name", "Trade", "Daily Wage", "Attendance Status"];
    
    const rows = list.map(w => [
      w.workerId || "N/A",
      `"${w.fullName || "Unknown"}"`,
      `"${w.skillTrade || "N/A"}"`,
      w.dailyWage || 0,
      w.attendanceStatus || "Not Marked"
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const siteName = sites.find(s => s.id === selectedSite)?.name || "Site";
    link.setAttribute("download", `Attendance_${siteName}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Worker Attendance</h1>
            <p style={styles.subtitle}>Mark daily attendance for site staff and laborers.</p>
          </div>
        </div>

        {/* Controls */}
        <div style={styles.controlsCard}>
          <div style={{ display: "flex", gap: "24px", flex: 1 }}>
          <div style={styles.controlGroup}>
            <label style={styles.label}><Building2 size={16} /> Select Site</label>
            <select 
              style={styles.input}
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
            >
              <option value="" disabled>Select a site...</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
            <div style={styles.controlGroup}>
              <label style={styles.label}><Calendar size={16} /> Date</label>
              <input 
                type="date"
                style={styles.input}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <button 
            style={styles.exportBtn} 
            onClick={handleExportCSV} 
            disabled={list.length === 0}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading roster...</p>
            </div>
          ) : list.length === 0 ? (
            <div style={styles.emptyState}>
              <HardHat size={48} color="#cbd5e1" />
              <h3 style={styles.emptyTitle}>No workers assigned</h3>
              <p style={styles.emptyDesc}>There are no active workers assigned to this site.</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Worker Details</th>
                  <th style={styles.th}>Trade</th>
                  <th style={styles.th}>Current Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(w => (
                  <tr key={w.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={styles.avatar}>{w.fullName.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{w.fullName}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{w.workerId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{w.skillTrade || "—"}</td>
                    <td style={styles.td}>
                      {w.attendanceStatus ? (
                        <span style={{
                          ...styles.statusBadge,
                          background: w.attendanceStatus === "Present" ? "#dcfce7" : 
                                      w.attendanceStatus === "Half Day" ? "#fef3c7" : "#fee2e2",
                          color: w.attendanceStatus === "Present" ? "#166534" : 
                                 w.attendanceStatus === "Half Day" ? "#92400e" : "#991b1b"
                        }}>
                          {w.attendanceStatus}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "14px" }}>Not marked</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                          disabled={markingId === w.id}
                          onClick={() => handleMark(w.id, "Present")}
                          style={{ ...styles.actionBtn, ...styles.btnPresent, opacity: markingId === w.id ? 0.5 : 1 }}
                        >
                          <Check size={14} /> Present
                        </button>
                        <button 
                          disabled={markingId === w.id}
                          onClick={() => handleMark(w.id, "Half Day")}
                          style={{ ...styles.actionBtn, ...styles.btnHalf, opacity: markingId === w.id ? 0.5 : 1 }}
                        >
                          <Clock size={14} /> Half
                        </button>
                        <button 
                          disabled={markingId === w.id}
                          onClick={() => handleMark(w.id, "Absent")}
                          style={{ ...styles.actionBtn, ...styles.btnAbsent, opacity: markingId === w.id ? 0.5 : 1 }}
                        >
                          <X size={14} /> Absent
                        </button>
                      </div>
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
  container: { padding: "32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  header: { marginBottom: "24px" },
  title: { fontSize: "32px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "15px", color: "#64748b", margin: 0 },
  exportBtn: { display: "flex", alignItems: "center", gap: "8px", background: "#fff", color: "#334155", border: "1px solid #cbd5e1", padding: "12px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer", height: "46px" },
  controlsCard: {
    background: "#fff", padding: "20px", borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0",
    display: "flex", gap: "24px", marginBottom: "24px", alignItems: "flex-end", justifyContent: "space-between"
  },
  controlGroup: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  label: { display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600", color: "#334155" },
  input: {
    padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1",
    fontSize: "15px", outline: "none", background: "#f8fafc", width: "100%"
  },
  tableCard: {
    background: "#fff", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    border: "1px solid #e2e8f0", overflow: "hidden"
  },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  tableHead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "16px 24px", fontSize: "13px", fontWeight: "600", color: "#475569", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.2s ease" },
  td: { padding: "16px 24px", verticalAlign: "middle" },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%", background: "#f0f9ff",
    color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "15px", fontWeight: "700"
  },
  statusBadge: { padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  actionBtn: {
    display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px",
    borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "none"
  },
  btnPresent: { background: "#dcfce7", color: "#166534" },
  btnHalf: { background: "#fef3c7", color: "#92400e" },
  btnAbsent: { background: "#fee2e2", color: "#991b1b" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", color: "#64748b" },
  spinner: {
    width: "30px", height: "30px", border: "3px solid #f1f5f9",
    borderTop: "3px solid #0f766e", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "16px"
  },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#334155", margin: "16px 0 8px 0" },
  emptyDesc: { color: "#64748b", margin: 0 }
};
