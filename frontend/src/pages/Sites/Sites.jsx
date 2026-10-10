import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { Building2, MapPin, Search, Plus, X, Briefcase, Activity } from "lucide-react";

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", location: "", client: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewSite, setViewSite] = useState(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await api.get("/snmr/sites");
      setSites(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSite = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post("/snmr/sites", formData);
      setSites([res.data, ...sites]);
      setIsModalOpen(false);
      setFormData({ name: "", location: "", client: "" });
    } catch (err) {
      console.error("Error creating site:", err);
      alert("Failed to create site");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSite = async (id) => {
    if (!window.confirm("Are you sure you want to delete this site? All related workers might be affected.")) return;
    try {
      await api.delete(`/snmr/sites/${id}`);
      setSites(sites.filter(s => s.id !== id));
    } catch (err) {
      alert("Failed to delete site");
    }
  };

  const filteredSites = sites.filter(site => 
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    site.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Project Sites</h1>
            <p style={styles.subtitle}>Manage all active and past construction projects.</p>
          </div>
          <div style={styles.headerActions}>
            <div style={styles.searchContainer}>
              <Search size={18} color="#94a3b8" style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search sites..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button style={styles.createButton} onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              <span>Create Site</span>
            </button>
          </div>
        </div>

        {/* Sites Grid */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading projects...</p>
          </div>
        ) : filteredSites.length === 0 ? (
          <div style={styles.emptyState}>
            <Building2 size={48} color="#cbd5e1" />
            <h3 style={styles.emptyTitle}>No sites found</h3>
            <p style={styles.emptyDesc}>Get started by creating your first construction site.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredSites.map((site) => (
              <div key={site.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.cardIconBox}>
                    <Building2 size={24} color="#0ea5e9" />
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    background: site.status === "Active" ? "rgba(34, 197, 94, 0.15)" : "rgba(148, 163, 184, 0.15)",
                    color: site.status === "Active" ? "#16a34a" : "#64748b"
                  }}>
                    {site.status || "Active"}
                  </span>
                </div>
                
                <h3 style={styles.cardTitle}>{site.name}</h3>
                
                <div style={styles.cardDetails}>
                  <div style={styles.detailRow}>
                    <MapPin size={16} color="#94a3b8" />
                    <span>{site.location}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <Briefcase size={16} color="#94a3b8" />
                    <span>{site.client || "No Client Specified"}</span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <button style={styles.viewButton} onClick={() => setViewSite(site)}>View Details</button>
                  <button style={{...styles.viewButton, background: "#fee2e2", color: "#991b1b", marginLeft: "10px"}} onClick={() => handleDeleteSite(site.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Modal */}
        {viewSite && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Site Details</h2>
                <button style={styles.closeButton} onClick={() => setViewSite(null)}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ padding: "24px" }}>
                <p><strong>Site ID:</strong> {viewSite.siteId}</p>
                <p><strong>Name:</strong> {viewSite.name}</p>
                <p><strong>Location:</strong> {viewSite.location}</p>
                <p><strong>Client:</strong> {viewSite.client || "Not Specified"}</p>
                <p><strong>Status:</strong> {viewSite.status || "Active"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {isModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Create New Site</h2>
                <button style={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateSite} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Site Name</label>
                  <input 
                    required 
                    style={styles.input} 
                    placeholder="e.g. DLF Phase 3 Expansion" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Location</label>
                  <input 
                    required 
                    style={styles.input} 
                    placeholder="e.g. Gurugram, Haryana" 
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Client Name</label>
                  <input 
                    required 
                    style={styles.input} 
                    placeholder="e.g. L&T Constructions" 
                    value={formData.client}
                    onChange={e => setFormData({...formData, client: e.target.value})}
                  />
                </div>

                <div style={styles.modalActions}>
                  <button type="button" style={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Site"}
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
  container: {
    padding: "32px",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  searchContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
  },
  searchInput: {
    padding: "12px 16px 12px 42px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    fontSize: "14px",
    width: "280px",
    outline: "none",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  createButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 4px 12px rgba(15, 118, 110, 0.25)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  cardIconBox: {
    background: "#f0f9ff",
    padding: "12px",
    borderRadius: "14px",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 16px 0",
  },
  cardDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
  },
  detailRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#475569",
  },
  cardFooter: {
    marginTop: "auto",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
  },
  viewButton: {
    width: "100%",
    padding: "10px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    color: "#0f766e",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: "24px",
    padding: "32px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    animation: "slideUp 0.3s ease-out forwards",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  modalTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    transition: "background 0.2s ease",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s ease",
    background: "#f8fafc",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "12px",
  },
  cancelButton: {
    padding: "12px 20px",
    background: "none",
    border: "none",
    color: "#64748b",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitButton: {
    padding: "12px 24px",
    background: "#0f766e",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(15, 118, 110, 0.2)",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 0",
    color: "#64748b",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f1f5f9",
    borderTop: "3px solid #0f766e",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 0",
    background: "#fff",
    borderRadius: "24px",
    border: "1px dashed #cbd5e1",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#334155",
    margin: "16px 0 8px 0",
  },
  emptyDesc: {
    color: "#64748b",
    margin: 0,
  }
};
