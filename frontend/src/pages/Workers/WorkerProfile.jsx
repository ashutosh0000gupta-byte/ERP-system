import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { User, Phone, MapPin, Calendar, Clock, CreditCard, ChevronLeft, Building2 } from "lucide-react";

export default function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorker = () => {
    setLoading(true);
    api.get(`/snmr/workers/${id}`)
      .then(res => setWorker(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorker();
  }, [id]);

  const handleToggleStatus = async () => {
    const newStatus = worker.status === "Active" ? "Inactive" : "Active";
    let exitReason = null;
    
    if (newStatus === "Inactive") {
      exitReason = window.prompt("Reason for deactivation/leaving (optional):");
      if (exitReason === null) return; // User cancelled
    }
    
    try {
      await api.put(`/snmr/workers/${id}/status`, { status: newStatus, exitReason });
      fetchWorker(); // refresh
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to PERMANENTLY delete this worker and all their data (attendance, salaries, etc)? This cannot be undone.")) {
      const pwd = window.prompt("Enter Admin Password to confirm deletion:");
      if (!pwd) return;
      try {
        await api.delete(`/snmr/workers/${id}?password=${encodeURIComponent(pwd)}`);
        navigate("/workers");
      } catch (err) {
        alert(err.response?.data?.error || err.response?.data?.message || err.message);
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <div style={styles.spinner}></div>
        </div>
      </MainLayout>
    );
  }

  if (!worker) {
    return (
      <MainLayout>
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Worker not found
        </div>
      </MainLayout>
    );
  }

  // Aggregate some simple stats
  const totalAdvances = worker.advances.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalDeducted = worker.advances.filter(a => a.isDeducted).reduce((acc, curr) => acc + Number(curr.amount), 0);
  const pendingAdvance = totalAdvances - totalDeducted;

  return (
    <MainLayout>
      <div style={styles.container}>
        {/* Back Button */}
        <button style={styles.backBtn} onClick={() => navigate("/workers")}>
          <ChevronLeft size={18} />
          Back to Workers
        </button>

        {/* Header Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.avatarLarge}>{worker.fullName.charAt(0)}</div>
            <div>
              <h1 style={styles.title}>{worker.fullName}</h1>
              <div style={styles.badgeContainer}>
                <span style={styles.badgeID}>{worker.workerId}</span>
                {worker.status === "Active" ? (
                  <span style={styles.badgeActive}>Active</span>
                ) : (
                  <span style={styles.badgeInactive}>Inactive</span>
                )}
                {worker.site && (
                  <span style={styles.badgeSite}><Building2 size={12} /> {worker.site.name}</span>
                )}
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
              <button 
                style={{
                  background: worker.status === "Active" ? "#fee2e2" : "#dcfce7",
                  color: worker.status === "Active" ? "#991b1b" : "#166534",
                  border: "none",
                  fontWeight: "600",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
                onClick={handleToggleStatus}
              >
                {worker.status === "Active" ? "Deactivate Worker" : "Re-activate Worker"}
              </button>
              <button 
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  border: "1px solid #fca5a5",
                  fontWeight: "600",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
                onClick={handleDelete}
                title="Permanently Delete"
              >
                Delete
              </button>
            </div>
          </div>
          
          <div style={styles.contactGrid}>
            <div style={styles.contactItem}>
              <Phone size={16} color="#64748b" />
              <span>{worker.phone || "No phone provided"}</span>
            </div>
            <div style={styles.contactItem}>
              <MapPin size={16} color="#64748b" />
              <span>{worker.address || "No address provided"}</span>
            </div>
            <div style={styles.contactItem}>
              <User size={16} color="#64748b" />
              <span>Joined {new Date(worker.joinDate).toLocaleDateString()}</span>
            </div>
            <div style={styles.contactItem}>
              <CreditCard size={16} color="#64748b" />
              <span>Daily Wage: <strong style={{ color: "#0f172a" }}>₹{worker.dailyWage || 0}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Pending Advance</p>
            <h3 style={{ ...styles.statValue, color: "#e11d48" }}>₹{pendingAdvance.toLocaleString()}</h3>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Advance Taken</p>
            <h3 style={styles.statValue}>₹{totalAdvances.toLocaleString()}</h3>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Salaries Paid</p>
            <h3 style={styles.statValue}>
              ₹{worker.salaries.filter(s => s.status === 'Paid').reduce((acc, curr) => acc + Number(curr.netAmount), 0).toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Three Columns: Attendance, Advances, Salaries */}
        <div style={styles.threeColGrid}>
          
          {/* Column 1: Attendance (Recent 30) */}
          <div style={styles.listCard}>
            <h3 style={styles.listTitle}>Recent Attendance</h3>
            <div style={styles.listContent}>
              {worker.attendances.length === 0 ? <p style={styles.empty}>No attendance records</p> : (
                <div style={styles.timeline}>
                  {worker.attendances.map(a => (
                    <div key={a.id} style={styles.timelineItem}>
                      <div style={styles.timelineDate}>
                        {new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </div>
                      <div style={styles.timelineStatus}>
                        <span style={a.status === 'Present' ? styles.tagPresent : a.status === 'Half Day' ? styles.tagHalf : styles.tagAbsent}>
                          {a.status}
                        </span>
                        {a.otHours > 0 && <span style={styles.tagOT}>OT: {a.otHours}h</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Advances */}
          <div style={styles.listCard}>
            <h3 style={styles.listTitle}>Advance History</h3>
            <div style={styles.listContent}>
              {worker.advances.length === 0 ? <p style={styles.empty}>No advances taken</p> : (
                <table style={styles.table}>
                  <tbody>
                    {worker.advances.map(adv => (
                      <tr key={adv.id} style={styles.tr}>
                        <td style={styles.tdSmall}>{new Date(adv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                        <td style={{ ...styles.tdSmall, fontWeight: 700 }}>₹{Number(adv.amount)}</td>
                        <td style={styles.tdSmall}>
                          {adv.isDeducted ? <span style={{ color: "#16a34a", fontSize: "11px" }}>Deducted</span> : <span style={{ color: "#e11d48", fontSize: "11px" }}>Pending</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Column 3: Salaries */}
          <div style={styles.listCard}>
            <h3 style={styles.listTitle}>Salary History</h3>
            <div style={styles.listContent}>
              {worker.salaries.length === 0 ? <p style={styles.empty}>No salary records</p> : (
                <table style={styles.table}>
                  <tbody>
                    {worker.salaries.map(sal => (
                      <tr key={sal.id} style={styles.tr}>
                        <td style={styles.tdSmall}>
                          {new Date(sal.year, sal.month - 1).toLocaleString('default', { month: 'short', year: '2-digit' })}
                        </td>
                        <td style={{ ...styles.tdSmall, fontWeight: 700, color: "#0f766e" }}>₹{Number(sal.netAmount)}</td>
                        <td style={styles.tdSmall}>
                          {sal.status === 'Paid' ? <span style={{ color: "#16a34a", fontSize: "11px" }}>Paid</span> : <span style={{ color: "#d97706", fontSize: "11px" }}>Unpaid</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}

const styles = {
  container: { padding: "32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#64748b", fontSize: "14px", fontWeight: 500, cursor: "pointer", padding: "0 0 20px 0" },
  spinner: { width: "40px", height: "40px", border: "4px solid #f1f5f9", borderTop: "4px solid #2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" },
  
  profileCard: { background: "#fff", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "24px" },
  profileHeader: { display: "flex", alignItems: "center", gap: "20px" },
  avatarLarge: { width: "72px", height: "72px", borderRadius: "20px", background: "#f0f9ff", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 700 },
  title: { fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" },
  badgeContainer: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  badgeID: { background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, border: "1px solid #e2e8f0" },
  badgeActive: { background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: 600 },
  badgeInactive: { background: "#fee2e2", color: "#991b1b", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: 600 },
  badgeSite: { display: "flex", alignItems: "center", gap: "4px", background: "#f3e8ff", color: "#7e22ce", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: 600 },
  
  contactGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" },
  contactItem: { display: "flex", alignItems: "center", gap: "10px", color: "#475569", fontSize: "14px", fontWeight: 500 },
  
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "24px" },
  statCard: { background: "#fff", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9" },
  statLabel: { margin: 0, fontSize: "13px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" },
  statValue: { margin: "8px 0 0 0", fontSize: "24px", fontWeight: 800, color: "#0f172a" },
  
  threeColGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", alignItems: "start" },
  listCard: { background: "#fff", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9", overflow: "hidden", display: "flex", flexDirection: "column" },
  listTitle: { margin: 0, padding: "16px 20px", fontSize: "15px", fontWeight: 700, color: "#0f172a", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" },
  listContent: { padding: "16px 20px", maxHeight: "400px", overflowY: "auto" },
  empty: { fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "20px 0" },
  
  timeline: { display: "flex", flexDirection: "column", gap: "12px" },
  timelineItem: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px dashed #e2e8f0" },
  timelineDate: { fontSize: "13px", fontWeight: 600, color: "#334155" },
  timelineStatus: { display: "flex", alignItems: "center", gap: "6px" },
  tagPresent: { background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 },
  tagHalf: { background: "#fef3c7", color: "#92400e", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 },
  tagAbsent: { background: "#fee2e2", color: "#991b1b", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 },
  tagOT: { background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 },
  
  table: { width: "100%", borderCollapse: "collapse" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  tdSmall: { padding: "10px 0", fontSize: "13px", color: "#334155" }
};
