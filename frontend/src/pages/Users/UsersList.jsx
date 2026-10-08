import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { Users, Shield, Plus, Lock, Mail, Trash2 } from "lucide-react";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    roleName: "SUPERVISOR"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/snmr/users");
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Send dummy hash for demo, real implementation uses bcrypt on backend
      await api.post("/snmr/users", { ...formData, passwordHash: formData.password });
      setShowModal(false);
      setFormData({ email: "", password: "", roleName: "SUPERVISOR" });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Users & Roles</h1>
            <p style={styles.subtitle}>Manage system access for Admins and Site Supervisors.</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add User
          </button>
        </div>

        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.emptyState}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={styles.emptyState}>No users found.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={styles.avatar}>
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{user.email}</div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.roleBadge,
                        background: user.role?.name === "ADMIN" ? "#fee2e2" : "#f0f9ff",
                        color: user.role?.name === "ADMIN" ? "#991b1b" : "#0369a1"
                      }}>
                        {user.role?.name || "SUPERVISOR"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {user.isActive ? (
                        <span style={{ color: "#16a34a", fontWeight: "600", fontSize: "13px" }}>● Active</span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontWeight: "600", fontSize: "13px" }}>● Inactive</span>
                      )}
                    </td>
                    <td style={styles.td} style={{ color: "#64748b", fontSize: "13px" }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <button style={styles.iconBtn}><Lock size={16} /></button>
                      <button style={{...styles.iconBtn, color: "#ef4444"}}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>Add New User</h2>
              <form onSubmit={handleCreate} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <div style={styles.inputWrapper}>
                    <Mail size={16} color="#94a3b8" />
                    <input type="email" required style={styles.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="supervisor@snmrfab.in" />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <div style={styles.inputWrapper}>
                    <Lock size={16} color="#94a3b8" />
                    <input type="password" required style={styles.input} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Set initial password" />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Role</label>
                  <select style={{...styles.input, padding: "10px 14px"}} value={formData.roleName} onChange={e => setFormData({...formData, roleName: e.target.value})}>
                    <option value="SUPERVISOR">Site Supervisor (Limited Access)</option>
                    <option value="ADMIN">Admin (Full Access)</option>
                  </select>
                </div>
                
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                  <button type="submit" style={styles.submitBtn}>Create User</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

const styles = {
  container: { padding: "32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  title: { fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "15px", color: "#64748b", margin: 0 },
  addBtn: { display: "flex", alignItems: "center", gap: "8px", background: "#0f766e", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  tableCard: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#f8fafc", padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: "700", color: "#475569", borderBottom: "1px solid #e2e8f0", textTransform: "uppercase", letterSpacing: "0.5px" },
  tr: { borderBottom: "1px solid #e2e8f0" },
  td: { padding: "16px 20px", fontSize: "14px", verticalAlign: "middle" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#f1f5f9", color: "#0f766e", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px" },
  roleBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  iconBtn: { background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: "4px", margin: "0 4px" },
  emptyState: { textAlign: "center", padding: "60px", color: "#64748b" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal: { background: "#fff", padding: "32px", borderRadius: "24px", width: "100%", maxWidth: "450px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" },
  modalTitle: { margin: "0 0 24px 0", fontSize: "20px", fontWeight: "800", color: "#0f172a" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#475569" },
  inputWrapper: { display: "flex", alignItems: "center", gap: "10px", padding: "0 14px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc" },
  input: { flex: 1, padding: "10px 0", border: "none", fontSize: "14px", outline: "none", background: "transparent" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" },
  cancelBtn: { padding: "10px 20px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: "600", cursor: "pointer" },
  submitBtn: { padding: "10px 20px", borderRadius: "10px", border: "none", background: "#0f766e", color: "#fff", fontWeight: "600", cursor: "pointer" }
};
