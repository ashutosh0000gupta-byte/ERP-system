import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { FileText, Upload, Filter, Search, Plus, Trash2, Eye } from "lucide-react";

export default function DocumentsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState("All");

  const [formData, setFormData] = useState({
    title: "",
    type: "Aadhar",
    entityType: "Worker",
    entityId: "",
    url: "https://example.com/dummy-doc.pdf"
  });

  useEffect(() => {
    fetchDocuments();
  }, [filterType]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const url = filterType === "All" ? "/snmr/documents" : `/snmr/documents?entityType=${filterType}`;
      const res = await api.get(url);
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      if (!formData.title || !formData.entityId) return alert("Please fill all required fields");
      await api.post("/snmr/documents", formData);
      setShowModal(false);
      setFormData({ title: "", type: "Aadhar", entityType: "Worker", entityId: "", url: "https://example.com/dummy-doc.pdf" });
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Document Management</h1>
            <p style={styles.subtitle}>Store and manage worker IDs, site blueprints, and contracts.</p>
          </div>
          <button style={styles.uploadBtn} onClick={() => setShowModal(true)}>
            <Upload size={16} /> Upload Document
          </button>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.filterGroup}>
            <button 
              style={filterType === "All" ? styles.filterBtnActive : styles.filterBtn}
              onClick={() => setFilterType("All")}
            >All</button>
            <button 
              style={filterType === "Worker" ? styles.filterBtnActive : styles.filterBtn}
              onClick={() => setFilterType("Worker")}
            >Worker Docs</button>
            <button 
              style={filterType === "Site" ? styles.filterBtnActive : styles.filterBtn}
              onClick={() => setFilterType("Site")}
            >Site Docs</button>
          </div>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input type="text" placeholder="Search documents..." style={styles.searchInput} />
          </div>
        </div>

        <div style={styles.grid}>
          {loading ? (
            <div style={styles.emptyState}>Loading documents...</div>
          ) : documents.length === 0 ? (
            <div style={styles.emptyState}>
              <FileText size={48} color="#cbd5e1" />
              <h3>No documents found</h3>
              <p>Click upload to add your first document.</p>
            </div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} style={styles.card}>
                <div style={styles.cardIcon}>
                  <FileText size={24} color="#0f766e" />
                </div>
                <div style={styles.cardInfo}>
                  <h4 style={styles.cardTitle}>{doc.title}</h4>
                  <p style={styles.cardMeta}>{doc.type} • {doc.entityType}</p>
                  <p style={styles.cardDate}>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={styles.cardActions}>
                  <button style={styles.actionBtn}><Eye size={16} /></button>
                  <button style={{...styles.actionBtn, color: "#ef4444"}}><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upload Modal */}
        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>Upload Document</h2>
              <form onSubmit={handleUpload} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Document Title</label>
                  <input style={styles.input} required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Ramesh Aadhar Card" />
                </div>
                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Entity Type</label>
                    <select style={styles.input} value={formData.entityType} onChange={e => setFormData({...formData, entityType: e.target.value})}>
                      <option value="Worker">Worker</option>
                      <option value="Site">Site</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Document Type</label>
                    <select style={styles.input} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="Aadhar">Aadhar Card</option>
                      <option value="PAN">PAN Card</option>
                      <option value="Blueprint">Site Blueprint</option>
                      <option value="Contract">Contract</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Entity ID (Worker/Site ID)</label>
                  <input style={styles.input} required value={formData.entityId} onChange={e => setFormData({...formData, entityId: e.target.value})} placeholder="Enter UUID" />
                </div>
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                  <button type="submit" style={styles.submitBtn}>Upload</button>
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
  uploadBtn: { display: "flex", alignItems: "center", gap: "8px", background: "#0f766e", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  toolbar: { display: "flex", justifyContent: "space-between", marginBottom: "24px" },
  filterGroup: { display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "10px" },
  filterBtn: { padding: "8px 16px", border: "none", background: "transparent", color: "#64748b", fontWeight: "600", fontSize: "13px", borderRadius: "6px", cursor: "pointer" },
  filterBtnActive: { padding: "8px 16px", border: "none", background: "#fff", color: "#0f766e", fontWeight: "700", fontSize: "13px", borderRadius: "6px", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  searchBox: { display: "flex", alignItems: "center", gap: "8px", background: "#fff", border: "1px solid #cbd5e1", padding: "0 12px", borderRadius: "10px", width: "260px" },
  searchInput: { border: "none", outline: "none", fontSize: "14px", width: "100%", background: "transparent" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" },
  card: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", gap: "16px", alignItems: "flex-start", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" },
  cardIcon: { width: "48px", height: "48px", background: "#f0fdfa", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardInfo: { flex: 1 },
  cardTitle: { margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", color: "#0f172a" },
  cardMeta: { margin: "0 0 6px 0", fontSize: "12px", fontWeight: "600", color: "#64748b" },
  cardDate: { margin: 0, fontSize: "11px", color: "#94a3b8" },
  cardActions: { display: "flex", flexDirection: "column", gap: "8px" },
  actionBtn: { background: "#f8fafc", border: "1px solid #e2e8f0", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569" },
  emptyState: { gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "#64748b" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal: { background: "#fff", padding: "32px", borderRadius: "24px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" },
  modalTitle: { margin: "0 0 24px 0", fontSize: "20px", fontWeight: "800", color: "#0f172a" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  row: { display: "flex", gap: "16px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#475569" },
  input: { padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#f8fafc" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" },
  cancelBtn: { padding: "10px 20px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: "600", cursor: "pointer" },
  submitBtn: { padding: "10px 20px", borderRadius: "10px", border: "none", background: "#0f766e", color: "#fff", fontWeight: "600", cursor: "pointer" }
};
