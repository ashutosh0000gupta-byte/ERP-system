import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { 
  User, Phone, MapPin, Calendar, Clock, CreditCard, ChevronLeft, 
  Building2, FileText, Upload, Trash2, BookOpen, AlertCircle, 
  CheckCircle, DollarSign, Wallet, Printer, Eye, Info, Receipt,
  TrendingUp, ArrowUpRight
} from "lucide-react";
import PayslipPrint from "../../components/shared/PayslipPrint";

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
  
  // Tab & Salary Detail States
  const [activeTab, setActiveTab] = useState("salaries");
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [printSalary, setPrintSalary] = useState(null);

  // Auto-print Payslip when triggered
  useEffect(() => {
    if (printSalary) {
      const timer = setTimeout(() => {
        window.print();
        setPrintSalary(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [printSalary]);

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
      fatherName: worker.fatherName || "",
      category: worker.category || "Worker",
      skillTrade: worker.skillTrade || "",
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
      aadhaar: worker.aadhaar || "",
      uan: worker.uan || "",
      esiNumber: worker.esiNumber || ""
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
              {worker.fatherName && (
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px", fontWeight: 500 }}>
                  Father's Name: <strong style={{ color: "#1e293b" }}>{worker.fatherName}</strong>
                </div>
              )}
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
                <span style={{ ...styles.badgeID, background: "#ede9fe", color: "#6d28d9", borderColor: "#ddd6fe", fontWeight: "700" }}>
                  Role: {worker.category || "Worker"}
                </span>
                {worker.skillTrade && (
                  <span style={{ ...styles.badgeID, background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0", fontWeight: "600" }}>
                    Trade: {worker.skillTrade}
                  </span>
                )}
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
              <User size={16} color="#64748b" />
              <span>Father: <strong>{worker.fatherName || "Not Provided"}</strong></span>
            </div>
            <div style={styles.contactItem}>
              <Phone size={16} color="#64748b" />
              <span>{worker.mobileNumber || "No phone provided"}</span>
            </div>
            <div style={styles.contactItem}>
              <MapPin size={16} color="#64748b" />
              <span>{worker.currentAddress || "No address provided"}</span>
            </div>
            <div style={styles.contactItem}>
              <Calendar size={16} color="#64748b" />
              <span>Joined {new Date(worker.joiningDate).toLocaleDateString()}</span>
            </div>
            <div style={styles.contactItem}>
              <Building2 size={16} color="#64748b" />
              <span>Role / Trade: <strong>{worker.category || "Worker"} ({worker.skillTrade || "General"})</strong></span>
            </div>
          </div>

          {/* Enhanced Salary & Wage Configuration Section */}
          <div style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            borderRadius: "16px",
            padding: "22px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign size={20} color="#0f766e" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
                    Salary & Wage Structure
                  </h4>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Official compensation package and calculation parameters
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  background: "#e0f2fe",
                  color: "#0369a1",
                  border: "1px solid #bae6fd"
                }}>
                  {worker.salaryType || "Daily Wage"}
                </span>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1"
                }}>
                  {worker.paymentFrequency || "Monthly"} Cycle
                </span>
              </div>
            </div>

            {/* Wage Highlights Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "14px",
              marginBottom: "16px"
            }}>
              {/* Card 1: Wage Rate */}
              <div style={{ background: "#fff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Base Wage Rate
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f766e", marginTop: "4px" }}>
                  ₹{Number(worker.wageRate || worker.dailyWage || 0).toLocaleString()}
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#64748b", marginLeft: "4px" }}>
                    {worker.salaryType === 'Monthly' ? '/ Month' : worker.salaryType === 'Hourly' ? '/ Hour' : worker.salaryType === 'Weekly' ? '/ Week' : '/ Day'}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                  {worker.salaryType === 'Monthly' 
                    ? "Fixed salary for full monthly period" 
                    : `Calculated as: Present Days × ₹${Number(worker.wageRate || worker.dailyWage || 0).toLocaleString()}`}
                </div>
              </div>

              {/* Card 2: Overtime Rate */}
              <div style={{ background: "#fff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Overtime (OT) Rate
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#2563eb", marginTop: "4px" }}>
                  ₹{Number(worker.otRatePerHour || (worker.dailyWage ? Math.round(Number(worker.dailyWage) / 8) : 0)).toLocaleString()}
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#64748b", marginLeft: "4px" }}>/ Hour</span>
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                  {worker.otRatePerHour ? "Custom hourly OT rate set" : "Auto 1/8th of daily rate applied"}
                </div>
              </div>

              {/* Card 3: Monthly Potential */}
              <div style={{ background: "#fff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Monthly Potential (~26 Days)
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#7c3aed", marginTop: "4px" }}>
                  ₹{(worker.salaryType === 'Monthly' 
                    ? Number(worker.wageRate || worker.dailyWage || 0) 
                    : Math.round(Number(worker.wageRate || worker.dailyWage || 0) * 26)
                  ).toLocaleString()}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                  Estimated gross for standard 26 working days
                </div>
              </div>

              {/* Card 4: Payout Schedule & Mode */}
              <div style={{ background: "#fff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Disbursement Mode & Cycle
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
                  {worker.paymentMethod || "Bank Transfer"}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                  Schedule: <strong>{worker.paymentDay || "Standard Monthly Payout"}</strong>
                </div>
              </div>
            </div>

            {/* Formula Explainer Pill */}
            <div style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "8px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "12px",
              color: "#1e40af"
            }}>
              <Info size={16} color="#2563eb" style={{ flexShrink: 0 }} />
              <div>
                <strong>Calculation Formula:</strong> [ Present Days × Wage Rate ] + [ OT Hours × OT Rate ] - [ Advance Recovered ] - [ PF / ESIC ] = <strong>Net Payable Salary</strong>
              </div>
            </div>
          </div>

          {/* Bank & Statutory Details Card */}
          <div style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "18px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
          }}>
            <h4 style={{ margin: "0 0 14px 0", fontSize: "13px", fontWeight: "700", color: "#334155", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
              <CreditCard size={15} color="#0f766e" /> Bank Account & Statutory Identification (PF / ESIC)
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Bank Name</span>
                <strong style={{ fontSize: "13px", color: "#0f172a" }}>{worker.bankName || "Not Provided"}</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Account Number</span>
                <strong style={{ fontSize: "13px", color: worker.bankAccount ? "#0f172a" : "#94a3b8", fontFamily: worker.bankAccount ? "monospace" : "inherit" }}>
                  {worker.bankAccount || "Not Provided"}
                </strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>IFSC Code</span>
                <strong style={{ fontSize: "13px", color: worker.ifsc ? "#0f172a" : "#94a3b8", fontFamily: worker.ifsc ? "monospace" : "inherit" }}>
                  {worker.ifsc || "Not Provided"}
                </strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>PAN Card</span>
                <strong style={{ fontSize: "13px", color: worker.pan ? "#0f172a" : "#94a3b8" }}>
                  {worker.pan || "Not Provided"}
                </strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Aadhaar Number</span>
                <strong style={{ fontSize: "13px", color: worker.aadhaar ? "#0f172a" : "#94a3b8" }}>
                  {worker.aadhaar || "Not Provided"}
                </strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>UAN Number (PF)</span>
                <strong style={{ fontSize: "13px", color: worker.uan ? "#0f172a" : "#94a3b8" }}>
                  {worker.uan || "Not Registered"}
                </strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>ESI Number (IP)</span>
                <strong style={{ fontSize: "13px", color: worker.esiNumber ? "#0f172a" : "#94a3b8" }}>
                  {worker.esiNumber || "Not Registered"}
                </strong>
              </div>
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
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Father's Name</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} placeholder="e.g. Suresh Kumar" value={editData.fatherName || ""} onChange={e => setEditData({...editData, fatherName: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Worker Role *</label>
                    <select 
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 600 }} 
                      value={editData.category || "Worker"} 
                      onChange={e => setEditData({...editData, category: e.target.value})}
                    >
                      <option value="Worker">Worker</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Foreman">Foreman</option>
                      <option value="Site Incharge">Site Incharge</option>
                      <option value="Safety Officer">Safety Officer</option>
                      <option value="Helper">Helper</option>
                      <option value="Skilled">Skilled</option>
                      <option value="Semi-Skilled">Semi-Skilled</option>
                      <option value="Unskilled">Unskilled</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>Trade / Designation</label>
                    <input 
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} 
                      placeholder="e.g. FITTER, WELDER, RIGGER, HELPER" 
                      value={editData.skillTrade || ""} 
                      onChange={e => setEditData({...editData, skillTrade: e.target.value})} 
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>UAN Number (PF)</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} placeholder="e.g. 101234567890" value={editData.uan || ""} onChange={e => setEditData({...editData, uan: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>ESI Number (IP No.)</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} placeholder="e.g. 31000123450000001" value={editData.esiNumber || ""} onChange={e => setEditData({...editData, esiNumber: e.target.value})} />
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

        {/* Navigation Tabs */}
        <div style={{
          display: "flex",
          gap: "8px",
          borderBottom: "2px solid #e2e8f0",
          marginBottom: "24px",
          flexWrap: "wrap"
        }}>
          <button
            onClick={() => setActiveTab("salaries")}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "salaries" ? "3px solid #0f766e" : "3px solid transparent",
              fontWeight: activeTab === "salaries" ? "700" : "600",
              color: activeTab === "salaries" ? "#0f766e" : "#64748b",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "-2px"
            }}
          >
            <DollarSign size={16} /> Salary & Payout Records ({worker.salaries?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("attendance")}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "attendance" ? "3px solid #0f766e" : "3px solid transparent",
              fontWeight: activeTab === "attendance" ? "700" : "600",
              color: activeTab === "attendance" ? "#0f766e" : "#64748b",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "-2px"
            }}
          >
            <Calendar size={16} /> Attendance History ({worker.attendances?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("advances")}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "advances" ? "3px solid #0f766e" : "3px solid transparent",
              fontWeight: activeTab === "advances" ? "700" : "600",
              color: activeTab === "advances" ? "#0f766e" : "#64748b",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "-2px"
            }}
          >
            <Wallet size={16} /> Advance History ({worker.advances?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "documents" ? "3px solid #0f766e" : "3px solid transparent",
              fontWeight: activeTab === "documents" ? "700" : "600",
              color: activeTab === "documents" ? "#0f766e" : "#64748b",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "-2px"
            }}
          >
            <FileText size={16} /> Documents & KYC ({documents.length})
          </button>

          <button
            onClick={() => setActiveTab("overview")}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "overview" ? "3px solid #0f766e" : "3px solid transparent",
              fontWeight: activeTab === "overview" ? "700" : "600",
              color: activeTab === "overview" ? "#0f766e" : "#64748b",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "-2px"
            }}
          >
            <Building2 size={16} /> 3-Column Overview
          </button>
        </div>

        {/* TAB 1: Detailed Salary & Payouts */}
        {activeTab === "salaries" && (
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.02)" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", background: "#f8fafc" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                  Worker Salary & Payout History
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                  Full monthly wage statements with attendance days, daily rate, overtime, deductions, and payment status. Click any row for complete breakdown.
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={fetchLedger}
                  style={{
                    background: "#0f766e",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <BookOpen size={14} /> View Hisab-Kitab Ledger
                </button>
              </div>
            </div>

            {(!worker.salaries || worker.salaries.length === 0) ? (
              <div style={{ padding: "60px 20px", textAlign: "center" }}>
                <DollarSign size={48} color="#cbd5e1" style={{ margin: "0 auto 12px auto" }} />
                <h4 style={{ margin: 0, fontSize: "16px", color: "#334155" }}>No Salary Records Found</h4>
                <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#64748b", maxWidth: "500px", marginInline: "auto" }}>
                  Salaries are generated automatically from the Monthly Payroll & Attendance module based on this worker's attendance days and daily wage rate.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={styles.th}>Pay Period</th>
                      <th style={styles.th}>Attendance & Rate</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Basic Wages</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>OT Pay</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Gross Total</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Deductions</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Net Payable</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Paid / Due</th>
                      <th style={{ ...styles.th, textAlign: "center" }}>Status</th>
                      <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {worker.salaries.map(sal => {
                      const periodLabel = sal.startDate && sal.endDate 
                        ? `${new Date(sal.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${new Date(sal.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                        : (sal.month && sal.year 
                            ? `${new Date(sal.year, sal.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}`
                            : "Current Period");

                      const rateApplied = Number(sal.rateApplied || sal.dailyWage || 0);
                      const basicSalary = Number(sal.basicSalary || Math.round(Number(sal.presentDays || 0) * rateApplied * 100) / 100);
                      const grossAmount = Number(sal.grossAmount || (basicSalary + Number(sal.otAmount || 0) + Number(sal.specialAllowance || 0) + Number(sal.conveyanceAllowance || 0)));
                      const totalDeductions = Number(sal.advanceDeducted || 0) + Number(sal.pfDeducted || 0) + Number(sal.esicDeducted || 0) + Number(sal.professionalTax || 0) + Number(sal.otherDeductions || 0);
                      const netAmount = Number(sal.netAmount || 0);
                      const paidAmount = Number(sal.paidAmount || (sal.status === 'Paid' ? netAmount : 0));
                      const balance = sal.balanceAmount !== undefined ? Number(sal.balanceAmount) : Math.max(0, netAmount - paidAmount);

                      return (
                        <tr 
                          key={sal.id} 
                          style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                          onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                          onClick={() => setSelectedSalary(sal)}
                        >
                          <td style={styles.tdSmall}>
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>{periodLabel}</div>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>{sal.periodType || "Monthly"}</span>
                          </td>

                          <td style={styles.tdSmall}>
                            <div style={{ fontWeight: 600, color: "#0369a1" }}>
                              <strong>{Number(sal.presentDays || 0)}</strong> Days present
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              @ ₹{rateApplied.toLocaleString()} / {sal.salaryType === 'Monthly' ? 'mo' : 'day'}
                            </div>
                          </td>

                          <td style={{ ...styles.tdSmall, textAlign: "right", fontWeight: 600, color: "#334155" }}>
                            ₹{basicSalary.toLocaleString()}
                          </td>

                          <td style={{ ...styles.tdSmall, textAlign: "right" }}>
                            {Number(sal.otHours || 0) > 0 ? (
                              <div>
                                <span style={{ fontWeight: 600, color: "#2563eb" }}>+₹{Number(sal.otAmount || 0).toLocaleString()}</span>
                                <div style={{ fontSize: "10px", color: "#64748b" }}>{Number(sal.otHours)} hrs</div>
                              </div>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>-</span>
                            )}
                          </td>

                          <td style={{ ...styles.tdSmall, textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                            ₹{grossAmount.toLocaleString()}
                          </td>

                          <td style={{ ...styles.tdSmall, textAlign: "right" }}>
                            {totalDeductions > 0 ? (
                              <div>
                                <span style={{ fontWeight: 600, color: "#e11d48" }}>-₹{totalDeductions.toLocaleString()}</span>
                                {Number(sal.advanceDeducted || 0) > 0 && (
                                  <div style={{ fontSize: "10px", color: "#64748b" }}>Adv: ₹{Number(sal.advanceDeducted).toLocaleString()}</div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>₹0</span>
                            )}
                          </td>

                          <td style={{ ...styles.tdSmall, textAlign: "right" }}>
                            <strong style={{ fontSize: "14px", color: "#0f766e" }}>₹{netAmount.toLocaleString()}</strong>
                          </td>

                          <td style={{ ...styles.tdSmall, textAlign: "right" }}>
                            <div style={{ fontWeight: 600, color: "#16a34a" }}>Paid: ₹{paidAmount.toLocaleString()}</div>
                            {balance > 0 && (
                              <div style={{ fontSize: "11px", fontWeight: 700, color: "#d97706" }}>Due: ₹{balance.toLocaleString()}</div>
                            )}
                          </td>

                          <td style={{ ...styles.tdSmall, textAlign: "center" }}>
                            {sal.status === 'Paid' || balance <= 0 ? (
                              <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                                Paid
                              </span>
                            ) : sal.status === 'Partial' ? (
                              <span style={{ background: "#fef3c7", color: "#92400e", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                                Partial (Due)
                              </span>
                            ) : (
                              <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                                Pending
                              </span>
                            )}
                          </td>

                          <td style={{ ...styles.tdSmall, textAlign: "center" }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                              <button
                                onClick={() => setSelectedSalary(sal)}
                                title="View Calculation Breakdown"
                                style={{
                                  background: "#eff6ff",
                                  color: "#2563eb",
                                  border: "1px solid #bfdbfe",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <Eye size={12} /> Details
                              </button>
                              <button
                                onClick={() => setPrintSalary({ ...sal, worker })}
                                title="Print Payslip"
                                style={{
                                  background: "#f1f5f9",
                                  color: "#334155",
                                  border: "1px solid #cbd5e1",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <Printer size={12} /> Slip
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Attendance History */}
        {activeTab === "attendance" && (
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.02)" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                  Worker Attendance History
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                  Recent 30 days of site attendance logs, overtime hours, and status
                </p>
              </div>
            </div>

            {(!worker.attendances || worker.attendances.length === 0) ? (
              <p style={styles.empty}>No attendance records recorded yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Overtime</th>
                      <th style={styles.th}>Site</th>
                      <th style={styles.th}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {worker.attendances.map(a => (
                      <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={styles.tdSmall}>
                          <strong>{new Date(a.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                        </td>
                        <td style={styles.tdSmall}>
                          <span style={a.status === 'Present' ? styles.tagPresent : a.status === 'Half Day' ? styles.tagHalf : styles.tagAbsent}>
                            {a.status}
                          </span>
                        </td>
                        <td style={styles.tdSmall}>
                          {Number(a.otHours || 0) > 0 ? (
                            <span style={styles.tagOT}>{a.otHours} Hours OT</span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>None</span>
                          )}
                        </td>
                        <td style={styles.tdSmall}>{worker.site?.name || "Main Site"}</td>
                        <td style={{ ...styles.tdSmall, color: "#64748b" }}>{a.remarks || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Advance History */}
        {activeTab === "advances" && (
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.02)" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                  Worker Advance History
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                  Advances taken and recovery status in salary calculations
                </p>
              </div>
            </div>

            {(!worker.advances || worker.advances.length === 0) ? (
              <p style={styles.empty}>No advances taken by this worker.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={styles.th}>Date Taken</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Notes / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {worker.advances.map(adv => (
                      <tr key={adv.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={styles.tdSmall}>
                          <strong>{new Date(adv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                        </td>
                        <td style={{ ...styles.tdSmall, fontWeight: 800, fontSize: "14px", color: "#e11d48" }}>
                          ₹{Number(adv.amount).toLocaleString()}
                        </td>
                        <td style={styles.tdSmall}>
                          {adv.isDeducted ? (
                            <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                              Deducted from Salary
                            </span>
                          ) : (
                            <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                              Pending Deduction
                            </span>
                          )}
                        </td>
                        <td style={{ ...styles.tdSmall, color: "#64748b" }}>{adv.reason || adv.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Documents & KYC */}
        {activeTab === "documents" && (
          <div style={styles.documentsCard}>
            <div style={styles.docHeader}>
              <h3 style={styles.listTitle}><FileText size={18} /> Worker Documents & KYC Files</h3>
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
        )}

        {/* TAB 5: 3-Column Overview */}
        {activeTab === "overview" && (
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
                          <tr key={sal.id} style={styles.tr} onClick={() => setSelectedSalary(sal)}>
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
        )}

        {/* Detailed Salary Breakdown Modal */}
        {selectedSalary && (() => {
          const sal = selectedSalary;
          const periodLabel = sal.startDate && sal.endDate 
            ? `${new Date(sal.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${new Date(sal.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
            : (sal.month && sal.year 
                ? `${new Date(sal.year, sal.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`
                : "Current Pay Period");

          const rateApplied = Number(sal.rateApplied || sal.dailyWage || 0);
          const basicSalary = Number(sal.basicSalary || Math.round(Number(sal.presentDays || 0) * rateApplied * 100) / 100);
          const grossAmount = Number(sal.grossAmount || (basicSalary + Number(sal.otAmount || 0) + Number(sal.specialAllowance || 0) + Number(sal.conveyanceAllowance || 0)));
          const totalDeductions = Number(sal.advanceDeducted || 0) + Number(sal.pfDeducted || 0) + Number(sal.esicDeducted || 0) + Number(sal.professionalTax || 0) + Number(sal.otherDeductions || 0);
          const netAmount = Number(sal.netAmount || 0);
          const paidAmount = Number(sal.paidAmount || (sal.status === 'Paid' ? netAmount : 0));
          const balance = sal.balanceAmount !== undefined ? Number(sal.balanceAmount) : Math.max(0, netAmount - paidAmount);

          return (
            <div style={styles.modalOverlay} onClick={() => setSelectedSalary(null)}>
              <div style={{ ...styles.modalContent, maxWidth: "800px" }} onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ background: "#ccfbf1", color: "#0f766e", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                        {sal.periodType || "Monthly"} Wage Slip
                      </span>
                      <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                        {periodLabel}
                      </h2>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                      Worker: <strong>{worker.fullName}</strong> ({worker.workerId}) • Role: <strong>{worker.category || "Worker"}</strong> • Site: <strong>{worker.site?.name || "Unassigned"}</strong>
                    </p>
                  </div>
                  <button onClick={() => setSelectedSalary(null)} style={styles.closeBtn}>&times;</button>
                </div>

                {/* KPI Summary Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Present Days</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#0369a1", marginTop: "4px" }}>
                      {Number(sal.presentDays || 0)} <span style={{ fontSize: "12px", color: "#64748b" }}>/ {sal.totalDays || 30}</span>
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Gross Earnings</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                      ₹{grossAmount.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total Deductions</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#e11d48", marginTop: "4px" }}>
                      -₹{totalDeductions.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ background: "#ecfdf5", padding: "12px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#047857", textTransform: "uppercase" }}>Net Payable</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f766e", marginTop: "4px" }}>
                      ₹{netAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 2-Column Earnings vs Deductions Breakdown */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  {/* Earnings Box */}
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ background: "#f0fdf4", padding: "10px 14px", borderBottom: "1px solid #dcfce7", fontWeight: 700, fontSize: "13px", color: "#166534" }}>
                      Earnings Breakdown (+)
                    </div>
                    <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div>Basic Wages (Earned)</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {Number(sal.presentDays || 0)} days × ₹{rateApplied.toLocaleString()}
                          </div>
                        </div>
                        <strong style={{ color: "#0f172a" }}>₹{basicSalary.toLocaleString()}</strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div>Overtime Pay (OT)</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {Number(sal.otHours || 0)} OT Hours
                          </div>
                        </div>
                        <strong style={{ color: Number(sal.otAmount || 0) > 0 ? "#2563eb" : "#64748b" }}>
                          ₹{Number(sal.otAmount || 0).toLocaleString()}
                        </strong>
                      </div>

                      {Number(sal.specialAllowance || 0) > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <div>Special Allowance</div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>Trade & skill allowance</div>
                          </div>
                          <strong>₹{Number(sal.specialAllowance).toLocaleString()}</strong>
                        </div>
                      )}

                      {Number(sal.conveyanceAllowance || 0) > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <div>Conveyance Allowance</div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>Site transport assistance</div>
                          </div>
                          <strong>₹{Number(sal.conveyanceAllowance).toLocaleString()}</strong>
                        </div>
                      )}

                      <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#15803d" }}>
                        <span>Total Gross Earnings</span>
                        <span>₹{grossAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions Box */}
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ background: "#fff1f2", padding: "10px 14px", borderBottom: "1px solid #ffe4e6", fontWeight: 700, fontSize: "13px", color: "#9f1239" }}>
                      Deductions Breakdown (-)
                    </div>
                    <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div>Advance Deduction</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>Recovered from advances taken</div>
                        </div>
                        <strong style={{ color: Number(sal.advanceDeducted || 0) > 0 ? "#e11d48" : "#64748b" }}>
                          ₹{Number(sal.advanceDeducted || 0).toLocaleString()}
                        </strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div>Provident Fund (PF)</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>EPF contribution</div>
                        </div>
                        <strong style={{ color: Number(sal.pfDeducted || 0) > 0 ? "#e11d48" : "#64748b" }}>
                          ₹{Number(sal.pfDeducted || 0).toLocaleString()}
                        </strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div>ESIC Contribution</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>Employee state insurance</div>
                        </div>
                        <strong style={{ color: Number(sal.esicDeducted || 0) > 0 ? "#e11d48" : "#64748b" }}>
                          ₹{Number(sal.esicDeducted || 0).toLocaleString()}
                        </strong>
                      </div>

                      {Number(sal.professionalTax || 0) > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <div>Professional Tax (PT)</div>
                          </div>
                          <strong>₹{Number(sal.professionalTax).toLocaleString()}</strong>
                        </div>
                      )}

                      {Number(sal.otherDeductions || 0) > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <div>Other Deductions</div>
                          </div>
                          <strong>₹{Number(sal.otherDeductions).toLocaleString()}</strong>
                        </div>
                      )}

                      <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#be123c" }}>
                        <span>Total Deductions</span>
                        <span>₹{totalDeductions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment & Settlement Status Card */}
                <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "14px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", fontSize: "13px" }}>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Payment Status</span>
                      <strong style={{ color: sal.status === 'Paid' ? "#16a34a" : sal.status === 'Partial' ? "#d97706" : "#dc2626" }}>
                        {sal.status} {balance > 0 ? `(Pending ₹${balance.toLocaleString()})` : "(Cleared)"}
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Amount Disbursed</span>
                      <strong style={{ color: "#16a34a" }}>₹{paidAmount.toLocaleString()}</strong>
                    </div>

                    <div>
                      <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Payment Mode</span>
                      <strong style={{ color: "#0f172a" }}>{sal.paymentMode || worker.paymentMethod || "Bank Transfer"}</strong>
                    </div>

                    <div>
                      <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Disbursement Date</span>
                      <strong style={{ color: "#0f172a" }}>
                        {sal.paidAt ? new Date(sal.paidAt).toLocaleDateString('en-GB') : "Not Disbursed Yet"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    onClick={() => setPrintSalary({ ...sal, worker })}
                    style={{
                      background: "#0f766e",
                      color: "#fff",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px"
                    }}
                  >
                    <Printer size={15} /> Print Official Payslip
                  </button>

                  <button
                    onClick={() => setSelectedSalary(null)}
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "13px"
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Payslip Print Trigger */}
        {printSalary && <PayslipPrint salary={printSalary} />}
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
