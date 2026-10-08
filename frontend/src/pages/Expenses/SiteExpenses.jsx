import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { Receipt, Search, Plus, X, Calendar, MapPin, IndianRupee } from "lucide-react";

export default function SiteExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    siteId: "",
    date: new Date().toISOString().split("T")[0],
    category: "Material",
    amount: "",
    description: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, sitesRes] = await Promise.all([
        api.get("/snmr/expenses"),
        api.get("/snmr/sites")
      ]);
      setExpenses(expRes.data);
      setSites(sitesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      await api.post("/snmr/expenses", payload);
      setIsModalOpen(false);
      fetchData();
      setFormData({
        siteId: "",
        date: new Date().toISOString().split("T")[0],
        category: "Material",
        amount: "",
        description: ""
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ["Material", "Transport", "Petty Cash", "Food", "Other"];

  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Site Expenses</h1>
            <p style={styles.subtitle}>Track material and petty cash expenses per site.</p>
          </div>
          <button style={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Record Expense
          </button>
        </div>

        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div style={styles.emptyState}>
              <Receipt size={48} color="#cbd5e1" />
              <h3 style={styles.emptyTitle}>No Expenses Recorded</h3>
              <p style={styles.emptyDesc}>Click "Record Expense" to add your first entry.</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Site</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} style={styles.tr}>
                    <td style={styles.td}>{new Date(e.date).toLocaleDateString('en-GB')}</td>
                    <td style={styles.td}>
                      <span style={styles.siteChip}><MapPin size={12} /> {e.site?.name || "Unassigned"}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: e.category === "Material" ? "#e0f2fe" : 
                                    e.category === "Petty Cash" ? "#fef3c7" : "#f1f5f9",
                        color: e.category === "Material" ? "#0284c7" : 
                               e.category === "Petty Cash" ? "#d97706" : "#475569"
                      }}>
                        {e.category}
                      </span>
                    </td>
                    <td style={styles.td}>{e.description || "—"}</td>
                    <td style={{ ...styles.td, fontWeight: 700, color: "#e11d48" }}>
                      ₹{parseFloat(e.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Record Site Expense</h2>
                <button style={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateExpense} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Site *</label>
                    <select required style={styles.input} value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})}>
                      <option value="" disabled>Select Site</option>
                      {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Date *</label>
                    <input type="date" required style={styles.input} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Category *</label>
                    <select required style={styles.input} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Amount (₹) *</label>
                    <input type="number" required min="1" step="0.01" style={styles.input} placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea style={styles.textarea} placeholder="e.g. Cement bags, Sand" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div style={styles.modalActions}>
                  <button type="button" style={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Expense"}
                  </button>
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
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "32px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "15px", color: "#64748b", margin: 0 },
  addBtn: { display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)", transition: "all 0.2s" },
  tableCard: { background: "#fff", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  tableHead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "16px 24px", fontSize: "13px", fontWeight: "600", color: "#475569", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.2s ease" },
  td: { padding: "16px 24px", verticalAlign: "middle", fontSize: "14px", color: "#334155" },
  siteChip: { display: "inline-flex", alignItems: "center", gap: "4px", background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" },
  statusBadge: { padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  modal: { background: "#fff", width: "100%", maxWidth: "500px", borderRadius: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", overflow: "hidden" },
  modalHeader: { padding: "24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { margin: 0, fontSize: "20px", fontWeight: "700", color: "#0f172a" },
  closeButton: { background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" },
  form: { padding: "24px", display: "flex", flexDirection: "column", gap: "20px" },
  formRow: { display: "flex", gap: "16px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  label: { fontSize: "14px", fontWeight: "600", color: "#475569" },
  input: { padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none", background: "#f8fafc", transition: "border 0.2s" },
  textarea: { padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none", background: "#f8fafc", minHeight: "80px", resize: "vertical" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" },
  cancelButton: { padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", color: "#64748b", background: "#f1f5f9", border: "none", cursor: "pointer" },
  submitButton: { padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", color: "#fff", background: "#0f766e", border: "none", cursor: "pointer" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", color: "#64748b" },
  spinner: { width: "30px", height: "30px", border: "3px solid #f1f5f9", borderTop: "3px solid #0f766e", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "16px" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#334155", margin: "16px 0 8px 0" },
  emptyDesc: { color: "#64748b", margin: 0 }
};
