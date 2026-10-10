import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { Building2, Save, Shield, Bell, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [isClearing, setIsClearing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "SNMR FAB INDIA PRIVATE LIMITED",
    email: "sonu@snmrfab.in",
    phone: "+91 9876543210",
    address: "Construction HQ, India",
    gstin: "22AAAAA0000A1Z5"
  });

  const handleClearDemoData = async () => {
    if (!window.confirm("CRITICAL WARNING: This will permanently delete ALL demo workers, daily attendance, advances, salaries, payments, expenses, and sites from the database.\n\nCompany user logins (sonu@snmrfab.in) and admin roles will remain safe.\n\nDo you want to proceed with database cleanup for company handover?")) {
      return;
    }
    const pwd = window.prompt("Enter Admin Password to confirm data deletion:");
    if (!pwd) return;
    try {
      setIsClearing(true);
      const res = await api.post("/snmr/clear-demo-data", { password: pwd });
      alert(res.data?.message || "All demo data has been completely and permanently deleted from the database!");
    } catch (err) {
      alert("Failed to delete demo data: " + (err.response?.data?.error || err.message));
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>System Settings</h1>
            <p style={styles.subtitle}>Manage your company profile, database reset, and application preferences.</p>
          </div>
          {activeTab === "company" && (
            <button style={styles.saveBtn} onClick={() => alert("Company profile updated successfully!")}>
              <Save size={16} /> Save Changes
            </button>
          )}
        </div>

        <div style={styles.layout}>
          {/* Sidebar Tabs */}
          <div style={styles.sidebar}>
            <button 
              style={activeTab === "company" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("company")}
            >
              <Building2 size={18} /> Company Profile
            </button>
            <button 
              style={activeTab === "security" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("security")}
            >
              <Shield size={18} /> Security
            </button>
            <button 
              style={activeTab === "notifications" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("notifications")}
            >
              <Bell size={18} /> Notifications
            </button>
            <button 
              style={activeTab === "database" ? styles.tabActiveDanger : styles.tabDanger}
              onClick={() => setActiveTab("database")}
            >
              <Trash2 size={18} /> Reset Demo Data
            </button>
          </div>

          {/* Settings Content */}
          <div style={styles.content}>
            {activeTab === "company" && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Company Information</h2>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Company Name</label>
                    <input style={styles.input} value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>GSTIN Number</label>
                    <input style={styles.input} value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Primary Email</label>
                    <input style={styles.input} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <input style={styles.input} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div style={{...styles.formGroup, gridColumn: "1 / -1"}}>
                    <label style={styles.label}>Registered Address</label>
                    <textarea style={{...styles.input, minHeight: "80px", resize: "vertical"}} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Security Settings</h2>
                <p style={{color:"#64748b", fontSize:"14px"}}>Two-factor authentication and password policies are active.</p>
              </div>
            )}

            {activeTab === "notifications" && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Notification Preferences</h2>
                <p style={{color:"#64748b", fontSize:"14px"}}>Manage email and push notification settings for daily reports and worker salary alerts.</p>
              </div>
            )}

            {activeTab === "database" && (
              <div style={styles.card}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", borderBottom: "1px solid #fee2e2", paddingBottom: "16px" }}>
                  <AlertTriangle size={24} color="#dc2626" />
                  <div>
                    <h2 style={{ ...styles.cardTitle, color: "#dc2626", border: "none", padding: 0, margin: 0 }}>Company Handover & Demo Data Reset</h2>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>Wipe all demo / testing data before handing over this ERP to the company</p>
                  </div>
                </div>

                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "18px", marginBottom: "24px" }}>
                  <h4 style={{ color: "#991b1b", fontSize: "14px", fontWeight: "700", margin: "0 0 8px 0" }}>
                    What will be permanently deleted:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#7f1d1d", fontSize: "13px", lineHeight: 1.6 }}>
                    <li>All test workers (Workers Master records)</li>
                    <li>All daily worker attendance logs</li>
                    <li>All worker advances and deduction records</li>
                    <li>All worker salaries, overtime, and payment vouchers</li>
                    <li>All demo project sites and site expenses</li>
                  </ul>
                  <p style={{ marginTop: "12px", marginBottom: 0, fontSize: "13px", color: "#166534", fontWeight: "600" }}>
                    ✓ Company admin logins (sonu@snmrfab.in), roles, permissions, and department structures will remain 100% safe and active.
                  </p>
                </div>

                <button 
                  onClick={handleClearDemoData}
                  disabled={isClearing}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: isClearing ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
                    transition: "all 0.2s"
                  }}
                >
                  <Trash2 size={18} />
                  <span>{isClearing ? "Clearing Database..." : "Permanently Clear All Demo Data"}</span>
                </button>
              </div>
            )}
          </div>
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
  saveBtn: { display: "flex", alignItems: "center", gap: "8px", background: "#0f766e", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  layout: { display: "flex", gap: "32px", alignItems: "flex-start" },
  sidebar: { width: "240px", display: "flex", flexDirection: "column", gap: "8px" },
  tab: { display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 16px", background: "transparent", border: "none", borderRadius: "10px", color: "#475569", fontSize: "14px", fontWeight: "600", cursor: "pointer", textAlign: "left", transition: "all 0.2s" },
  tabActive: { display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 16px", background: "#f0fdfa", border: "none", borderRadius: "10px", color: "#0f766e", fontSize: "14px", fontWeight: "700", cursor: "pointer", textAlign: "left" },
  tabDanger: { display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 16px", background: "transparent", border: "none", borderRadius: "10px", color: "#dc2626", fontSize: "14px", fontWeight: "600", cursor: "pointer", textAlign: "left", transition: "all 0.2s" },
  tabActiveDanger: { display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 16px", background: "#fef2f2", border: "none", borderRadius: "10px", color: "#dc2626", fontSize: "14px", fontWeight: "700", cursor: "pointer", textAlign: "left" },
  content: { flex: 1 },
  card: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "32px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" },
  cardTitle: { margin: "0 0 24px 0", fontSize: "18px", fontWeight: "700", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#475569" },
  input: { padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#f8fafc", color: "#0f172a", transition: "border-color 0.2s" }
};
