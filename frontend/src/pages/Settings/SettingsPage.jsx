import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Building2, Save, Shield, Bell } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [formData, setFormData] = useState({
    companyName: "SNMR FAB INDIA PRIVATE LIMITED",
    email: "sonu@snmrfab.in",
    phone: "+91 9876543210",
    address: "Construction HQ, India",
    gstin: "22AAAAA0000A1Z5"
  });

  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>System Settings</h1>
            <p style={styles.subtitle}>Manage your company profile and application preferences.</p>
          </div>
          <button style={styles.saveBtn}>
            <Save size={16} /> Save Changes
          </button>
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
                <p style={{color:"#64748b", fontSize:"14px"}}>Two-factor authentication and password policies will be available here.</p>
              </div>
            )}

            {activeTab === "notifications" && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Notification Preferences</h2>
                <p style={{color:"#64748b", fontSize:"14px"}}>Manage email and push notification settings for daily reports.</p>
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
  content: { flex: 1 },
  card: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "32px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" },
  cardTitle: { margin: "0 0 24px 0", fontSize: "18px", fontWeight: "700", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#475569" },
  input: { padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#f8fafc", color: "#0f172a", transition: "border-color 0.2s" }
};
