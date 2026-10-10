import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { 
  User, Phone, MapPin, Calendar, Clock, CreditCard, ChevronLeft, 
  Building2, FileText, Upload, Trash2, BookOpen, AlertCircle, 
  CheckCircle, DollarSign, Wallet
} from "lucide-react";

export default function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [sites, setSites] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = React.useRef(null);
  const [docType, setDocType] = useState("Aadhaar");
  
  // Edit Details State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Worker Ledger Modal State
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [ledgerData, setLedgerData] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  const fetchWorker = () => {
    setLoading(true);
    api.get(`/snmr/workers/${id}`)
      .then(res => setWorker(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
    
    // Fetch Documents
    api.get(`/snmr/documents?entityId=${id}&entityType=Worker`)
      .then(res => setDocuments(res.data))
      .catch(console.error);

    api.get("/snmr/sites")
      .then(res => setSites(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchWorker();
  }, [id]);

  const fetchLedger = async () => {
    setIsLedgerOpen(true);
    setLoadingLedger(true);
    try {
      const res = await api.get(`/snmr/workers/${id}/ledger`);
      setLedgerData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load worker ledger");
    } finally {
      setLoadingLedger(false);
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put(`/snmr/workers/${id}`, editData);
      fetchWorker();
      setIsEditModalOpen(false);
    } catch (err) {
      alert("Failed to update details");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = () => {
    setEditData({
      fullName: worker.fullName || "",
      mobileNumber: worker.mobileNumber || "",
      currentAddress: worker.currentAddress || "",
      siteId: worker.siteId || "",
      salaryType: worker.salaryType || "Daily",
      wageRate: worker.wageRate || worker.dailyWage || 0,
      dailyWage: worker.dailyWage || 0,
      paymentFrequency: worker.paymentFrequency || "Monthly",
      otRatePerHour: worker.otRatePerHour || 0,
      paymentMethod: worker.paymentMethod || "Bank Transfer",
      paymentDay: worker.paymentDay || "",
      bankName: worker.bankName || "",
      bankAccount: worker.bankAccount || "",
      ifsc: worker.ifsc || "",
      pan: worker.pan || "",
      aadhaar: worker.aadhaar || ""
    });
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async () => {
    const newStatus = worker.status === "Active" ? "Inactive" : "Active";
    let exitReason = null;
    
    if (newStatus === "Inactive") {
      exitReason = window.prompt("Reason for deactivation/leaving (optional):");
      if (exitReason === null) return;
    }
    
    try {
      await api.put(`/snmr/workers/${id}/status`, { status: newStatus, exitReason });
      fetchWorker();
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const payload = {
        title: file.name,
        type: docType,
        url: URL.createObjectURL(file),
        entityType: "Worker",
        entityId: id,
        uploadedBy: "Admin"
      };
      
      const res = await api.post("/snmr/documents", payload);
      setDocuments([res.data, ...documents]);
    } catch (err) {
      alert("Failed to upload document");
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api.delete(`/snmr/documents/${docId}`);
      setDocuments(documents.filter(d => d.id !== docId));
    } catch (err) {
      alert("Failed to delete document");
    }
  };

  // Aggregate stats
  const totalAdvances = (worker.advances || []).reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalDeducted = (worker.advances || []).filter(a => a.isDeducted).reduce((acc, curr) => acc + Number(curr.amount), 0);
  const pendingAdvance = totalAdvances - totalDeducted;

  const totalEarned = (worker.salaries || []).reduce((acc, curr) => acc + Number(curr.netAmount), 0);
  const totalPaid = (worker.salaries || []).reduce((acc, curr) => acc + Number(curr.paidAmount || (curr.status === 'Paid' ? curr.netAmount : 0)), 0);
  const pendingSalaryBalance = (worker.salaries || []).reduce((acc, curr) => {
    const bal = curr.balanceAmount !== undefined ? Number(curr.balanceAmount) : Math.max(0, Number(curr.netAmount) - Number(curr.paidAmount || 0));
    return acc + bal;
  }, 0);

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
                <span style={{ ...styles.badgeID, background: "#ede9fe", color: "#6d28d9", borderColor: "#ddd6fe" }}>
                  {worker.category || "Worker"}
                </span>
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button 
                style={{ background: "#0f766e", color: "#fff", border: "none", fontWeight: "600", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }} 
                onClick={fetchLedger}
              >
                <BookOpen size={15} /> Hisab-Kitab (Ledger)
              </button>
              <button 
                style={{ background: "#2563eb", color: "#fff", border: "none", fontWeight: "600", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }} 
                onClick={openEditModal}
              >
                Edit Details
              </button>
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
              <span>{worker.mobileNumber || "No phone provided"}</span>
            </div>
            <div style={styles.contactItem}>
              <MapPin size={16} color="#64748b" />
              <span>{worker.currentAddress || "No address provided"}</span>
            </div>
            <div style={styles.contactItem}>
              <User size={16} color="#64748b" />
              <span>Joined {new Date(worker.joiningDate).toLocaleDateString()}</span>
            </div>
            <div style={styles.contactItem}>
              <Building2 size={16} color="#64748b" />
              <span>Trade: <strong>{worker.skillTrade || "General Labor"}</strong></span>
            </div>
          </div>

          {/* Salary Settings Bar */}
          <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "700", color: "#334155", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Salary & Wage Configuration
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "#64748b" }}>Salary Type: </span>
                <strong style={{ color: "#0369a1" }}>{worker.salaryType || "Daily Wage"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Wage Rate: </span>
                <strong style={{ color: "#0f172a" }}>₹{Number(worker.wageRate || worker.dailyWage || 0).toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Pay Frequency: </span>
                <strong style={{ color: "#7c3aed" }}>{worker.paymentFrequency || "Monthly"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Overtime Rate: </span>
                <strong style={{ color: "#0f172a" }}>₹{Number(worker.otRatePerHour || 0)} / hr</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Payout Mode: </span>
                <strong style={{ color: "#0f172a" }}>{worker.paymentMethod || "Bank Transfer"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Payment Day: </span>
                <strong style={{ color: "#0f172a" }}>{worker.paymentDay || "Standard"}</strong>
              </div>
            </div>
          </div>

          {/* Bank Details Grid */}
          <div style={styles.contactGrid}>
            <div style={styles.contactItem}>
              <span style={{color: "#64748b", width: "100px"}}>Bank Name:</span>
              <strong style={{color: "#0f172a"}}>{worker.bankName || "Not Provided"}</strong>
            </div>
            <div style={styles.contactItem}>
              <span style={{color: "#64748b", width: "100px"}}>Bank A/C:</span>
              <strong style={{color: "#0f172a"}}>{worker.bankAccount || "Not Provided"}</strong>
            </div>
            <div style={styles.contactItem}>
              <span style={{color: "#64748b", width: "100px"}}>IFSC Code:</span>
              <strong style={{color: "#0f172a"}}>{worker.ifsc || "Not Provided"}</strong>
            </div>
            <div style={styles.contactItem}>
              <span style={{color: "#64748b", width: "100px"}}>PAN:</span>
              <strong style={{color: "#0f172a"}}>{worker.pan || "Not Provided"}</strong>
            </div>
            <div style={styles.contactItem}>
              <span style={{color: "#64748b", width: "100px"}}>Aadhaar:</span>
              <strong style={{color: "#0f172a"}}>{worker.aadhaar || "Not Provided"}</strong>
            </div>
          </div>
        </div>

        {/* Quick Financial Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Pending Advance</p>
            <h3 style={{ ...styles.statValue, color: "#e11d48" }}>₹{pendingAdvance.toLocaleString()}</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#64748b" }}>Total taken: ₹{totalAdvances.toLocaleString()}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Wages Earned</p>
            <h3 style={styles.statValue}>₹{totalEarned.toLocaleString()}</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#64748b" }}>Net earnings to date</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Paid (Disbursed)</p>
            <h3 style={{ ...styles.statValue, color: "#16a34a" }}>₹{totalPaid.toLocaleString()}</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#64748b" }}>Transferred to worker</p>
          </div>
          <div style={{ ...styles.statCard, borderLeft: pendingSalaryBalance > 0 ? "4px solid #f59e0b" : "1px solid #f1f5f9" }}>
            <p style={styles.statLabel}>Outstanding Pending</p>
            <h3 style={{ ...styles.statValue, color: pendingSalaryBalance > 0 ? "#d97706" : "#0f172a" }}>
              ₹{pendingSalaryBalance.toLocaleString()}
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#64748b" }}>Unpaid salary balance</p>
          </div>
        </div>

        {/* Documents Section */}
        <div style={styles.documentsCard}>
          <div style={styles.docHeader}>
            <h3 style={styles.listTitle}><FileText size={18} /> Documents & KYC</h3>
            <div style={{ display: "flex", gap: "10px", paddingRight: "20px" }}>
              <select style={styles.docSelect} value={docType} onChange={e => setDocType(e.target.value)}>
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Photo">Passport Photo</option>
                <option value="Bank Passbook">Bank Passbook</option>
                <option value="Other">Other</option>
              </select>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              <button style={styles.uploadBtn} onClick={() => fileInputRef.current?.click()} disabled={uploadingDoc}>
                <Upload size={14} /> {uploadingDoc ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          </div>
          
          <div style={{ padding: "20px" }}>
            {documents.length === 0 ? (
              <p style={styles.empty}>No documents uploaded yet.</p>
            ) : (
              <div style={styles.docGrid}>
                {documents.map(doc => (
                  <div key={doc.id} style={styles.docItem}>
                    <div style={styles.docIcon}><FileText size={24} color="#2563eb" /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "#0f172a" }}>{doc.type}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{doc.title}</div>
                    </div>
                    <button style={styles.delBtn} onClick={() => handleDeleteDoc(doc.id)}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
            <div style={{ background: "#fff", padding: "32px", borderRadius: "20px", width: "100%", maxWidth: "650px", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", color: "#0f172a" }}>Edit Worker & Salary Details</h2>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>Update personal details, wage rates, and payout preferences.</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "24px", color: "#94a3b8" }}>&times;</button>
              </div>

              <form onSubmit={handleEditSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Current Site (Move Worker)</label>
                    <select 
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} 
                      value={editData.siteId} 
                      onChange={e => setEditData({...editData, siteId: e.target.value})}
                    >
                      <option value="">No Site Assigned</option>
                      {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.location})</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Full Name *</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editData.fullName} onChange={e => setEditData({...editData, fullName: e.target.value})} required />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Phone Number</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editData.mobileNumber} onChange={e => setEditData({...editData, mobileNumber: e.target.value})} />
                  </div>
                </div>

                {/* Salary Settings Section in Edit */}
                <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#0f766e" }}>Salary & Wage Settings</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Salary Calculation Type</label>
                      <select 
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} 
                        value={editData.salaryType} 
                        onChange={e => setEditData({...editData, salaryType: e.target.value})}
                      >
                        <option value="Daily">Daily Wage (Per working day)</option>
                        <option value="Weekly">Weekly Wage (Per week)</option>
                        <option value="Monthly">Monthly Salary (Fixed monthly)</option>
                        <option value="Hourly">Hourly Wage (Per hour)</option>
                        <option value="Contract">Contract-Based Payment (Fixed contract)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Wage / Salary Rate (₹)</label>
                      <input 
                        type="number" 
                        step="any"
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} 
                        value={editData.wageRate} 
                        onChange={e => setEditData({...editData, wageRate: Number(e.target.value), dailyWage: Number(e.target.value)})} 
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginTop: "12px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Payment Frequency</label>
                      <select 
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} 
                        value={editData.paymentFrequency} 
                        onChange={e => setEditData({...editData, paymentFrequency: e.target.value})}
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Biweekly">Biweekly (Every 2 weeks)</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Custom">Custom Period</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Overtime Rate (₹/hr)</label>
                      <input 
                        type="number" 
                        step="any"
                        placeholder="Auto if 0"
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} 
                        value={editData.otRatePerHour} 
                        onChange={e => setEditData({...editData, otRatePerHour: Number(e.target.value)})} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Payment Method</label>
                      <select 
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} 
                        value={editData.paymentMethod} 
                        onChange={e => setEditData({...editData, paymentMethod: e.target.value})}
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Payment Day (Optional)</label>
                    <input 
                      placeholder="e.g. Every Saturday, 1st of every month" 
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} 
                      value={editData.paymentDay || ""} 
                      onChange={e => setEditData({...editData, paymentDay: e.target.value})} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Address</label>
                  <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editData.currentAddress} onChange={e => setEditData({...editData, currentAddress: e.target.value})} />
                </div>

                {/* Bank Info */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Bank Name</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} placeholder="e.g. SBI" value={editData.bankName} onChange={e => setEditData({...editData, bankName: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Bank A/C</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editData.bankAccount} onChange={e => setEditData({...editData, bankAccount: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>IFSC Code</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editData.ifsc} onChange={e => setEditData({...editData, ifsc: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>PAN Number</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editData.pan} onChange={e => setEditData({...editData, pan: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Aadhaar Number</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editData.aadhaar} onChange={e => setEditData({...editData, aadhaar: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ background: "#f1f5f9", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
                  <button type="submit" style={{ background: "#2563eb", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600" }} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Details"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Worker Ledger Modal */}
        {isLedgerOpen && (
          <div style={styles.modalOverlay}>
            <div style={{ ...styles.modalContent, maxWidth: "850px" }}>
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0" }}>
                    Worker Ledger (Hisab-Kitab)
                  </h2>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                    {worker.fullName} ({worker.workerId}) • {worker.site?.name || "Unassigned"}
                  </p>
                </div>
                <button onClick={() => setIsLedgerOpen(false)} style={styles.closeBtn}>&times;</button>
              </div>

              {loadingLedger ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.spinner}></div>
                  <p>Loading worker financial statement...</p>
                </div>
              ) : ledgerData ? (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
                    <div style={styles.miniCard}>
                      <div style={styles.miniLabel}>Total Salary Earned</div>
                      <div style={styles.miniValue}>₹{ledgerData.summary.totalEarned.toLocaleString()}</div>
                    </div>
                    <div style={styles.miniCard}>
                      <div style={styles.miniLabel}>Total Disbursed</div>
                      <div style={{ ...styles.miniValue, color: "#16a34a" }}>₹{ledgerData.summary.totalPaid.toLocaleString()}</div>
                    </div>
                    <div style={{ ...styles.miniCard, background: ledgerData.summary.pendingSalaryBalance > 0 ? "#fef3c7" : "#f8fafc" }}>
                      <div style={{ ...styles.miniLabel, color: "#92400e" }}>Pending Balance</div>
                      <div style={{ ...styles.miniValue, color: "#b45309" }}>₹{ledgerData.summary.pendingSalaryBalance.toLocaleString()}</div>
                    </div>
                    <div style={styles.miniCard}>
                      <div style={styles.miniLabel}>Active Advances</div>
                      <div style={{ ...styles.miniValue, color: "#e11d48" }}>₹{ledgerData.summary.pendingAdvances.toLocaleString()}</div>
                    </div>
                  </div>

                  <div style={{ maxHeight: "360px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHead}>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Type</th>
                          <th style={styles.th}>Particulars</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>Earned (Cr)</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>Paid (Dr)</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerData.ledger.length === 0 ? (
                          <tr><td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>No ledger entries</td></tr>
                        ) : (
                          ledgerData.ledger.map(t => (
                            <tr key={t.id} style={styles.tr}>
                              <td style={styles.tdSmall}>{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                              <td style={styles.tdSmall}>
                                <span style={{
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  background: t.type === 'SALARY_CREDIT' ? '#dcfce7' : t.type === 'PAYMENT' ? '#dbeafe' : '#fee2e2',
                                  color: t.type === 'SALARY_CREDIT' ? '#15803d' : t.type === 'PAYMENT' ? '#1d4ed8' : '#b91c1c'
                                }}>{t.type}</span>
                              </td>
                              <td style={styles.tdSmall}>
                                <div style={{ fontWeight: 600 }}>{t.title}</div>
                                <div style={{ fontSize: "11px", color: "#64748b" }}>{t.description}</div>
                              </td>
                              <td style={{ ...styles.tdSmall, textAlign: "right", color: t.credit > 0 ? "#16a34a" : "#94a3b8", fontWeight: 700 }}>
                                {t.credit > 0 ? `+₹${t.credit.toLocaleString()}` : "-"}
                              </td>
                              <td style={{ ...styles.tdSmall, textAlign: "right", color: t.debit > 0 ? "#2563eb" : "#94a3b8", fontWeight: 700 }}>
                                {t.debit > 0 ? `-₹${t.debit.toLocaleString()}` : "-"}
                              </td>
                              <td style={{ ...styles.tdSmall, textAlign: "right", fontWeight: 800 }}>
                                ₹{t.runningBalance.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                    <button onClick={() => setIsLedgerOpen(false)} style={styles.cancelBtn}>Close</button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Three Columns: Attendance, Advances, Salaries */}
        <div style={styles.threeColGrid}>
          
          {/* Column 1: Attendance */}
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
            <h3 style={styles.listTitle}>Salary Records</h3>
            <div style={styles.listContent}>
              {worker.salaries.length === 0 ? <p style={styles.empty}>No salary records</p> : (
                <table style={styles.table}>
                  <tbody>
                    {worker.salaries.map(sal => {
                      const periodLabel = sal.startDate && sal.endDate 
                        ? `${new Date(sal.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${new Date(sal.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
                        : `${new Date(sal.year, sal.month - 1).toLocaleString('default', { month: 'short', year: '2-digit' })}`;
                      const balance = sal.balanceAmount !== undefined ? Number(sal.balanceAmount) : Math.max(0, Number(sal.netAmount) - Number(sal.paidAmount || 0));

                      return (
                        <tr key={sal.id} style={styles.tr}>
                          <td style={styles.tdSmall}>
                            <div style={{ fontWeight: 600 }}>{periodLabel}</div>
                            <div style={{ fontSize: "10px", color: "#64748b" }}>{sal.periodType || "Monthly"}</div>
                          </td>
                          <td style={{ ...styles.tdSmall, fontWeight: 700, color: "#0f766e" }}>
                            ₹{Number(sal.netAmount)}
                          </td>
                          <td style={styles.tdSmall}>
                            {sal.status === 'Paid' || balance <= 0 ? (
                              <span style={{ color: "#16a34a", fontSize: "11px", fontWeight: 700 }}>Paid</span>
                            ) : sal.status === 'Partial' ? (
                              <span style={{ color: "#d97706", fontSize: "11px", fontWeight: 700 }}>Due ₹{balance}</span>
                            ) : (
                              <span style={{ color: "#dc2626", fontSize: "11px", fontWeight: 700 }}>Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
  container: { padding: "32px", maxWidth: "1300px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#64748b", fontSize: "14px", fontWeight: 500, cursor: "pointer", padding: "0 0 20px 0" },
  spinner: { width: "40px", height: "40px", border: "4px solid #f1f5f9", borderTop: "4px solid #2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" },
  
  profileCard: { background: "#fff", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "20px" },
  profileHeader: { display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" },
  avatarLarge: { width: "72px", height: "72px", borderRadius: "20px", background: "#f0f9ff", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 700 },
  title: { fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" },
  badgeContainer: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  badgeID: { background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, border: "1px solid #e2e8f0" },
  badgeActive: { background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 },
  badgeInactive: { background: "#fee2e2", color: "#991b1b", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 },
  badgeSite: { display: "flex", alignItems: "center", gap: "4px", background: "#f3e8ff", color: "#7e22ce", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 },
  
  contactGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" },
  contactItem: { display: "flex", alignItems: "center", gap: "10px", color: "#475569", fontSize: "13px", fontWeight: 500 },
  
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "24px" },
  statCard: { background: "#fff", padding: "18px 22px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9" },
  statLabel: { margin: 0, fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" },
  statValue: { margin: "6px 0 0 0", fontSize: "22px", fontWeight: 800, color: "#0f172a" },
  
  threeColGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", alignItems: "start" },
  listCard: { background: "#fff", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9", overflow: "hidden", display: "flex", flexDirection: "column" },
  listTitle: { margin: 0, padding: "14px 18px", fontSize: "14px", fontWeight: 700, color: "#0f172a", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" },
  listContent: { padding: "16px 18px", maxHeight: "380px", overflowY: "auto" },
  empty: { fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "20px 0" },
  
  documentsCard: { background: "#fff", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9", marginBottom: "24px" },
  docHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", borderRadius: "16px 16px 0 0" },
  docSelect: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none" },
  uploadBtn: { display: "flex", alignItems: "center", gap: "6px", background: "#0f766e", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  docGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" },
  docItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc" },
  docIcon: { width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" },
  delBtn: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer" },

  timeline: { display: "flex", flexDirection: "column", gap: "8px" },
  timelineItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" },
  timelineDate: { fontSize: "12px", fontWeight: 600, color: "#334155" },
  timelineStatus: { display: "flex", gap: "6px", alignItems: "center" },
  tagPresent: { background: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 },
  tagHalf: { background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 },
  tagAbsent: { background: "#fee2e2", color: "#991b1b", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 },
  tagOT: { background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 },

  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  tableHead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "10px 12px", fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  tdSmall: { padding: "10px 12px", fontSize: "12px" },

  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modalContent: { background: "#fff", borderRadius: "18px", padding: "28px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  closeBtn: { background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8" },
  cancelBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer", fontSize: "12px" },

  miniCard: { background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" },
  miniLabel: { fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" },
  miniValue: { fontSize: "16px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }
};
