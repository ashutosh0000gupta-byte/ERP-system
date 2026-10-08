import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { CreditCard, Search, Plus, X, Building2, HardHat, Calendar } from "lucide-react";

export default function Advances() {
  const [advances, setAdvances] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    workerId: "",
    siteId: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    reason: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [advRes, workersRes, sitesRes] = await Promise.all([
        api.get("/snmr/advances"),
        api.get("/snmr/workers"),
        api.get("/snmr/sites")
      ]);
      setAdvances(advRes.data);
      setWorkers(workersRes.data);
      setSites(sitesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      if (!payload.siteId) delete payload.siteId;
      
      const res = await api.post("/snmr/advances", payload);
      // Attach worker and site data for immediate UI rendering
      res.data.worker = workers.find(w => w.id === payload.workerId);
      res.data.site = sites.find(s => s.id === payload.siteId);
      
      setAdvances([res.data, ...advances]);
      setIsModalOpen(false);
      setFormData({ workerId: "", siteId: "", date: new Date().toISOString().split("T")[0], amount: "", reason: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to create advance record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAdvances = advances.filter(a => 
    a.worker?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.worker?.workerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.site?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Worker Advances</h1>
            <p style={styles.subtitle}>Record cash advances given to site workers.</p>
          </div>
          <div style={styles.headerActions}>
            <div style={styles.searchContainer}>
              <Search size={18} color="#94a3b8" style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by worker or site..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button style={styles.createButton} onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              <span>Give Advance</span>
            </button>
          </div>
        </div>

        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading records...</p>
            </div>
          ) : filteredAdvances.length === 0 ? (
            <div style={styles.emptyState}>
              <CreditCard size={48} color="#cbd5e1" />
              <h3 style={styles.emptyTitle}>No advances recorded</h3>
              <p style={styles.emptyDesc}>When you give cash advance to a worker, it will appear here.</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Worker</th>
                  <th style={styles.th}>Site</th>
                  <th style={styles.th}>Amount (₹)</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdvances.map(a => (
                  <tr key={a.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b" }}>
                        <Calendar size={14} /> 
                        {new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={styles.avatar}>{a.worker?.fullName.charAt(0) || '?'}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{a.worker?.fullName || 'Unknown'}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{a.worker?.workerId || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      {a.site ? <span style={styles.siteChip}><Building2 size={12} /> {a.site.name}</span> : "—"}
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "15px" }}>₹{Number(a.amount).toLocaleString()}</span>
                    </td>
                    <td style={styles.td}>
                      {a.isDeducted ? (
                        <span style={styles.statusDeducted}>Deducted</span>
                      ) : (
                        <span style={styles.statusPending}>Pending Deduction</span>
                      )}
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
                <h2 style={styles.modalTitle}>Record Advance Payment</h2>
                <button style={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreate} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Select Worker *</label>
                  <select 
                    required
                    style={styles.input}
                    value={formData.workerId}
                    onChange={e => {
                      const wId = e.target.value;
                      const worker = workers.find(w => w.id === wId);
                      setFormData({...formData, workerId: wId, siteId: worker?.siteId || ""});
                    }}
                  >
                    <option value="" disabled>-- Select Worker --</option>
                    {workers.map(w => <option key={w.id} value={w.id}>{w.fullName} ({w.workerId})</option>)}
                  </select>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Date *</label>
                    <input 
                      type="date"
                      required 
                      style={styles.input} 
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Amount (₹) *</label>
                    <input 
                      type="number"
                      required 
                      style={styles.input} 
                      placeholder="e.g. 500" 
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Site (Optional)</label>
                  <select 
                    style={styles.input}
                    value={formData.siteId || ""}
                    onChange={e => setFormData({...formData, siteId: e.target.value})}
                  >
                    <option value="">-- No specific site --</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Reason / Remarks</label>
                  <input 
                    style={styles.input} 
                    placeholder="e.g. Medical emergency" 
                    value={formData.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                  />
                </div>

                <div style={styles.modalActions}>
                  <button type="button" style={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Record Advance"}
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
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "32px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "15px", color: "#64748b", margin: 0 },
  headerActions: { display: "flex", gap: "16px", alignItems: "center" },
  searchContainer: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "14px" },
  searchInput: { padding: "12px 16px 12px 42px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px", width: "260px", outline: "none", background: "#fff" },
  createButton: { display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(225, 29, 72, 0.25)" },
  tableCard: { background: "#fff", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  tableHead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "16px 24px", fontSize: "13px", fontWeight: "600", color: "#475569", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.2s ease" },
  td: { padding: "16px 24px", verticalAlign: "middle" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#fef2f2", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "700" },
  siteChip: { display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "8px", fontSize: "13px", fontWeight: "500" },
  statusPending: { background: "#fef3c7", color: "#92400e", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  statusDeducted: { background: "#dcfce7", color: "#166534", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", animation: "slideUp 0.3s ease-out forwards" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  modalTitle: { margin: 0, fontSize: "22px", fontWeight: "700", color: "#0f172a" },
  closeButton: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  formRow: { display: "flex", gap: "16px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  label: { fontSize: "14px", fontWeight: "600", color: "#334155" },
  input: { padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", outline: "none", background: "#f8fafc", width: "100%" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" },
  cancelButton: { padding: "12px 20px", background: "none", border: "none", color: "#64748b", fontWeight: "600", cursor: "pointer" },
  submitButton: { padding: "12px 24px", background: "#e11d48", border: "none", borderRadius: "12px", color: "#fff", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(225, 29, 72, 0.2)" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", color: "#64748b" },
  spinner: { width: "30px", height: "30px", border: "3px solid #f1f5f9", borderTop: "3px solid #e11d48", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "16px" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#334155", margin: "16px 0 8px 0" },
  emptyDesc: { color: "#64748b", margin: 0 }
};
