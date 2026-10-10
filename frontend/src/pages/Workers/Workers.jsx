import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { Users, Search, Plus, X, Briefcase, MapPin, IndianRupee, HardHat, Printer, UploadCloud } from "lucide-react";
import * as XLSX from 'xlsx';
import WorkerIdCard from "../../components/shared/WorkerIdCard";

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [printWorker, setPrintWorker] = useState(null);
  const fileInputRef = React.useRef(null);
  
  const [formData, setFormData] = useState({
    workerId: "",
    fullName: "",
    skillTrade: "",
    dailyWage: "",
    joiningDate: new Date().toISOString().split("T")[0],
    siteId: ""
  });

  useEffect(() => {
    fetchWorkersAndSites();
  }, []);

  const fetchWorkersAndSites = async () => {
    try {
      setLoading(true);
      const [workersRes, sitesRes] = await Promise.all([
        api.get("/snmr/workers"),
        api.get("/snmr/sites")
      ]);
      setWorkers(workersRes.data);
      setSites(sitesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        dailyWage: formData.dailyWage ? parseFloat(formData.dailyWage) : null,
      };
      // Remove siteId if empty
      if (!payload.siteId) delete payload.siteId;

      const res = await api.post("/snmr/workers", payload);
      
      // If we assigned a site, attach the site object for immediate display
      if (payload.siteId) {
        res.data.site = sites.find(s => s.id === payload.siteId);
      }
      
      setWorkers([res.data, ...workers]);
      setIsModalOpen(false);
      setFormData({
        workerId: "", fullName: "", skillTrade: "", dailyWage: "", joiningDate: new Date().toISOString().split("T")[0], siteId: ""
      });
    } catch (err) {
      console.error("Error creating worker:", err);
      alert(err.response?.data?.error || "Failed to create worker");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON objects using header names
        const rows = XLSX.utils.sheet_to_json(worksheet);
        
        const parsedWorkers = [];
        for (const row of rows) {
          const workerId = (row["Worker ID"] || row["ID"] || row["WorkerID"] || row["Emp ID"] || row["id"])?.toString() || "";
          const name = (row["Name"] || row["Full Name"] || row["Worker Name"] || row["name"])?.toString() || "";
          const siteName = (row["Site"] || row["Site Name"] || row["Location"] || row["Project"])?.toString() || "Unassigned";
          const dailyWage = parseFloat(row["Daily Wage"] || row["Wage"] || row["Basic"] || row["Rate"]) || 0;
          
          if (!workerId || !name) continue;
          
          // Match site by name
          const siteMatch = sites.find(s => s.name.toLowerCase() === siteName.toLowerCase());
          
          parsedWorkers.push({
            workerId,
            fullName: name,
            siteId: siteMatch ? siteMatch.id : null,
            siteName: siteName, // pass siteName to auto-create
            dailyWage,
            joiningDate: new Date().toISOString(),
            status: "Active"
          });
        }
        
        if (parsedWorkers.length === 0) {
          return alert("No valid worker rows found in the uploaded file.");
        }
        
        setLoading(true);
        await api.post("/snmr/workers/import", { workers: parsedWorkers });
        alert(`Successfully imported ${parsedWorkers.length} workers!`);
        fetchWorkersAndSites();
      } catch (error) {
        console.error("Import error:", error);
        alert("Failed to import workers. Please check the file format.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = ""; // reset input
      }
    };
    // Read file as ArrayBuffer for xlsx compatibility
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (printWorker) {
      setTimeout(() => {
        window.print();
        setPrintWorker(null);
      }, 500);
    }
  }, [printWorker]);

  const filteredWorkers = workers.filter(w => 
    w.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.workerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.skillTrade?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Worker Master</h1>
            <p style={styles.subtitle}>Manage labor, tradesmen, and site staff.</p>
          </div>
          <div style={styles.headerActions}>
            <div style={styles.searchContainer}>
              <Search size={18} color="#94a3b8" style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name, ID, or trade..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              style={{ display: "none" }} 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button style={{...styles.createButton, background: "#fff", color: "#334155", border: "1px solid #cbd5e1"}} onClick={() => fileInputRef.current?.click()}>
              <UploadCloud size={18} />
              <span>Import Excel/CSV</span>
            </button>
            <button style={styles.createButton} onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              <span>Add Worker</span>
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading workers...</p>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div style={styles.emptyState}>
              <HardHat size={48} color="#cbd5e1" />
              <h3 style={styles.emptyTitle}>No workers found</h3>
              <p style={styles.emptyDesc}>Add workers to start tracking their attendance and wages.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>Worker ID</th>
                    <th style={styles.th}>Full Name</th>
                    <th style={styles.th}>Trade / Role</th>
                    <th style={styles.th}>Current Site</th>
                    <th style={styles.th}>Daily Wage</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map(w => (
                    <tr key={w.id} style={styles.tr}>
                      <td style={styles.tdId}>{w.workerId}</td>
                      <td style={styles.tdName}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={styles.avatar}>
                            {w.fullName.charAt(0).toUpperCase()}
                          </div>
                          {w.fullName}
                        </div>
                      </td>
                      <td style={styles.td}>{w.skillTrade || "—"}</td>
                      <td style={styles.td}>
                        {w.site ? (
                          <span style={styles.siteChip}><MapPin size={12} /> {w.site.name}</span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>Unassigned</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {w.dailyWage ? `₹${parseFloat(w.dailyWage).toLocaleString()}` : "—"}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: w.status === "Active" ? "rgba(34, 197, 94, 0.15)" : "rgba(148, 163, 184, 0.15)",
                          color: w.status === "Active" ? "#16a34a" : "#64748b"
                        }}>
                          {w.status || "Active"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <a 
                            href={`/workers/${w.id}`}
                            style={{
                              background: "#2563eb",
                              color: "#fff",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              textDecoration: "none"
                            }}
                          >
                            Profile
                          </a>
                          <button
                            onClick={() => setPrintWorker(w)}
                            style={{
                              background: "#f1f5f9",
                              color: "#475569",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Printer size={14} /> Print ID
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {isModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Add New Worker</h2>
                <button style={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateWorker} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Worker ID *</label>
                    <input 
                      required 
                      style={styles.input} 
                      placeholder="e.g. EMP-1001" 
                      value={formData.workerId}
                      onChange={e => setFormData({...formData, workerId: e.target.value})}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Full Name *</label>
                    <input 
                      required 
                      style={styles.input} 
                      placeholder="e.g. Ramesh Kumar" 
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Skill / Trade</label>
                    <input 
                      style={styles.input} 
                      placeholder="e.g. Electrician, Mason" 
                      value={formData.skillTrade}
                      onChange={e => setFormData({...formData, skillTrade: e.target.value})}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Daily Wage (₹)</label>
                    <input 
                      type="number"
                      style={styles.input} 
                      placeholder="e.g. 800" 
                      value={formData.dailyWage}
                      onChange={e => setFormData({...formData, dailyWage: e.target.value})}
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Joining Date *</label>
                    <input 
                      type="date"
                      required 
                      style={styles.input} 
                      value={formData.joiningDate}
                      onChange={e => setFormData({...formData, joiningDate: e.target.value})}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Assign to Site</label>
                    <select 
                      style={styles.input}
                      value={formData.siteId}
                      onChange={e => setFormData({...formData, siteId: e.target.value})}
                    >
                      <option value="">-- Unassigned --</option>
                      {sites.map(site => (
                        <option key={site.id} value={site.id}>{site.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.modalActions}>
                  <button type="button" style={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Add Worker"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {printWorker && <WorkerIdCard worker={printWorker} />}
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
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
  },
  tableContainer: {
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  tableHead: {
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  th: {
    padding: "16px 24px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.2s ease",
  },
  td: {
    padding: "16px 24px",
    fontSize: "14px",
    color: "#334155",
    verticalAlign: "middle",
  },
  tdId: {
    padding: "16px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
    verticalAlign: "middle",
  },
  tdName: {
    padding: "16px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
    verticalAlign: "middle",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#e0e7ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
  },
  siteChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#f1f5f9",
    color: "#475569",
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
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
    maxWidth: "600px",
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
  formRow: {
    display: "flex",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
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
    width: "100%",
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
    background: "#2563eb",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
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
    borderTop: "3px solid #2563eb",
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
