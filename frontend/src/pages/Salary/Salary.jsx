import React, { useState, useEffect, useRef } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { 
  Wallet, Search, Play, Check, X, Calendar, AlertCircle, 
  Download, Printer, Filter, CreditCard, BookOpen, Clock, 
  ArrowUpRight, ArrowDownLeft, ChevronRight, RefreshCw, FileText
} from "lucide-react";
import PayslipPrint from "../../components/shared/PayslipPrint";

export default function Salary() {
  const [salaries, setSalaries] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Period & Filter State
  const [periodType, setPeriodType] = useState("Monthly"); // Monthly, Weekly, Daily, Custom
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [siteFilter, setSiteFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Actions
  const [isGenerating, setIsGenerating] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [printSalary, setPrintSalary] = useState(null);
  const fileInputRef = useRef(null);

  // Generate Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [genPeriodType, setGenPeriodType] = useState("Monthly");
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genStartDate, setGenStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]);
  const [genEndDate, setGenEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [genSiteId, setGenSiteId] = useState("all");

  // Payment Modal
  const [paymentModalSalary, setPaymentModalSalary] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Bank Transfer");
  const [payRefNo, setPayRefNo] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Worker Ledger Modal
  const [ledgerWorkerId, setLedgerWorkerId] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    fetchSalaries();
  }, [periodType, month, year, startDate, endDate, siteFilter, statusFilter]);

  const fetchSites = async () => {
    try {
      const res = await api.get("/snmr/sites");
      setSites(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      let query = `?status=${statusFilter}&siteId=${siteFilter}`;
      if (periodType === "Monthly") {
        query += `&month=${month}&year=${year}&periodType=Monthly`;
      } else {
        query += `&startDate=${startDate}&endDate=${endDate}&periodType=${periodType}`;
      }
      const res = await api.get(`/snmr/salaries${query}`);
      setSalaries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (printSalary) {
      setTimeout(() => {
        window.print();
        setPrintSalary(null);
      }, 500);
    }
  }, [printSalary]);

  const handleOpenGenerateModal = () => {
    setGenPeriodType(periodType);
    setGenMonth(month);
    setGenYear(year);
    setGenStartDate(startDate);
    setGenEndDate(endDate);
    setGenSiteId(siteFilter);
    setIsGenerateModalOpen(true);
  };

  const handleExecuteGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const payload = {
        periodType: genPeriodType,
        siteId: genSiteId,
        ...(genPeriodType === "Monthly" 
          ? { month: genMonth, year: genYear }
          : { startDate: genStartDate, endDate: genEndDate, month: genMonth, year: genYear })
      };
      await api.post("/snmr/salaries/generate", payload);
      alert("Payroll calculation completed successfully! Outstanding advances deducted.");
      setIsGenerateModalOpen(false);
      fetchSalaries();
    } catch (err) {
      console.error("Failed to generate", err);
      alert(err.response?.data?.error || "Failed to generate salaries.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPaymentModal = (sal) => {
    setPaymentModalSalary(sal);
    const balance = sal.balanceAmount !== undefined 
      ? Number(sal.balanceAmount) 
      : Math.max(0, Number(sal.netAmount) - Number(sal.paidAmount || 0));
    setPayAmount(balance > 0 ? balance : Number(sal.netAmount));
    setPayMode(sal.worker?.paymentMethod || "Bank Transfer");
    setPayRefNo("");
    setPayNotes("");
    setPayDate(new Date().toISOString().split("T")[0]);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }
    setIsSubmittingPayment(true);
    try {
      await api.post("/snmr/salaries/payment", {
        salaryId: paymentModalSalary.id,
        workerId: paymentModalSalary.workerId,
        amount: Number(payAmount),
        paymentMode: payMode,
        referenceNo: payRefNo,
        notes: payNotes,
        paymentDate: payDate
      });
      alert(`Payment of ₹${payAmount} recorded successfully!`);
      setPaymentModalSalary(null);
      fetchSalaries();
    } catch (err) {
      console.error("Payment failed", err);
      alert(err.response?.data?.error || "Failed to record payment");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleOpenLedger = async (workerId) => {
    setLedgerWorkerId(workerId);
    setLoadingLedger(true);
    try {
      const res = await api.get(`/snmr/workers/${workerId}/ledger`);
      setLedgerData(res.data);
    } catch (err) {
      console.error("Ledger fetch failed", err);
      alert("Failed to load worker ledger.");
      setLedgerWorkerId(null);
    } finally {
      setLoadingLedger(false);
    }
  };

  const handleExportCSV = () => {
    if (salaries.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Worker ID", "Name", "Site", "Salary Type", "Wage Rate", "Pay Frequency",
      "Period Type", "Start Date", "End Date", "Present Days", "Total Days",
      "OT Hours", "OT Amount", "Gross Amount", "Advance Deducted", "PF Deducted",
      "Net Payable", "Paid Amount", "Balance Pending", "Status", "Payment Mode", "Bank A/C", "IFSC"
    ];
    
    const rows = filteredSalaries.map(s => [
      s.worker?.workerId || "N/A",
      `"${s.worker?.fullName || "Unknown"}"`,
      `"${s.worker?.site?.name || "Unassigned"}"`,
      s.salaryType || s.worker?.salaryType || "Daily",
      s.rateApplied || s.dailyWage || 0,
      s.worker?.paymentFrequency || s.periodType || "Monthly",
      s.periodType || "Monthly",
      s.startDate ? new Date(s.startDate).toLocaleDateString('en-GB') : `${s.month}/${s.year}`,
      s.endDate ? new Date(s.endDate).toLocaleDateString('en-GB') : `${s.month}/${s.year}`,
      s.presentDays,
      s.totalDays,
      s.otHours || 0,
      s.otAmount || 0,
      s.grossAmount,
      s.advanceDeducted,
      s.pfDeducted || 0,
      s.netAmount,
      s.paidAmount || 0,
      s.balanceAmount !== undefined ? s.balanceAmount : Math.max(0, Number(s.netAmount) - Number(s.paidAmount || 0)),
      s.status,
      s.paymentMode || s.worker?.paymentMethod || "Bank Transfer",
      `"${s.worker?.bankAccount || "N/A"}"`,
      `"${s.worker?.ifsc || "N/A"}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Salary_Report_${periodType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNotify = async () => {
    if (!window.confirm(`Send WhatsApp/SMS salary alerts to workers?`)) return;
    setIsNotifying(true);
    try {
      const res = await api.post("/snmr/salaries/notify", { month, year });
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to send notifications.");
    } finally {
      setIsNotifying(false);
    }
  };

  // Filter salaries by search query
  const filteredSalaries = salaries.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = s.worker?.fullName?.toLowerCase() || "";
    const wId = s.worker?.workerId?.toLowerCase() || "";
    const site = s.worker?.site?.name?.toLowerCase() || "";
    return name.includes(q) || wId.includes(q) || site.includes(q);
  });

  // Calculate totals
  const totalGross = filteredSalaries.reduce((acc, s) => acc + Number(s.grossAmount || 0), 0);
  const totalNet = filteredSalaries.reduce((acc, s) => acc + Number(s.netAmount || 0), 0);
  const totalPaid = filteredSalaries.reduce((acc, s) => acc + Number(s.paidAmount || 0), 0);
  const totalBalance = filteredSalaries.reduce((acc, s) => {
    const bal = s.balanceAmount !== undefined ? Number(s.balanceAmount) : Math.max(0, Number(s.netAmount) - Number(s.paidAmount || 0));
    return acc + bal;
  }, 0);
  const totalAdvancesDeducted = filteredSalaries.reduce((acc, s) => acc + Number(s.advanceDeducted || 0), 0);

  return (
    <MainLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Worker Wages & Payroll</h1>
            <p style={styles.subtitle}>Calculate wages, process full or partial payments, and manage worker ledgers.</p>
          </div>
          
          <div style={styles.headerActions}>
            <button style={styles.generateBtn} onClick={handleOpenGenerateModal}>
              <Play size={16} /> Generate Payroll
            </button>
            <button style={styles.exportBtn} onClick={handleExportCSV} disabled={salaries.length === 0}>
              <Download size={16} /> Export Excel
            </button>
            <button 
              style={{...styles.exportBtn, background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0"}} 
              onClick={handleNotify} 
              disabled={isNotifying || salaries.length === 0}
            >
              {isNotifying ? "Sending..." : "Notify SMS/WhatsApp"}
            </button>
          </div>
        </div>

        {/* Filters and Controls Card */}
        <div style={styles.filterCard}>
          <div style={styles.filterRow}>
            {/* Period Type Selection */}
            <div style={styles.controlGroup}>
              <label style={styles.label}>Salary Cycle / Period</label>
              <div style={styles.periodTabs}>
                {["Monthly", "Weekly", "Daily", "Custom"].map(type => (
                  <button
                    key={type}
                    onClick={() => setPeriodType(type)}
                    style={{
                      ...styles.periodTab,
                      background: periodType === type ? "#0f766e" : "#f1f5f9",
                      color: periodType === type ? "#fff" : "#475569",
                      fontWeight: periodType === type ? "700" : "500"
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Period Date Pickers */}
            {periodType === "Monthly" ? (
              <>
                <div style={styles.controlGroup}>
                  <label style={styles.label}>Month</label>
                  <select style={styles.input} value={month} onChange={e => setMonth(Number(e.target.value))}>
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.controlGroup}>
                  <label style={styles.label}>Year</label>
                  <select style={styles.input} value={year} onChange={e => setYear(Number(e.target.value))}>
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </>
            ) : periodType === "Daily" ? (
              <div style={styles.controlGroup}>
                <label style={styles.label}>Select Date</label>
                <input 
                  type="date" 
                  style={styles.input} 
                  value={startDate} 
                  onChange={e => { setStartDate(e.target.value); setEndDate(e.target.value); }} 
                />
              </div>
            ) : (
              <>
                <div style={styles.controlGroup}>
                  <label style={styles.label}>Start Date</label>
                  <input type="date" style={styles.input} value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div style={styles.controlGroup}>
                  <label style={styles.label}>End Date</label>
                  <input type="date" style={styles.input} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </>
            )}

            {/* Site Filter */}
            <div style={styles.controlGroup}>
              <label style={styles.label}>Filter Site</label>
              <select style={styles.input} value={siteFilter} onChange={e => setSiteFilter(e.target.value)}>
                <option value="all">All Sites</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Status Filter */}
            <div style={styles.controlGroup}>
              <label style={styles.label}>Payment Status</label>
              <select style={styles.input} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {/* Search Input */}
            <div style={{ ...styles.controlGroup, flex: 1, minWidth: "200px" }}>
              <label style={styles.label}>Search Worker</label>
              <div style={styles.searchWrap}>
                <Search size={16} color="#94a3b8" />
                <input 
                  placeholder="Search name, ID, site..." 
                  style={styles.searchInput}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Total Net Payable</div>
            <div style={styles.kpiValue}>₹{totalNet.toLocaleString()}</div>
            <div style={styles.kpiSub}>Gross: ₹{totalGross.toLocaleString()}</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Disbursed / Paid</div>
            <div style={{ ...styles.kpiValue, color: "#16a34a" }}>₹{totalPaid.toLocaleString()}</div>
            <div style={styles.kpiSub}>Payments recorded</div>
          </div>
          <div style={{ ...styles.kpiCard, borderLeft: totalBalance > 0 ? "4px solid #f59e0b" : "1px solid #e2e8f0" }}>
            <div style={styles.kpiLabel}>Pending Balance</div>
            <div style={{ ...styles.kpiValue, color: totalBalance > 0 ? "#d97706" : "#0f172a" }}>
              ₹{totalBalance.toLocaleString()}
            </div>
            <div style={styles.kpiSub}>{filteredSalaries.filter(s => (s.balanceAmount || s.netAmount) > 0).length} workers with pending dues</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Advances Deducted</div>
            <div style={{ ...styles.kpiValue, color: "#dc2626" }}>-₹{totalAdvancesDeducted.toLocaleString()}</div>
            <div style={styles.kpiSub}>Automatically reconciled</div>
          </div>
        </div>

        {/* Salaries Table */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Calculating wage records...</p>
            </div>
          ) : filteredSalaries.length === 0 ? (
            <div style={styles.emptyState}>
              <Wallet size={48} color="#cbd5e1" />
              <h3 style={styles.emptyTitle}>No wages found for this period</h3>
              <p style={styles.emptyDesc}>Click <strong>'Generate Payroll'</strong> to calculate worker wages according to their salary types (Daily, Weekly, Monthly, Hourly, Contract).</p>
              <button style={{ ...styles.generateBtn, marginTop: "16px" }} onClick={handleOpenGenerateModal}>
                <Play size={16} /> Generate Payroll Now
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>Worker</th>
                    <th style={styles.th}>Salary Type & Rate</th>
                    <th style={styles.th}>Pay Cycle</th>
                    <th style={styles.th}>Attendance</th>
                    <th style={styles.th}>OT Pay</th>
                    <th style={styles.th}>Gross</th>
                    <th style={styles.th}>Advance Rec.</th>
                    <th style={styles.th}>Net Payable</th>
                    <th style={styles.th}>Paid So Far</th>
                    <th style={styles.th}>Pending Balance</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaries.map(s => {
                    const balance = s.balanceAmount !== undefined 
                      ? Number(s.balanceAmount) 
                      : Math.max(0, Number(s.netAmount) - Number(s.paidAmount || 0));
                    const isPaid = s.status === "Paid" || balance <= 0;
                    const isPartial = s.status === "Partial" || (Number(s.paidAmount || 0) > 0 && balance > 0);

                    return (
                      <tr key={s.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={styles.avatar}>{s.worker?.fullName?.charAt(0) || '?'}</div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#0f172a" }}>{s.worker?.fullName || 'Unknown'}</div>
                              <div style={{ fontSize: "12px", color: "#64748b" }}>
                                {s.worker?.workerId} • <span style={{ color: "#0f766e" }}>{s.worker?.site?.name || "Unassigned"}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.typeBadge}>
                            {s.salaryType || s.worker?.salaryType || "Daily"}
                          </div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginTop: "3px" }}>
                            ₹{Number(s.rateApplied || s.dailyWage || 0).toLocaleString()}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>
                            {s.worker?.paymentFrequency || s.periodType || "Monthly"}
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                            {s.worker?.paymentDay || "Standard"}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: 700, color: "#0f172a" }}>{Number(s.presentDays)}</span> / {s.totalDays} days
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 600, color: Number(s.otAmount) > 0 ? "#0f766e" : "#64748b" }}>
                            ₹{Number(s.otAmount || 0).toLocaleString()}
                          </div>
                          {Number(s.otHours) > 0 && (
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{Number(s.otHours)} hrs</div>
                          )}
                        </td>
                        <td style={styles.td}>₹{Number(s.grossAmount).toLocaleString()}</td>
                        <td style={styles.td}>
                          <span style={{ color: Number(s.advanceDeducted) > 0 ? "#e11d48" : "#94a3b8", fontWeight: 600 }}>
                            {Number(s.advanceDeducted) > 0 ? `-₹${Number(s.advanceDeducted).toLocaleString()}` : "₹0"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f766e" }}>
                            ₹{Number(s.netAmount).toLocaleString()}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: 600, color: Number(s.paidAmount) > 0 ? "#16a34a" : "#64748b" }}>
                            ₹{Number(s.paidAmount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ 
                            fontWeight: 700, 
                            color: balance > 0 ? "#d97706" : "#16a34a",
                            background: balance > 0 ? "#fef3c7" : "#dcfce7",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "13px"
                          }}>
                            ₹{balance.toLocaleString()}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {isPaid ? (
                            <span style={styles.statusPaid}>Paid</span>
                          ) : isPartial ? (
                            <span style={styles.statusPartial}>Partial</span>
                          ) : (
                            <span style={styles.statusPending}>Pending</span>
                          )}
                        </td>
                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            <button 
                              onClick={() => handleOpenPaymentModal(s)} 
                              style={{
                                ...styles.payBtn,
                                background: balance <= 0 ? "#f1f5f9" : "#0f766e",
                                color: balance <= 0 ? "#64748b" : "#fff",
                                cursor: balance <= 0 ? "default" : "pointer"
                              }}
                              title="Record full or partial payout"
                            >
                              <CreditCard size={13} /> {balance <= 0 ? "Paid" : "Pay"}
                            </button>
                            <button 
                              onClick={() => setPrintSalary(s)} 
                              style={styles.printBtn}
                              title="Print worker payslip"
                            >
                              <Printer size={13} /> Slip
                            </button>
                            <button 
                              onClick={() => handleOpenLedger(s.workerId)} 
                              style={styles.ledgerBtn}
                              title="View Hisab-Kitab / Ledger"
                            >
                              <BookOpen size={13} /> Ledger
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

        {/* Generate Payroll Modal */}
        {isGenerateModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={styles.modalTitle}>Generate Wages & Payroll</h2>
                  <p style={styles.modalSub}>Run calculation rules based on worker wage settings & attendance.</p>
                </div>
                <button onClick={() => setIsGenerateModalOpen(false)} style={styles.closeBtn}>&times;</button>
              </div>

              <form onSubmit={handleExecuteGenerate} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={styles.inputLabel}>Calculation Period Cycle</label>
                  <div style={styles.periodTabs}>
                    {["Monthly", "Weekly", "Daily", "Custom"].map(t => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setGenPeriodType(t)}
                        style={{
                          ...styles.periodTab,
                          background: genPeriodType === t ? "#0f766e" : "#f1f5f9",
                          color: genPeriodType === t ? "#fff" : "#475569",
                          fontWeight: genPeriodType === t ? "700" : "500"
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {genPeriodType === "Monthly" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label style={styles.inputLabel}>Month</label>
                      <select style={styles.modalInput} value={genMonth} onChange={e => setGenMonth(Number(e.target.value))}>
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                          <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={styles.inputLabel}>Year</label>
                      <select style={styles.modalInput} value={genYear} onChange={e => setGenYear(Number(e.target.value))}>
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                ) : genPeriodType === "Daily" ? (
                  <div>
                    <label style={styles.inputLabel}>Date</label>
                    <input 
                      type="date" 
                      style={styles.modalInput} 
                      value={genStartDate} 
                      onChange={e => { setGenStartDate(e.target.value); setGenEndDate(e.target.value); }} 
                    />
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label style={styles.inputLabel}>Period Start Date</label>
                      <input type="date" style={styles.modalInput} value={genStartDate} onChange={e => setGenStartDate(e.target.value)} required />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>Period End Date</label>
                      <input type="date" style={styles.modalInput} value={genEndDate} onChange={e => setGenEndDate(e.target.value)} required />
                    </div>
                  </div>
                )}

                <div>
                  <label style={styles.inputLabel}>Project / Site Scope</label>
                  <select style={styles.modalInput} value={genSiteId} onChange={e => setGenSiteId(e.target.value)}>
                    <option value="all">All Sites & Active Workers</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.location})</option>)}
                  </select>
                </div>

                <div style={styles.infoBox}>
                  <AlertCircle size={18} color="#0f766e" />
                  <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>
                    <strong>Automatic Calculation Rules:</strong>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px" }}>
                      <li><strong>Daily Wage:</strong> Present Days × Daily Rate + OT Pay.</li>
                      <li><strong>Weekly Wage:</strong> Calculated pro-rata for the work week.</li>
                      <li><strong>Monthly Salary:</strong> Calculated on standard month days.</li>
                      <li><strong>Hourly / Contract:</strong> Calculated per hours worked or milestone rate.</li>
                      <li><strong>Advances:</strong> Active undeducted advances will be automatically deducted.</li>
                    </ul>
                  </div>
                </div>

                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setIsGenerateModalOpen(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.confirmBtn} disabled={isGenerating}>
                    {isGenerating ? "Calculating..." : "Run Payroll Calculation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Record Payment Modal */}
        {paymentModalSalary && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={styles.modalTitle}>Record Wage Payment</h2>
                  <p style={styles.modalSub}>
                    Disburse full or partial payment to <strong>{paymentModalSalary.worker?.fullName}</strong> ({paymentModalSalary.worker?.workerId}).
                  </p>
                </div>
                <button onClick={() => setPaymentModalSalary(null)} style={styles.closeBtn}>&times;</button>
              </div>

              {/* Outstanding Summary Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div style={styles.miniCard}>
                  <div style={styles.miniLabel}>Net Payable</div>
                  <div style={styles.miniValue}>₹{Number(paymentModalSalary.netAmount).toLocaleString()}</div>
                </div>
                <div style={styles.miniCard}>
                  <div style={styles.miniLabel}>Already Paid</div>
                  <div style={{ ...styles.miniValue, color: "#16a34a" }}>₹{Number(paymentModalSalary.paidAmount || 0).toLocaleString()}</div>
                </div>
                <div style={{ ...styles.miniCard, background: "#fef3c7" }}>
                  <div style={{ ...styles.miniLabel, color: "#92400e" }}>Remaining Pending</div>
                  <div style={{ ...styles.miniValue, color: "#b45309" }}>
                    ₹{(paymentModalSalary.balanceAmount !== undefined ? Number(paymentModalSalary.balanceAmount) : Math.max(0, Number(paymentModalSalary.netAmount) - Number(paymentModalSalary.paidAmount || 0))).toLocaleString()}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitPayment} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={styles.inputLabel}>Payment Amount (₹) *</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        const bal = paymentModalSalary.balanceAmount !== undefined ? Number(paymentModalSalary.balanceAmount) : Math.max(0, Number(paymentModalSalary.netAmount) - Number(paymentModalSalary.paidAmount || 0));
                        setPayAmount(bal);
                      }}
                      style={{ background: "none", border: "none", color: "#0f766e", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                    >
                      Fill Full Balance
                    </button>
                  </div>
                  <input 
                    type="number" 
                    step="any" 
                    required 
                    style={{ ...styles.modalInput, fontSize: "16px", fontWeight: 700 }}
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={styles.inputLabel}>Payment Method</label>
                    <select style={styles.modalInput} value={payMode} onChange={e => setPayMode(e.target.value)}>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                      <option value="UPI">UPI (GPay/PhonePe/Paytm)</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Payment Date</label>
                    <input type="date" style={styles.modalInput} value={payDate} onChange={e => setPayDate(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label style={styles.inputLabel}>Reference No / UTR / Transaction ID (Optional)</label>
                  <input 
                    placeholder="e.g. UTR-987654321, Chq #1209" 
                    style={styles.modalInput} 
                    value={payRefNo} 
                    onChange={e => setPayRefNo(e.target.value)} 
                  />
                </div>

                <div>
                  <label style={styles.inputLabel}>Notes / Remarks (Optional)</label>
                  <input 
                    placeholder="e.g. Weekly advance settlement, Paid at site" 
                    style={styles.modalInput} 
                    value={payNotes} 
                    onChange={e => setPayNotes(e.target.value)} 
                  />
                </div>

                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setPaymentModalSalary(null)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.confirmBtn} disabled={isSubmittingPayment}>
                    {isSubmittingPayment ? "Recording..." : `Confirm Payment of ₹${payAmount}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Worker Ledger / Hisab-Kitab Modal */}
        {ledgerWorkerId && (
          <div style={styles.modalOverlay}>
            <div style={{ ...styles.modalContent, maxWidth: "850px" }}>
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={styles.modalTitle}>Worker Ledger & Hisab-Kitab</h2>
                  <p style={styles.modalSub}>
                    {ledgerData?.worker?.fullName} ({ledgerData?.worker?.workerId}) • {ledgerData?.worker?.site?.name || "Unassigned"}
                  </p>
                </div>
                <button onClick={() => { setLedgerWorkerId(null); setLedgerData(null); }} style={styles.closeBtn}>&times;</button>
              </div>

              {loadingLedger ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.spinner}></div>
                  <p>Loading full financial statement...</p>
                </div>
              ) : ledgerData ? (
                <div>
                  {/* Ledger Summary */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
                    <div style={styles.miniCard}>
                      <div style={styles.miniLabel}>Total Salary Earned</div>
                      <div style={styles.miniValue}>₹{ledgerData.summary.totalEarned.toLocaleString()}</div>
                    </div>
                    <div style={styles.miniCard}>
                      <div style={styles.miniLabel}>Total Disbursed (Paid)</div>
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

                  {/* Transaction Table */}
                  <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHead}>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Type</th>
                          <th style={styles.th}>Particulars / Description</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>Earned (Cr)</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>Paid (Dr)</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerData.ledger.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                              No transactions recorded yet.
                            </td>
                          </tr>
                        ) : (
                          ledgerData.ledger.map(t => (
                            <tr key={t.id} style={styles.tr}>
                              <td style={styles.td}>
                                {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={styles.td}>
                                <span style={{
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  background: t.type === 'SALARY_CREDIT' ? '#dcfce7' : t.type === 'PAYMENT' ? '#dbeafe' : '#fee2e2',
                                  color: t.type === 'SALARY_CREDIT' ? '#15803d' : t.type === 'PAYMENT' ? '#1d4ed8' : '#b91c1c'
                                }}>
                                  {t.type}
                                </span>
                              </td>
                              <td style={styles.td}>
                                <div style={{ fontWeight: 600, color: "#0f172a" }}>{t.title}</div>
                                <div style={{ fontSize: "12px", color: "#64748b" }}>{t.description}</div>
                              </td>
                              <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: t.credit > 0 ? "#16a34a" : "#94a3b8" }}>
                                {t.credit > 0 ? `+₹${t.credit.toLocaleString()}` : "-"}
                              </td>
                              <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: t.debit > 0 ? "#2563eb" : "#94a3b8" }}>
                                {t.debit > 0 ? `-₹${t.debit.toLocaleString()}` : "-"}
                              </td>
                              <td style={{ ...styles.td, textAlign: "right", fontWeight: 800, color: "#0f172a" }}>
                                ₹{t.runningBalance.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                    <button 
                      onClick={() => { setLedgerWorkerId(null); setLedgerData(null); }} 
                      style={styles.cancelBtn}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

      </div>

      {printSalary && <PayslipPrint salary={printSalary} />}
    </MainLayout>
  );
}

const styles = {
  container: { padding: "32px", maxWidth: "1400px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "30px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
  headerActions: { display: "flex", gap: "12px", alignItems: "center" },
  generateBtn: { display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)", height: "42px" },
  exportBtn: { display: "flex", alignItems: "center", gap: "8px", background: "#fff", color: "#334155", border: "1px solid #cbd5e1", padding: "10px 18px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", height: "42px" },
  
  filterCard: { background: "#fff", padding: "18px 22px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", marginBottom: "20px" },
  filterRow: { display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" },
  controlGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#f8fafc", minWidth: "130px" },
  periodTabs: { display: "flex", gap: "4px", background: "#f1f5f9", padding: "3px", borderRadius: "8px" },
  periodTab: { border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", transition: "all 0.15s ease" },
  searchWrap: { display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 10px", height: "38px" },
  searchInput: { border: "none", background: "transparent", outline: "none", fontSize: "13px", width: "100%" },

  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" },
  kpiCard: { background: "#fff", padding: "18px 22px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" },
  kpiLabel: { fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
  kpiValue: { fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "6px 0 2px 0" },
  kpiSub: { fontSize: "12px", color: "#94a3b8" },

  tableCard: { background: "#fff", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  tableHead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "14px 16px", fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.15s ease" },
  td: { padding: "14px 16px", verticalAlign: "middle", fontSize: "13px" },
  avatar: { width: "32px", height: "32px", borderRadius: "50%", background: "#f0fdf4", color: "#166534", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700" },
  typeBadge: { display: "inline-block", background: "#e0f2fe", color: "#0369a1", padding: "2px 7px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 },
  statusPaid: { background: "#dcfce7", color: "#166534", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
  statusPartial: { background: "#fef3c7", color: "#92400e", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
  statusPending: { background: "#fee2e2", color: "#991b1b", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
  
  payBtn: { display: "inline-flex", alignItems: "center", gap: "4px", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" },
  printBtn: { display: "inline-flex", alignItems: "center", gap: "4px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  ledgerBtn: { display: "inline-flex", alignItems: "center", gap: "4px", background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", color: "#64748b" },
  spinner: { width: "32px", height: "32px", border: "3px solid #f1f5f9", borderTop: "3px solid #0f766e", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "16px" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", textAlign: "center" },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#334155", margin: "16px 0 8px 0" },
  emptyDesc: { color: "#64748b", margin: "0 auto", maxWidth: "500px", fontSize: "14px", lineHeight: "1.5" },

  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modalContent: { background: "#fff", borderRadius: "18px", padding: "28px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  modalTitle: { fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0" },
  modalSub: { fontSize: "13px", color: "#64748b", margin: 0 },
  closeBtn: { background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8" },
  inputLabel: { fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "6px", display: "block" },
  modalInput: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#f8fafc", boxSizing: "border-box" },
  infoBox: { display: "flex", gap: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: "10px" },
  modalActions: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "10px" },
  cancelBtn: { padding: "10px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: "600", cursor: "pointer", fontSize: "13px" },
  confirmBtn: { padding: "10px 22px", borderRadius: "8px", border: "none", background: "#0f766e", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px" },

  miniCard: { background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" },
  miniLabel: { fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" },
  miniValue: { fontSize: "16px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }
};
