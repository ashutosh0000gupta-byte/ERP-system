import React, { useState, useEffect, useMemo, useCallback } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  TrendingUp,
  Calendar,
  CreditCard,
  Users,
  Download,
  Search,
  Filter,
  RefreshCw,
  HardHat,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowDownToLine,
  Building2,
  FileText
} from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ReportsPage() {
  const currentDate = new Date();
  const [selectedReport, setSelectedReport] = useState("payroll");
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [selectedSite, setSelectedSite] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [sites, setSites] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null); // 'excel' | 'csv' | null
  const [errorMsg, setErrorMsg] = useState("");

  // Report configuration metadata
  const REPORT_CARDS = [
    {
      id: "payroll",
      title: "Monthly Payroll Summary",
      subtitle: "Gross pay, advances deducted, overtime & net salary per worker",
      icon: <FileSpreadsheet size={22} color="#0f766e" />,
      color: "#0f766e",
      bg: "#f0fdfa",
      border: "#ccfbf1"
    },
    {
      id: "attendance",
      title: "Worker Attendance Log",
      subtitle: "Daily punches, present/absent status, overtime hours & site tags",
      icon: <Calendar size={22} color="#0284c7" />,
      color: "#0284c7",
      bg: "#f0f9ff",
      border: "#bae6fd"
    },
    {
      id: "expenses",
      title: "Site Expenses Audit",
      subtitle: "Itemized expenditures by site, category, receipt logs & recorder",
      icon: <TrendingUp size={22} color="#e11d48" />,
      color: "#e11d48",
      bg: "#fff1f2",
      border: "#fecdd3"
    },
    {
      id: "advances",
      title: "Advances & Deductions",
      subtitle: "Worker cash advances, recovery status, deduction dates & balances",
      icon: <CreditCard size={22} color="#7c3aed" />,
      color: "#7c3aed",
      bg: "#f5f3ff",
      border: "#ddd6fe"
    },
    {
      id: "workers",
      title: "Worker Master Roster",
      subtitle: "Complete labor registry, trade, wage rates, payment frequencies & sites",
      icon: <Users size={22} color="#d97706" />,
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a"
    }
  ];

  // Fetch available sites on mount
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await api.get("/snmr/sites");
        const list = Array.isArray(res.data) ? res.data : [];
        setSites(list);
      } catch (err) {
        console.error("Failed to load sites", err);
      }
    };
    fetchSites();
  }, []);

  // Fetch report data whenever parameters change
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      let endpoint = "";
      const params = {};

      if (selectedSite !== "all") {
        params.siteId = selectedSite;
      }

      if (selectedReport === "payroll") {
        endpoint = "/snmr/salaries";
        params.month = month;
        params.year = year;
        if (statusFilter !== "all") params.status = statusFilter;
      } else if (selectedReport === "attendance") {
        endpoint = "/snmr/attendance";
        params.month = month;
        params.year = year;
        if (statusFilter !== "all") params.status = statusFilter;
      } else if (selectedReport === "expenses") {
        endpoint = "/snmr/expenses";
        params.month = month;
        params.year = year;
        if (statusFilter !== "all") params.category = statusFilter;
      } else if (selectedReport === "advances") {
        endpoint = "/snmr/advances";
        params.month = month;
        params.year = year;
        if (statusFilter !== "all") params.isDeducted = statusFilter;
      } else if (selectedReport === "workers") {
        endpoint = "/snmr/workers";
        if (statusFilter !== "all") params.status = statusFilter;
      }

      const queryString = new URLSearchParams(params).toString();
      const url = `${endpoint}${queryString ? `?${queryString}` : ""}`;
      const res = await api.get(url);

      const items = Array.isArray(res.data) ? res.data : [];
      setReportData(items);
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      setErrorMsg(err.response?.data?.error || err.message || "Unable to load report data.");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedReport, month, year, selectedSite, statusFilter]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Client-side search filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return reportData;
    const q = searchQuery.toLowerCase().trim();

    return reportData.filter((item) => {
      if (selectedReport === "payroll") {
        const name = (item.worker?.fullName || "").toLowerCase();
        const wid = (item.worker?.workerId || "").toLowerCase();
        const site = (item.worker?.site?.name || "").toLowerCase();
        const trade = (item.worker?.skillTrade || "").toLowerCase();
        const st = (item.status || "").toLowerCase();
        return name.includes(q) || wid.includes(q) || site.includes(q) || trade.includes(q) || st.includes(q);
      }
      if (selectedReport === "attendance") {
        const name = (item.worker?.fullName || "").toLowerCase();
        const wid = (item.worker?.workerId || "").toLowerCase();
        const site = (item.site?.name || "").toLowerCase();
        const st = (item.status || "").toLowerCase();
        const remarks = (item.remarks || "").toLowerCase();
        return name.includes(q) || wid.includes(q) || site.includes(q) || st.includes(q) || remarks.includes(q);
      }
      if (selectedReport === "expenses") {
        const cat = (item.category || "").toLowerCase();
        const desc = (item.description || "").toLowerCase();
        const site = (item.site?.name || "").toLowerCase();
        const rec = (item.recordedBy || "").toLowerCase();
        return cat.includes(q) || desc.includes(q) || site.includes(q) || rec.includes(q);
      }
      if (selectedReport === "advances") {
        const name = (item.worker?.fullName || "").toLowerCase();
        const wid = (item.worker?.workerId || "").toLowerCase();
        const site = (item.site?.name || "").toLowerCase();
        const reason = (item.reason || "").toLowerCase();
        return name.includes(q) || wid.includes(q) || site.includes(q) || reason.includes(q);
      }
      if (selectedReport === "workers") {
        const name = (item.fullName || "").toLowerCase();
        const wid = (item.workerId || "").toLowerCase();
        const trade = (item.skillTrade || "").toLowerCase();
        const site = (item.site?.name || "").toLowerCase();
        const mob = (item.mobileNumber || "").toLowerCase();
        return name.includes(q) || wid.includes(q) || trade.includes(q) || site.includes(q) || mob.includes(q);
      }
      return true;
    });
  }, [reportData, searchQuery, selectedReport]);

  // Aggregate KPI metrics based on current active data
  const metrics = useMemo(() => {
    if (selectedReport === "payroll") {
      let totalGross = 0;
      let totalNet = 0;
      let totalAdvanceDeducted = 0;
      let paidCount = 0;
      let pendingCount = 0;

      filteredData.forEach((s) => {
        totalGross += Number(s.grossAmount || 0);
        totalNet += Number(s.netAmount || 0);
        totalAdvanceDeducted += Number(s.advanceDeducted || 0);
        if (s.status === "Paid") paidCount++;
        else pendingCount++;
      });

      return [
        { label: "Total Net Payroll", value: `₹${totalNet.toLocaleString("en-IN")}`, color: "#0f766e" },
        { label: "Total Gross Wages", value: `₹${totalGross.toLocaleString("en-IN")}`, color: "#334155" },
        { label: "Advances Deducted", value: `₹${totalAdvanceDeducted.toLocaleString("en-IN")}`, color: "#7c3aed" },
        { label: "Disbursed / Pending", value: `${paidCount} Paid / ${pendingCount} Due`, color: "#0284c7" }
      ];
    }

    if (selectedReport === "attendance") {
      let presentCount = 0;
      let halfDayCount = 0;
      let absentCount = 0;
      let otTotalHours = 0;

      filteredData.forEach((a) => {
        if (a.status === "Present") presentCount++;
        else if (a.status === "Half Day") halfDayCount++;
        else if (a.status === "Absent") absentCount++;
        otTotalHours += Number(a.otHours || 0);
      });

      return [
        { label: "Total Logs", value: filteredData.length, color: "#0284c7" },
        { label: "Full Present Days", value: presentCount, color: "#16a34a" },
        { label: "Half Days / Absent", value: `${halfDayCount} / ${absentCount}`, color: "#e11d48" },
        { label: "Total OT Hours", value: `${otTotalHours.toFixed(1)} hrs`, color: "#d97706" }
      ];
    }

    if (selectedReport === "expenses") {
      let totalExp = 0;
      filteredData.forEach((e) => {
        totalExp += Number(e.amount || 0);
      });

      return [
        { label: "Total Site Expenses", value: `₹${totalExp.toLocaleString("en-IN")}`, color: "#e11d48" },
        { label: "Recorded Vouchers", value: filteredData.length, color: "#0284c7" },
        { label: "Period Scope", value: `${MONTH_NAMES[month - 1]} ${year}`, color: "#0f766e" },
        { label: "Active Project", value: selectedSite === "all" ? "All Sites" : (sites.find(s => s.id === selectedSite)?.name || "Selected"), color: "#7c3aed" }
      ];
    }

    if (selectedReport === "advances") {
      let totalDisbursed = 0;
      let deductedAmount = 0;
      let pendingAmount = 0;

      filteredData.forEach((a) => {
        const amt = Number(a.amount || 0);
        totalDisbursed += amt;
        if (a.isDeducted) deductedAmount += amt;
        else pendingAmount += amt;
      });

      return [
        { label: "Total Advances Disbursed", value: `₹${totalDisbursed.toLocaleString("en-IN")}`, color: "#7c3aed" },
        { label: "Recovered via Payroll", value: `₹${deductedAmount.toLocaleString("en-IN")}`, color: "#16a34a" },
        { label: "Pending Recovery", value: `₹${pendingAmount.toLocaleString("en-IN")}`, color: "#e11d48" },
        { label: "Total Advance Slips", value: filteredData.length, color: "#0284c7" }
      ];
    }

    if (selectedReport === "workers") {
      const activeCount = filteredData.filter((w) => w.status === "Active").length;
      const inactiveCount = filteredData.length - activeCount;
      const trades = new Set(filteredData.map((w) => w.skillTrade || "General")).size;

      return [
        { label: "Total Workforce", value: filteredData.length, color: "#d97706" },
        { label: "Active Workers", value: activeCount, color: "#16a34a" },
        { label: "Exited / Inactive", value: inactiveCount, color: "#64748b" },
        { label: "Distinct Trades", value: trades, color: "#0284c7" }
      ];
    }

    return [];
  }, [selectedReport, filteredData, month, year, selectedSite, sites]);

  // Transform data into formatted export rows
  const getExportRows = () => {
    if (selectedReport === "payroll") {
      return filteredData.map((s, idx) => ({
        "Sr No": idx + 1,
        "Worker ID": s.worker?.workerId || "-",
        "Worker Name": s.worker?.fullName || "-",
        "Trade / Skill": s.worker?.skillTrade || "-",
        "Site / Project": s.worker?.site?.name || "Unassigned",
        "Month": MONTH_NAMES[(s.month || month) - 1],
        "Year": s.year || year,
        "Salary Type": s.salaryType || s.worker?.salaryType || "Daily",
        "Wage Rate (₹)": Number(s.rateApplied || s.dailyWage || 0),
        "Present Days": Number(s.presentDays || 0),
        "OT Hours": Number(s.otHours || 0),
        "OT Amount (₹)": Number(s.otAmount || 0),
        "Gross Salary (₹)": Number(s.grossAmount || 0),
        "Advance Deducted (₹)": Number(s.advanceDeducted || 0),
        "Net Salary (₹)": Number(s.netAmount || 0),
        "Paid Amount (₹)": Number(s.paidAmount || 0),
        "Balance Due (₹)": Number(s.balanceAmount || 0),
        "Status": s.status || "Pending",
        "Payment Mode": s.paymentMode || "-"
      }));
    }

    if (selectedReport === "attendance") {
      return filteredData.map((a, idx) => ({
        "Sr No": idx + 1,
        "Date": a.date ? new Date(a.date).toLocaleDateString("en-IN") : "-",
        "Worker ID": a.worker?.workerId || "-",
        "Worker Name": a.worker?.fullName || "-",
        "Trade": a.worker?.skillTrade || "-",
        "Site": a.site?.name || "Unassigned",
        "Status": a.status || "Present",
        "OT Hours": Number(a.otHours || 0),
        "Remarks": a.remarks || "-"
      }));
    }

    if (selectedReport === "expenses") {
      return filteredData.map((e, idx) => ({
        "Sr No": idx + 1,
        "Date": e.date ? new Date(e.date).toLocaleDateString("en-IN") : "-",
        "Site": e.site?.name || "Unassigned",
        "Category": e.category || "-",
        "Amount (₹)": Number(e.amount || 0),
        "Description": e.description || "-",
        "Recorded By": e.recordedBy || "-"
      }));
    }

    if (selectedReport === "advances") {
      return filteredData.map((a, idx) => ({
        "Sr No": idx + 1,
        "Date": a.date ? new Date(a.date).toLocaleDateString("en-IN") : "-",
        "Worker ID": a.worker?.workerId || "-",
        "Worker Name": a.worker?.fullName || "-",
        "Site": a.site?.name || "Unassigned",
        "Advance Amount (₹)": Number(a.amount || 0),
        "Recovery Status": a.isDeducted ? "Deducted" : "Pending Recovery",
        "Deduction Date": a.deductedAt ? new Date(a.deductedAt).toLocaleDateString("en-IN") : "-",
        "Reason": a.reason || "-"
      }));
    }

    if (selectedReport === "workers") {
      return filteredData.map((w, idx) => ({
        "Sr No": idx + 1,
        "Worker ID": w.workerId || "-",
        "Full Name": w.fullName || "-",
        "Trade / Skill": w.skillTrade || "-",
        "Site": w.site?.name || "Unassigned",
        "Salary Type": w.salaryType || "Daily",
        "Wage Rate (₹)": Number(w.wageRate || w.dailyWage || 0),
        "Payment Frequency": w.paymentFrequency || "Monthly",
        "Payment Method": w.paymentMethod || "Bank Transfer",
        "Mobile Number": w.mobileNumber || "-",
        "Bank Account": w.bankAccount || "-",
        "Bank Name": w.bankName || "-",
        "IFSC Code": w.ifsc || "-",
        "UAN Number": w.uan || "-",
        "ESI Number": w.esiNumber || "-",
        "Status": w.status || "Active",
        "Joining Date": w.joiningDate ? new Date(w.joiningDate).toLocaleDateString("en-IN") : "-"
      }));
    }

    return [];
  };

  // Export to Excel (.xlsx) using SheetJS
  const handleExportExcel = () => {
    const rows = getExportRows();
    if (!rows.length) {
      alert("No records found to export for the selected filters.");
      return;
    }

    setDownloadingFormat("excel");
    try {
      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Auto-size columns based on header length and content
      const colWidths = Object.keys(rows[0]).map((key) => ({
        wch: Math.max(key.length + 4, 14)
      }));
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      const sheetName = selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1, 28);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const fileName = `SNMR_${selectedReport.toUpperCase()}_REPORT_${MONTH_NAMES[month - 1]}_${year}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Excel generation error:", err);
      alert("Failed to export Excel: " + err.message);
    } finally {
      setDownloadingFormat(null);
    }
  };

  // Export to CSV (.csv)
  const handleExportCSV = () => {
    const rows = getExportRows();
    if (!rows.length) {
      alert("No records found to export for the selected filters.");
      return;
    }

    setDownloadingFormat("csv");
    try {
      const headers = Object.keys(rows[0]);
      const csvLines = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map((header) => {
              const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : "";
              return `"${val.replace(/"/g, '""')}"`;
            })
            .join(",")
        )
      ];

      const csvContent = csvLines.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `SNMR_${selectedReport.toUpperCase()}_REPORT_${MONTH_NAMES[month - 1]}_${year}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV generation error:", err);
      alert("Failed to export CSV: " + err.message);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <MainLayout>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div>
            <div style={styles.badge}>
              <HardHat size={14} color="#0f766e" />
              <span>SNMR FAB INDIA • Workforce & Financial Reporting Hub</span>
            </div>
            <h1 style={styles.title}>Reports & Analytics Center</h1>
            <p style={styles.subtitle}>
              Audit payroll disbursements, worker attendance logs, project expenses, and advance ledgers.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              style={{
                ...styles.actionBtn,
                background: "#f0fdf4",
                color: "#16a34a",
                borderColor: "#bbf7d0"
              }}
              onClick={handleExportExcel}
              disabled={loading || downloadingFormat === "excel"}
              title="Download full report as Microsoft Excel spreadsheet"
            >
              <FileSpreadsheet size={16} />
              <span>{downloadingFormat === "excel" ? "Generating..." : "Export Excel (.xlsx)"}</span>
            </button>

            <button
              style={{
                ...styles.actionBtn,
                background: "#f0f9ff",
                color: "#0284c7",
                borderColor: "#bae6fd"
              }}
              onClick={handleExportCSV}
              disabled={loading || downloadingFormat === "csv"}
              title="Download standard CSV data file"
            >
              <ArrowDownToLine size={16} />
              <span>{downloadingFormat === "csv" ? "Generating..." : "Export CSV"}</span>
            </button>
          </div>
        </div>

        {/* Report Tabs Selector */}
        <div style={styles.reportSelectorGrid}>
          {REPORT_CARDS.map((card) => {
            const isSelected = selectedReport === card.id;
            return (
              <button
                key={card.id}
                style={{
                  ...styles.reportCardBtn,
                  borderColor: isSelected ? card.color : "var(--border, #e2e8f0)",
                  background: isSelected ? card.bg : "#ffffff",
                  boxShadow: isSelected ? `0 4px 12px ${card.color}18` : "0 1px 3px rgba(0,0,0,0.02)"
                }}
                onClick={() => {
                  setSelectedReport(card.id);
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
              >
                <div style={styles.reportCardTop}>
                  <div style={{ ...styles.iconBadge, background: card.bg, borderColor: card.border }}>
                    {card.icon}
                  </div>
                  {isSelected && (
                    <span style={{ ...styles.activeIndicator, background: card.color }}>
                      Active
                    </span>
                  )}
                </div>
                <h3 style={{ ...styles.reportCardTitle, color: isSelected ? card.color : "#0f172a" }}>
                  {card.title}
                </h3>
                <p style={styles.reportCardDesc}>{card.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* KPI Metrics Summary Bar */}
        <div style={styles.metricsBar}>
          {metrics.map((m, idx) => (
            <div key={idx} style={styles.metricItem}>
              <span style={styles.metricLabel}>{m.label}</span>
              <span style={{ ...styles.metricValue, color: m.color }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Filter and Search Control Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.filterRow}>
            {/* Search Box */}
            <div style={styles.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by worker name, ID, trade, site..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button style={styles.clearBtn} onClick={() => setSearchQuery("")}>
                  ×
                </button>
              )}
            </div>

            {/* Month Selector (if applicable) */}
            {selectedReport !== "workers" && (
              <div style={styles.selectWrap}>
                <label style={styles.selectLabel}>Month</label>
                <select
                  style={styles.select}
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={i + 1} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Year Selector (if applicable) */}
            {selectedReport !== "workers" && (
              <div style={styles.selectWrap}>
                <label style={styles.selectLabel}>Year</label>
                <select
                  style={styles.select}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Site / Project Selector */}
            <div style={styles.selectWrap}>
              <label style={styles.selectLabel}>Site / Project</label>
              <select
                style={styles.select}
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
              >
                <option value="all">All Sites & Projects</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Contextual Status / Category Filter */}
            {selectedReport === "payroll" && (
              <div style={styles.selectWrap}>
                <label style={styles.selectLabel}>Pay Status</label>
                <select
                  style={styles.select}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
            )}

            {selectedReport === "attendance" && (
              <div style={styles.selectWrap}>
                <label style={styles.selectLabel}>Attendance</label>
                <select
                  style={styles.select}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Punches</option>
                  <option value="Present">Present</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            )}

            {selectedReport === "expenses" && (
              <div style={styles.selectWrap}>
                <label style={styles.selectLabel}>Category</label>
                <select
                  style={styles.select}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Material">Material</option>
                  <option value="Transport">Transport</option>
                  <option value="Petty Cash">Petty Cash</option>
                  <option value="Food">Food / Refreshment</option>
                </select>
              </div>
            )}

            {selectedReport === "advances" && (
              <div style={styles.selectWrap}>
                <label style={styles.selectLabel}>Recovery</label>
                <select
                  style={styles.select}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Advances</option>
                  <option value="false">Pending Recovery</option>
                  <option value="true">Deducted via Salary</option>
                </select>
              </div>
            )}

            {selectedReport === "workers" && (
              <div style={styles.selectWrap}>
                <label style={styles.selectLabel}>Worker Status</label>
                <select
                  style={styles.select}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Workers</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive / Exited</option>
                </select>
              </div>
            )}

            {/* Refresh Button */}
            <button
              style={styles.refreshBtn}
              onClick={fetchReportData}
              disabled={loading}
              title="Refresh data from server"
            >
              <RefreshCw size={15} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} color="#ef4444" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Live Data Preview Section */}
        <div style={styles.tableCard}>
          <div style={styles.tableCardHeader}>
            <div>
              <h2 style={styles.tableCardTitle}>
                {REPORT_CARDS.find((r) => r.id === selectedReport)?.title}
              </h2>
              <p style={styles.tableCardMeta}>
                Showing <strong>{filteredData.length}</strong> matching records
                {selectedReport !== "workers" && (
                  <span>
                    {" "}for <strong>{MONTH_NAMES[month - 1]} {year}</strong>
                  </span>
                )}
                {selectedSite !== "all" && (
                  <span>
                    {" "}at <strong>{sites.find((s) => s.id === selectedSite)?.name || "Selected Site"}</strong>
                  </span>
                )}
              </p>
            </div>

            <div style={styles.exportQuickBtns}>
              <button
                style={{ ...styles.quickExportBtn, color: "#16a34a" }}
                onClick={handleExportExcel}
                disabled={loading || !filteredData.length}
              >
                <Download size={14} /> Download Excel (.xlsx)
              </button>
              <button
                style={{ ...styles.quickExportBtn, color: "#0284c7" }}
                onClick={handleExportCSV}
                disabled={loading || !filteredData.length}
              >
                <Download size={14} /> Download CSV
              </button>
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingBox}>
              <RefreshCw size={28} color="#0f766e" style={{ animation: "spin 1s linear infinite" }} />
              <p style={styles.loadingText}>Fetching accurate records from database...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div style={styles.emptyBox}>
              <FileText size={42} color="#cbd5e1" />
              <h3 style={styles.emptyTitle}>No Records Found</h3>
              <p style={styles.emptyDesc}>
                No data matched your selected criteria for this period or site. Try selecting another month, site, or clear the search query.
              </p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadRow}>
                    <th style={styles.th}>#</th>
                    {selectedReport === "payroll" && (
                      <>
                        <th style={styles.th}>Worker ID</th>
                        <th style={styles.th}>Employee Name</th>
                        <th style={styles.th}>Trade / Role</th>
                        <th style={styles.th}>Site</th>
                        <th style={styles.thNum}>Days Present</th>
                        <th style={styles.thNum}>Daily Wage</th>
                        <th style={styles.thNum}>Gross Wages</th>
                        <th style={styles.thNum}>Adv. Deducted</th>
                        <th style={styles.thNum}>Net Payable</th>
                        <th style={styles.th}>Status</th>
                      </>
                    )}

                    {selectedReport === "attendance" && (
                      <>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Worker ID</th>
                        <th style={styles.th}>Employee Name</th>
                        <th style={styles.th}>Trade</th>
                        <th style={styles.th}>Assigned Site</th>
                        <th style={styles.th}>Punch Status</th>
                        <th style={styles.thNum}>OT Hours</th>
                        <th style={styles.th}>Remarks</th>
                      </>
                    )}

                    {selectedReport === "expenses" && (
                      <>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Site / Project</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.thNum}>Amount</th>
                        <th style={styles.th}>Description</th>
                        <th style={styles.th}>Recorded By</th>
                      </>
                    )}

                    {selectedReport === "advances" && (
                      <>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Worker ID</th>
                        <th style={styles.th}>Employee Name</th>
                        <th style={styles.th}>Site</th>
                        <th style={styles.thNum}>Advance Amount</th>
                        <th style={styles.th}>Recovery Status</th>
                        <th style={styles.th}>Reason</th>
                      </>
                    )}

                    {selectedReport === "workers" && (
                      <>
                        <th style={styles.th}>Worker ID</th>
                        <th style={styles.th}>Full Name</th>
                        <th style={styles.th}>Skill / Trade</th>
                        <th style={styles.th}>Current Site</th>
                        <th style={styles.th}>Wage Type</th>
                        <th style={styles.thNum}>Rate</th>
                        <th style={styles.th}>Mobile Number</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Joined Date</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredData.slice(0, 100).map((row, idx) => (
                    <tr key={row.id || idx} style={styles.tr}>
                      <td style={styles.tdDim}>{idx + 1}</td>

                      {selectedReport === "payroll" && (
                        <>
                          <td style={styles.tdCode}>{row.worker?.workerId || "-"}</td>
                          <td style={styles.tdBold}>{row.worker?.fullName || "-"}</td>
                          <td style={styles.td}>{row.worker?.skillTrade || "-"}</td>
                          <td style={styles.td}>{row.worker?.site?.name || "Unassigned"}</td>
                          <td style={styles.tdNum}>{Number(row.presentDays || 0)}</td>
                          <td style={styles.tdNum}>₹{Number(row.rateApplied || row.dailyWage || 0).toLocaleString("en-IN")}</td>
                          <td style={styles.tdNum}>₹{Number(row.grossAmount || 0).toLocaleString("en-IN")}</td>
                          <td style={{ ...styles.tdNum, color: "#e11d48" }}>
                            ₹{Number(row.advanceDeducted || 0).toLocaleString("en-IN")}
                          </td>
                          <td style={{ ...styles.tdNum, fontWeight: 700, color: "#0f766e" }}>
                            ₹{Number(row.netAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                ...(row.status === "Paid" ? styles.badgePaid : styles.badgePending)
                              }}
                            >
                              {row.status || "Pending"}
                            </span>
                          </td>
                        </>
                      )}

                      {selectedReport === "attendance" && (
                        <>
                          <td style={styles.td}>
                            {row.date ? new Date(row.date).toLocaleDateString("en-IN") : "-"}
                          </td>
                          <td style={styles.tdCode}>{row.worker?.workerId || "-"}</td>
                          <td style={styles.tdBold}>{row.worker?.fullName || "-"}</td>
                          <td style={styles.td}>{row.worker?.skillTrade || "-"}</td>
                          <td style={styles.td}>{row.site?.name || "Unassigned"}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                ...(row.status === "Present"
                                  ? styles.badgePresent
                                  : row.status === "Half Day"
                                  ? styles.badgeHalfDay
                                  : styles.badgeAbsent)
                              }}
                            >
                              {row.status || "Present"}
                            </span>
                          </td>
                          <td style={styles.tdNum}>
                            {Number(row.otHours || 0) > 0 ? `${Number(row.otHours)} hrs` : "-"}
                          </td>
                          <td style={styles.tdDim}>{row.remarks || "-"}</td>
                        </>
                      )}

                      {selectedReport === "expenses" && (
                        <>
                          <td style={styles.td}>
                            {row.date ? new Date(row.date).toLocaleDateString("en-IN") : "-"}
                          </td>
                          <td style={styles.tdBold}>{row.site?.name || "Unassigned"}</td>
                          <td style={styles.td}>
                            <span style={styles.categoryBadge}>{row.category}</span>
                          </td>
                          <td style={{ ...styles.tdNum, fontWeight: 700, color: "#e11d48" }}>
                            ₹{Number(row.amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td style={styles.td}>{row.description || "-"}</td>
                          <td style={styles.tdDim}>{row.recordedBy || "-"}</td>
                        </>
                      )}

                      {selectedReport === "advances" && (
                        <>
                          <td style={styles.td}>
                            {row.date ? new Date(row.date).toLocaleDateString("en-IN") : "-"}
                          </td>
                          <td style={styles.tdCode}>{row.worker?.workerId || "-"}</td>
                          <td style={styles.tdBold}>{row.worker?.fullName || "-"}</td>
                          <td style={styles.td}>{row.site?.name || "Unassigned"}</td>
                          <td style={{ ...styles.tdNum, fontWeight: 700, color: "#7c3aed" }}>
                            ₹{Number(row.amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                ...(row.isDeducted ? styles.badgePaid : styles.badgePending)
                              }}
                            >
                              {row.isDeducted ? "Deducted" : "Pending Recovery"}
                            </span>
                          </td>
                          <td style={styles.tdDim}>{row.reason || "-"}</td>
                        </>
                      )}

                      {selectedReport === "workers" && (
                        <>
                          <td style={styles.tdCode}>{row.workerId || "-"}</td>
                          <td style={styles.tdBold}>{row.fullName || "-"}</td>
                          <td style={styles.td}>{row.skillTrade || "-"}</td>
                          <td style={styles.td}>{row.site?.name || "Unassigned"}</td>
                          <td style={styles.td}>{row.salaryType || "Daily"}</td>
                          <td style={styles.tdNum}>
                            ₹{Number(row.wageRate || row.dailyWage || 0).toLocaleString("en-IN")}
                          </td>
                          <td style={styles.tdDim}>{row.mobileNumber || "-"}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                ...(row.status === "Active" ? styles.badgePresent : styles.badgeDim)
                              }}
                            >
                              {row.status || "Active"}
                            </span>
                          </td>
                          <td style={styles.tdDim}>
                            {row.joiningDate ? new Date(row.joiningDate).toLocaleDateString("en-IN") : "-"}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length > 100 && (
                <div style={styles.tableFooter}>
                  Showing first 100 rows in preview. Full dataset of {filteredData.length} records will be included when exporting to Excel or CSV.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

const styles = {
  container: {
    padding: "28px 36px",
    maxWidth: "1440px",
    margin: "0 auto",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#0f172a"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px"
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#f0fdfa",
    color: "#0f766e",
    border: "1px solid #ccfbf1",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "8px"
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 6px 0",
    letterSpacing: "-0.5px"
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    maxWidth: "680px",
    lineHeight: "1.5"
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: "10px",
    border: "1px solid transparent",
    fontSize: "13.5px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
  },
  reportSelectorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginBottom: "24px"
  },
  reportCardBtn: {
    padding: "16px",
    borderRadius: "14px",
    border: "2px solid",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none"
  },
  reportCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px"
  },
  iconBadge: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  activeIndicator: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#ffffff",
    padding: "2px 7px",
    borderRadius: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  reportCardTitle: {
    margin: "0 0 6px 0",
    fontSize: "15px",
    fontWeight: "700",
    letterSpacing: "-0.2px"
  },
  reportCardDesc: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b",
    lineHeight: "1.4"
  },
  metricsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
    background: "#f8fafc",
    padding: "16px 20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0"
  },
  metricItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  metricLabel: {
    fontSize: "11.5px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  metricValue: {
    fontSize: "19px",
    fontWeight: "800",
    letterSpacing: "-0.3px"
  },
  toolbar: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px 18px",
    marginBottom: "22px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
  },
  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "flex-end"
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "0 12px",
    height: "38px",
    flex: "1 1 240px",
    minWidth: "220px"
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "13px",
    width: "100%",
    color: "#0f172a"
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "16px",
    cursor: "pointer",
    padding: "0 4px"
  },
  selectWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  selectLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.4px"
  },
  select: {
    height: "38px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    background: "#f8fafc",
    color: "#334155",
    fontWeight: "500",
    outline: "none",
    cursor: "pointer"
  },
  refreshBtn: {
    height: "38px",
    padding: "0 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.15s"
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "13.5px",
    marginBottom: "20px"
  },
  tableCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0,0,0,0.03)"
  },
  tableCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 24px",
    borderBottom: "1px solid #f1f5f9",
    flexWrap: "wrap",
    gap: "12px"
  },
  tableCardTitle: {
    margin: "0 0 4px 0",
    fontSize: "17px",
    fontWeight: "800",
    color: "#0f172a"
  },
  tableCardMeta: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b"
  },
  exportQuickBtns: {
    display: "flex",
    gap: "8px"
  },
  quickExportBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "1px solid #e2e8f0",
    padding: "6px 12px",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer"
  },
  loadingBox: {
    padding: "60px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px"
  },
  loadingText: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0
  },
  emptyBox: {
    padding: "60px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px"
  },
  emptyTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#334155",
    margin: "8px 0 0 0"
  },
  emptyDesc: {
    fontSize: "13.5px",
    color: "#64748b",
    maxWidth: "460px",
    margin: 0,
    lineHeight: "1.5"
  },
  tableWrapper: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px"
  },
  theadRow: {
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0"
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "11.5px",
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  thNum: {
    padding: "12px 16px",
    textAlign: "right",
    fontSize: "11.5px",
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.15s"
  },
  td: {
    padding: "13px 16px",
    color: "#334155"
  },
  tdBold: {
    padding: "13px 16px",
    fontWeight: "600",
    color: "#0f172a"
  },
  tdCode: {
    padding: "13px 16px",
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#0f766e"
  },
  tdDim: {
    padding: "13px 16px",
    color: "#64748b",
    fontSize: "12.5px"
  },
  tdNum: {
    padding: "13px 16px",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums"
  },
  statusBadge: {
    display: "inline-block",
    padding: "3px 9px",
    borderRadius: "6px",
    fontSize: "11.5px",
    fontWeight: "700",
    letterSpacing: "0.2px"
  },
  badgePaid: {
    background: "#dcfce7",
    color: "#15803d"
  },
  badgePending: {
    background: "#fef3c7",
    color: "#b45309"
  },
  badgePresent: {
    background: "#dcfce7",
    color: "#15803d"
  },
  badgeHalfDay: {
    background: "#ffedd5",
    color: "#c2410c"
  },
  badgeAbsent: {
    background: "#fee2e2",
    color: "#b91c1c"
  },
  badgeDim: {
    background: "#f1f5f9",
    color: "#64748b"
  },
  categoryBadge: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600"
  },
  tableFooter: {
    padding: "12px 20px",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    fontSize: "12px",
    color: "#64748b",
    textAlign: "center"
  }
};
