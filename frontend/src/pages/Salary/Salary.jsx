import React, { useState, useEffect, useRef } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import * as XLSX from "xlsx";
import { 
  Wallet, Search, Play, Check, X, Calendar, AlertCircle, 
  Download, Printer, Filter, CreditCard, BookOpen, Clock, 
  ArrowUpRight, ArrowDownLeft, ChevronRight, RefreshCw, FileText,
  Lock, Unlock, Upload, FileSpreadsheet, Sparkles, CheckCircle2, HelpCircle,
  Sliders, Edit3
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

  // Monthly Excel Import Modal & State
  const [allWorkers, setAllWorkers] = useState([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMonth, setImportMonth] = useState(new Date().getMonth() + 1);
  const [importYear, setImportYear] = useState(new Date().getFullYear());
  const [importSiteId, setImportSiteId] = useState("all");
  const [importFileName, setImportFileName] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);
  const [importError, setImportError] = useState("");

  // Edit Salary & Statutory Deductions Modal
  const [editingSalary, setEditingSalary] = useState(null);
  const [editPf, setEditPf] = useState(0);
  const [editEsic, setEditEsic] = useState(0);
  const [editConveyance, setEditConveyance] = useState(0);
  const [editAdvance, setEditAdvance] = useState(0);
  const [editOther, setEditOther] = useState(0);
  const [editGross, setEditGross] = useState(0);
  const [editNotes, setEditNotes] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  useEffect(() => {
    fetchSites();
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await api.get("/snmr/workers");
      setAllWorkers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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

  const isMonthLocked = salaries.length > 0 && salaries.every(s => s.isLocked);

  const handleToggleMonthLock = async () => {
    try {
      const newLockState = !isMonthLocked;
      const confirmMsg = newLockState
        ? `Are you sure you want to LOCK all payroll records for this period? Once locked, historical records are protected against modifications.`
        : `Are you sure you want to UNLOCK payroll records for this period?`;
      if (!window.confirm(confirmMsg)) return;

      await api.post("/snmr/salaries/lock-month", { month, year, isLocked: newLockState });
      alert(`Payroll records have been ${newLockState ? "LOCKED" : "UNLOCKED"} successfully.`);
      fetchSalaries();
    } catch (err) {
      alert("Failed to update lock status: " + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleSingleLock = async (salaryId, currentStatus) => {
    try {
      await api.put(`/snmr/salaries/${salaryId}/lock`, { isLocked: !currentStatus });
      fetchSalaries();
    } catch (err) {
      alert("Failed to toggle record lock: " + (err.response?.data?.error || err.message));
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
      "OT Hours", "OT Amount", "Conveyance Allowance", "Gross Amount", "Advance Deducted", "PF Deducted", "ESIC Deducted",
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
      s.conveyanceAllowance || 0,
      s.grossAmount,
      s.advanceDeducted,
      s.pfDeducted || 0,
      s.esicDeducted || 0,
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

  const handleOpenEditModal = (sal) => {
    setEditingSalary(sal);
    setEditPf(sal.pfDeducted !== undefined ? Number(sal.pfDeducted) : 0);
    setEditEsic(sal.esicDeducted !== undefined ? Number(sal.esicDeducted) : 0);
    setEditConveyance(sal.conveyanceAllowance !== undefined ? Number(sal.conveyanceAllowance) : 0);
    setEditAdvance(sal.advanceDeducted !== undefined ? Number(sal.advanceDeducted) : 0);
    setEditOther(sal.otherDeductions !== undefined ? Number(sal.otherDeductions) : 0);
    setEditGross(sal.grossAmount !== undefined ? Number(sal.grossAmount) : 0);
    setEditNotes(sal.notes || "");
  };

  const handleSaveSalaryEdit = async (e) => {
    e.preventDefault();
    if (!editingSalary) return;
    setIsSubmittingEdit(true);
    try {
      await api.put(`/snmr/salaries/${editingSalary.id}`, {
        grossAmount: Number(editGross || 0),
        conveyanceAllowance: Number(editConveyance || 0),
        pfDeducted: Number(editPf || 0),
        esicDeducted: Number(editEsic || 0),
        advanceDeducted: Number(editAdvance || 0),
        otherDeductions: Number(editOther || 0),
        notes: editNotes
      });
      alert("Worker salary, conveyance allowance & deductions updated successfully!");
      setEditingSalary(null);
      fetchSalaries();
    } catch (err) {
      console.error("Failed to update salary deductions", err);
      alert(err.response?.data?.error || "Failed to update salary details.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handlePreviewRowChange = (idx, field, val) => {
    setParsedRows(prev => {
      const updated = [...prev];
      const row = { ...updated[idx], [field]: val };

      const days = Number(row.presentDays || 0);
      const rate = Number(row.wageRate || 0);
      const otH = Number(row.otHours || 0);
      const conveyance = Number(row.conveyanceAllowance || 0);
      const pf = Number(row.pfDeducted || 0);
      const esic = Number(row.esicDeducted || 0);
      const adv = Number(row.advanceDeducted || 0);
      const other = Number(row.otherDeductions || 0);
      const allow = Number(row.allowances || 0);
      const paid = Number(row.paidAmount || 0);

      let grossFromDays = 0;
      if (row.salaryType === "Daily") grossFromDays = days * rate;
      else if (row.salaryType === "Monthly") grossFromDays = (rate / 26) * days;
      else if (row.salaryType === "Weekly") grossFromDays = (rate / 6) * days;
      else if (row.salaryType === "Hourly") grossFromDays = days * 8 * rate;
      else grossFromDays = days * rate;

      const otAmt = otH * (rate / 8);
      const gross = Math.round((grossFromDays + otAmt + conveyance + allow) * 100) / 100;
      const totalDed = adv + pf + esic + other;
      const net = Math.max(0, Math.round((gross - totalDed) * 100) / 100);
      const bal = Math.max(0, Math.round((net - paid) * 100) / 100);

      row.otAmount = Math.round(otAmt * 100) / 100;
      row.grossAmount = gross;
      row.netAmount = net;
      row.balanceAmount = bal;

      updated[idx] = row;
      return updated;
    });
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "Worker ID",
      "Worker Name",
      "Site Name",
      "Salary Type",
      "Wage Rate",
      "Present Days",
      "OT Hours",
      "Conveyance Allowance",
      "EPF (PF)",
      "ESIC",
      "Advance Kharcha",
      "Other Allowances",
      "Other Deductions",
      "Paid Amount",
      "Payment Mode",
      "Notes"
    ];

    let sampleData = [];
    if (allWorkers.length > 0) {
      sampleData = allWorkers.map(w => [
        w.workerId || "",
        w.fullName || "",
        w.site?.name || "",
        w.salaryType || "Daily",
        Number(w.wageRate || w.dailyWage || 500),
        26,
        0,
        0, // Conveyance Allowance
        0, // EPF
        0, // ESIC
        0, // Advance
        0, // Other Allowances
        0, // Other Deductions
        0, // Paid Amount
        w.paymentMethod || "Bank Transfer",
        "Monthly Attendance"
      ]);
    } else {
      sampleData = [
        ["WRK-001", "Ramesh Kumar", "Site Alpha", "Daily", 600, 26, 8, 1000, 1200, 250, 1500, 0, 0, 0, "Bank Transfer", "Sample worker"],
        ["WRK-002", "Suresh Yadav", "Site Alpha", "Daily", 550, 24.5, 4, 800, 1100, 230, 1000, 0, 0, 0, "Cash", "Sample worker"],
        ["WRK-003", "Mahesh Verma", "Site Beta", "Daily", 700, 27, 12, 1200, 1400, 300, 2000, 500, 0, 0, "UPI", "Sample worker"]
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    ws["!cols"] = [
      { wch: 14 },
      { wch: 22 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 22 }, // Conveyance Allowance
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 16 },
      { wch: 25 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monthly_Payroll");
    XLSX.writeFile(wb, `SNMR_Monthly_Payroll_Template_${importMonth}_${importYear}.xlsx`);
  };

  const handleExcelFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setIsParsingExcel(true);
    setImportError("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rawRows || rawRows.length === 0) {
          setImportError("The uploaded Excel sheet is empty. Please enter worker data and try again.");
          setIsParsingExcel(false);
          return;
        }

        const normalizeKey = (k) => String(k || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const parsed = [];

        for (let rIndex = 0; rIndex < rawRows.length; rIndex++) {
          const row = rawRows[rIndex];
          const keys = Object.keys(row);
          const getVal = (possibleKeys) => {
            for (const pk of possibleKeys) {
              const matchedKey = keys.find(k => normalizeKey(k) === normalizeKey(pk));
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== "") {
                return row[matchedKey];
              }
            }
            return null;
          };

          const workerId = String(getVal(["workerId", "worker_id", "id", "code", "empid", "wrkid"]) || "").trim();
          const fullName = String(getVal(["fullName", "name", "workerName", "worker_name", "labourName", "naam"]) || "").trim();
          const siteName = String(getVal(["siteName", "site", "sitename", "location"]) || "").trim();
          const salaryType = String(getVal(["salaryType", "type"]) || "Daily").trim();
          const wageRate = Number(getVal(["wageRate", "dailyWage", "rate", "wage", "rozanarate"]) || 0);

          let presentDays = 0;
          let otHours = 0;

          const explicitDays = getVal(["presentDays", "days", "totalDays", "attendedDays", "haziri", "attendance", "pdays"]);
          if (explicitDays !== null && explicitDays !== "") {
            presentDays = Number(explicitDays) || 0;
          } else {
            let countedPresent = 0;
            for (let d = 1; d <= 31; d++) {
              const dVal = String(row[d] !== undefined ? row[d] : (row[`D${d}`] || row[`Day${d}`] || "")).trim().toUpperCase();
              if (dVal === "P" || dVal === "PRESENT" || dVal === "1") countedPresent += 1;
              else if (dVal === "HD" || dVal === "HALF" || dVal === "0.5") countedPresent += 0.5;
            }
            if (countedPresent > 0) {
              presentDays = countedPresent;
            }
          }

          const explicitOt = getVal(["otHours", "ot", "overtime", "overtimehours", "othr"]);
          otHours = Number(explicitOt || 0);

          const conveyanceAllowance = Number(getVal([
            "conveyanceAllowance",
            "conveyanceAllowances",
            "conveyance_allowance",
            "conveyance_allowances",
            "conveyance",
            "conveyances",
            "travelallowance",
            "travel_allowance",
            "ta"
          ]) || 0);

          const pfDeducted = Number(getVal(["pfDeducted", "epfDeducted", "pf", "epf", "epfpf", "providentfund"]) || 0);
          const esicDeducted = Number(getVal(["esicDeducted", "esiDeducted", "esic", "esi", "stateinsurance"]) || 0);
          const advanceDeducted = Number(getVal(["advanceDeducted", "advance", "kharcha", "adv", "advancetaken"]) || 0);
          const allowances = Number(getVal(["otherAllowances", "allowances", "allowance", "bonus", "extra"]) || 0);
          const otherDeductions = Number(getVal(["otherDeductions", "deductions", "deduction", "room", "mess"]) || 0);
          const paidAmount = Number(getVal(["paidAmount", "paid", "amountpaid"]) || 0);
          const paymentMode = String(getVal(["paymentMode", "paymentMethod", "mode"]) || "Bank Transfer").trim();
          const notes = String(getVal(["notes", "remarks"]) || "").trim();

          if (!fullName && !workerId) continue;

          const rate = wageRate > 0 ? wageRate : 500;
          let grossFromDays = 0;
          if (salaryType === "Daily") grossFromDays = presentDays * rate;
          else if (salaryType === "Monthly") grossFromDays = (rate / 26) * presentDays;
          else if (salaryType === "Weekly") grossFromDays = (rate / 6) * presentDays;
          else if (salaryType === "Hourly") grossFromDays = presentDays * 8 * rate;
          else grossFromDays = presentDays * rate;

          const otRate = rate / 8;
          const otAmount = otHours * otRate;
          const gross = Math.round((grossFromDays + otAmount + conveyanceAllowance + allowances) * 100) / 100;
          const totalDed = advanceDeducted + pfDeducted + esicDeducted + otherDeductions;
          const net = Math.max(0, Math.round((gross - totalDed) * 100) / 100);
          const balance = Math.max(0, Math.round((net - paidAmount) * 100) / 100);

          parsed.push({
            workerId: workerId || "Auto-assign",
            fullName: fullName || (workerId ? `Worker ${workerId}` : `Worker ${rIndex + 1}`),
            siteName: siteName || (importSiteId !== "all" ? sites.find(s => s.id === importSiteId)?.name : "Default Site"),
            salaryType,
            wageRate: rate,
            presentDays,
            otHours,
            otAmount,
            conveyanceAllowance,
            pfDeducted,
            esicDeducted,
            advanceDeducted,
            allowances,
            otherDeductions,
            grossAmount: gross,
            netAmount: net,
            paidAmount,
            balanceAmount: balance,
            paymentMode,
            notes
          });
        }

        if (parsed.length === 0) {
          setImportError("No valid worker records found in the sheet. Please check headers (Worker ID, Name, Present Days).");
        } else {
          setParsedRows(parsed);
        }
      } catch (err) {
        console.error("Excel parse failed", err);
        setImportError("Failed to parse Excel file: " + err.message);
      } finally {
        setIsParsingExcel(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) {
      alert("No records to import.");
      return;
    }

    setIsSubmittingImport(true);
    try {
      const payload = {
        month: Number(importMonth),
        year: Number(importYear),
        siteId: importSiteId !== "all" ? importSiteId : null,
        records: parsedRows
      };

      const res = await api.post("/snmr/salaries/import-monthly", payload);
      const data = res.data;

      alert(
        `✅ Monthly Excel Imported & Calculated Successfully!\n\n` +
        `• Workers Processed: ${data.totalProcessed}\n` +
        `• Total Gross Wages: ₹${Number(data.totalGross).toLocaleString('en-IN')}\n` +
        `• Total Advances Deducted: ₹${Number(data.totalAdvances).toLocaleString('en-IN')}\n` +
        `• Total Net Payable: ₹${Number(data.totalNet).toLocaleString('en-IN')}`
      );

      setIsImportModalOpen(false);
      setParsedRows([]);
      setImportFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchSalaries();
    } catch (err) {
      console.error("Import failed", err);
      alert(err.response?.data?.error || "Failed to import and calculate monthly salaries.");
    } finally {
      setIsSubmittingImport(false);
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
            <button style={styles.importExcelBtn} onClick={() => setIsImportModalOpen(true)}>
              <FileSpreadsheet size={16} /> Upload Monthly Excel
            </button>
            <button style={styles.generateBtn} onClick={handleOpenGenerateModal}>
              <Play size={16} /> Generate Payroll
            </button>
            <button style={styles.exportBtn} onClick={handleExportCSV} disabled={salaries.length === 0}>
              <Download size={16} /> Export Excel
            </button>
            <button 
              style={{
                ...styles.exportBtn, 
                background: isMonthLocked ? "#fef2f2" : "#f8fafc", 
                color: isMonthLocked ? "#b91c1c" : "#334155", 
                borderColor: isMonthLocked ? "#fca5a5" : "#cbd5e1"
              }} 
              onClick={handleToggleMonthLock}
              disabled={salaries.length === 0}
              title={isMonthLocked ? "Unlock payroll records" : "Lock month payroll against any modifications"}
            >
              {isMonthLocked ? <Lock size={16} color="#b91c1c" /> : <Unlock size={16} color="#64748b" />}
              <span>{isMonthLocked ? "Locked Month" : "Lock Month"}</span>
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
                    <th style={styles.th}>Advance / Statutory</th>
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
                        <td style={styles.td}>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>₹{Number(s.grossAmount).toLocaleString()}</div>
                          {Number(s.conveyanceAllowance || 0) > 0 && (
                            <div style={{ fontSize: "11px", marginTop: "3px" }}>
                              <span style={{ background: "#ecfeff", color: "#0891b2", padding: "1px 5px", borderRadius: "4px", fontWeight: 700 }}>
                                Conv: ₹{Number(s.conveyanceAllowance).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          <div style={{ color: Number(s.advanceDeducted) > 0 ? "#e11d48" : "#94a3b8", fontWeight: 600 }}>
                            {Number(s.advanceDeducted) > 0 ? `-₹${Number(s.advanceDeducted).toLocaleString()}` : "Adv: ₹0"}
                          </div>
                          {(Number(s.pfDeducted) > 0 || Number(s.esicDeducted) > 0) && (
                            <div style={{ fontSize: "11px", marginTop: "3px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
                              {Number(s.pfDeducted) > 0 && (
                                <span style={{ background: "#f3e8ff", color: "#6b21a8", padding: "1px 5px", borderRadius: "4px", fontWeight: 700 }}>
                                  PF: ₹{Number(s.pfDeducted).toLocaleString()}
                                </span>
                              )}
                              {Number(s.esicDeducted) > 0 && (
                                <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "1px 5px", borderRadius: "4px", fontWeight: 700 }}>
                                  ESI: ₹{Number(s.esicDeducted).toLocaleString()}
                                </span>
                              )}
                            </div>
                          )}
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
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {isPaid ? (
                              <span style={styles.statusPaid}>Paid</span>
                            ) : isPartial ? (
                              <span style={styles.statusPartial}>Partial</span>
                            ) : (
                              <span style={styles.statusPending}>Pending</span>
                            )}
                            {s.isLocked && (
                              <span title="Locked / Protected record" style={{ display: "inline-flex", alignItems: "center", color: "#b91c1c" }}>
                                <Lock size={12} />
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                            <button 
                              onClick={() => handleOpenEditModal(s)} 
                              style={{
                                ...styles.ledgerBtn,
                                color: "#0f766e",
                                background: "#f0fdf4",
                                border: "1px solid #bbf7d0"
                              }}
                              disabled={s.isLocked}
                              title={s.isLocked ? "Record is locked" : "Edit EPF, ESIC, Advances & Salary"}
                            >
                              <Sliders size={13} /> Edit EPF/ESIC
                            </button>
                            <button 
                              onClick={() => handleOpenPaymentModal(s)} 
                              style={{
                                ...styles.payBtn,
                                background: balance <= 0 || s.isLocked ? "#f1f5f9" : "#0f766e",
                                color: balance <= 0 || s.isLocked ? "#64748b" : "#fff",
                                cursor: balance <= 0 || s.isLocked ? "default" : "pointer"
                              }}
                              disabled={s.isLocked && balance <= 0}
                              title={s.isLocked ? "Record is locked" : "Record full or partial payout"}
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
                            <button 
                              onClick={() => handleToggleSingleLock(s.id, s.isLocked)} 
                              style={{
                                ...styles.ledgerBtn,
                                color: s.isLocked ? "#b91c1c" : "#64748b",
                                background: s.isLocked ? "#fee2e2" : "#f1f5f9"
                              }}
                              title={s.isLocked ? "Unlock this record" : "Lock this record against edits"}
                            >
                              {s.isLocked ? <Lock size={13} /> : <Unlock size={13} />}
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

        {/* Monthly Excel Upload & Auto-Calculation Modal */}
        {isImportModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={{ ...styles.modalContent, maxWidth: "1050px" }}>
              <div style={styles.modalHeader}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h2 style={styles.modalTitle}>Upload Monthly Excel & Auto-Calculate</h2>
                    <span style={{ background: "#dcfce7", color: "#166534", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "12px", border: "1px solid #86efac" }}>
                      Auto-Calculation Active
                    </span>
                  </div>
                  <p style={styles.modalSub}>
                    Daily haziri manually dalne ki zaroorat nahi hai. Mahine ki sheet upload karein — sabhi din, overtime, kharcha aur salary apne aap calculate ho jayegi.
                  </p>
                </div>
                <button 
                  onClick={() => { setIsImportModalOpen(false); setParsedRows([]); setImportFileName(""); setImportError(""); }} 
                  style={styles.closeBtn}
                >
                  &times;
                </button>
              </div>

              {/* Step 1: Period Selection & Download Template */}
              <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-end", flexWrap: "wrap" }}>
                    <div>
                      <label style={styles.inputLabel}>Payroll Month</label>
                      <select 
                        style={{ ...styles.modalInput, width: "140px", background: "#fff" }} 
                        value={importMonth} 
                        onChange={e => setImportMonth(Number(e.target.value))}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString('en', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={styles.inputLabel}>Year</label>
                      <input 
                        type="number" 
                        style={{ ...styles.modalInput, width: "100px", background: "#fff" }} 
                        value={importYear} 
                        onChange={e => setImportYear(Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <label style={styles.inputLabel}>Target Site (Optional)</label>
                      <select 
                        style={{ ...styles.modalInput, width: "200px", background: "#fff" }} 
                        value={importSiteId} 
                        onChange={e => setImportSiteId(e.target.value)}
                      >
                        <option value="all">Use Site from Excel (or All)</option>
                        {sites.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <button 
                      type="button" 
                      onClick={handleDownloadTemplate} 
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        background: "#fff", color: "#0f766e", border: "1.5px solid #0f766e",
                        padding: "9px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "700",
                        cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
                      }}
                      title="Download template pre-filled with your current workers"
                    >
                      <Download size={15} /> Download Sample Template (.xlsx)
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Upload Drop Area */}
              <div 
                style={{
                  border: "2px dashed " + (importFileName ? "#86efac" : "#cbd5e1"),
                  borderRadius: "14px",
                  padding: "24px",
                  textAlign: "center",
                  background: importFileName ? "#f0fdf4" : "#f8fafc",
                  marginBottom: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".xlsx, .xls, .csv" 
                  style={{ display: "none" }} 
                  onChange={handleExcelFileChange} 
                />
                <FileSpreadsheet size={40} color={importFileName ? "#16a34a" : "#64748b"} style={{ margin: "0 auto 8px" }} />
                {importFileName ? (
                  <div>
                    <div style={{ fontWeight: 800, color: "#166534", fontSize: "15px" }}>Selected File: {importFileName}</div>
                    <div style={{ fontSize: "12px", color: "#15803d", marginTop: "4px" }}>Click to choose a different Excel file</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "15px" }}>
                      Click to upload your Monthly Excel sheet (.xlsx, .xls, .csv)
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                      Supports summary sheets (Present Days, OT, Advance) or muster roll sheets (Day 1–31 columns).
                    </div>
                  </div>
                )}
              </div>

              {isParsingExcel && (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                  <div style={styles.spinner}></div>
                  <span>Parsing Excel & calculating wages...</span>
                </div>
              )}

              {importError && (
                <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: "8px", border: "1px solid #fecaca", marginBottom: "16px", fontSize: "13px" }}>
                  <strong>Error:</strong> {importError}
                </div>
              )}

              {/* Step 3: Calculated Preview & Summaries */}
              {parsedRows.length > 0 && (
                <div>
                  {/* Summary Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                    <div style={styles.miniCard}>
                      <div style={styles.miniLabel}>Total Workers</div>
                      <div style={styles.miniValue}>{parsedRows.length}</div>
                    </div>
                    <div style={styles.miniCard}>
                      <div style={styles.miniLabel}>Total Present Days</div>
                      <div style={{ ...styles.miniValue, color: "#0369a1" }}>
                        {parsedRows.reduce((acc, r) => acc + Number(r.presentDays || 0), 0)}
                      </div>
                    </div>
                    <div style={styles.miniCard}>
                      <div style={styles.miniLabel}>Total Gross Wages</div>
                      <div style={{ ...styles.miniValue, color: "#0f172a" }}>
                        ₹{parsedRows.reduce((acc, r) => acc + Number(r.grossAmount || 0), 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ ...styles.miniCard, background: "#ecfeff", borderColor: "#a5f3fc" }}>
                      <div style={{ ...styles.miniLabel, color: "#0e7490" }}>Conveyance Allowance</div>
                      <div style={{ ...styles.miniValue, color: "#0891b2" }}>
                        ₹{parsedRows.reduce((acc, r) => acc + Number(r.conveyanceAllowance || 0), 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ ...styles.miniCard, background: "#faf5ff", borderColor: "#e9d5ff" }}>
                      <div style={{ ...styles.miniLabel, color: "#7e22ce" }}>Total EPF (PF)</div>
                      <div style={{ ...styles.miniValue, color: "#9333ea" }}>
                        ₹{parsedRows.reduce((acc, r) => acc + Number(r.pfDeducted || 0), 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ ...styles.miniCard, background: "#eef2ff", borderColor: "#c7d2fe" }}>
                      <div style={{ ...styles.miniLabel, color: "#3730a3" }}>Total ESIC</div>
                      <div style={{ ...styles.miniValue, color: "#4f46e5" }}>
                        ₹{parsedRows.reduce((acc, r) => acc + Number(r.esicDeducted || 0), 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={styles.miniCard}>
                      <div style={styles.miniLabel}>Advances Deducted</div>
                      <div style={{ ...styles.miniValue, color: "#e11d48" }}>
                        ₹{parsedRows.reduce((acc, r) => acc + Number(r.advanceDeducted || 0), 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ ...styles.miniCard, background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                      <div style={{ ...styles.miniLabel, color: "#166534" }}>Total Net Payable</div>
                      <div style={{ ...styles.miniValue, color: "#15803d" }}>
                        ₹{parsedRows.reduce((acc, r) => acc + Number(r.netAmount || 0), 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Preview Table with in-table live editing */}
                  <div style={{ maxHeight: "380px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "20px" }}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHead}>
                          <th style={styles.th}>Worker</th>
                          <th style={styles.th}>Site</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>Days</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>Daily Rate</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>OT (Hrs)</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>Gross Wages</th>
                          <th style={{ ...styles.th, textAlign: "right", color: "#0891b2" }}>Conveyance (₹)</th>
                          <th style={{ ...styles.th, textAlign: "right", color: "#6b21a8" }}>EPF / PF (₹)</th>
                          <th style={{ ...styles.th, textAlign: "right", color: "#3730a3" }}>ESIC (₹)</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>Advance Deducted</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>Net Payable</th>
                          <th style={styles.th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.map((row, idx) => (
                          <tr key={idx} style={styles.tr}>
                            <td style={styles.td}>
                              <div style={{ fontWeight: 600, color: "#0f172a" }}>{row.fullName}</div>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>{row.workerId}</div>
                            </td>
                            <td style={styles.td}>{row.siteName || "Unassigned"}</td>
                            <td style={{ ...styles.td, textAlign: "right" }}>
                              <input 
                                type="number"
                                min="0"
                                max="31"
                                step="0.5"
                                style={{ width: "55px", padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", textAlign: "right", fontSize: "12px", background: "#fff", fontWeight: 700 }}
                                value={row.presentDays}
                                onChange={e => handlePreviewRowChange(idx, "presentDays", e.target.value)}
                                title="Change attended days"
                              />
                            </td>
                            <td style={{ ...styles.td, textAlign: "right" }}>₹{row.wageRate}</td>
                            <td style={{ ...styles.td, textAlign: "right" }}>{row.otHours > 0 ? `${row.otHours}h (+₹${row.otAmount})` : "-"}</td>
                            <td style={{ ...styles.td, textAlign: "right", fontWeight: 700 }}>₹{row.grossAmount.toLocaleString('en-IN')}</td>
                            <td style={{ ...styles.td, textAlign: "right" }}>
                              <input 
                                type="number"
                                min="0"
                                style={{ width: "70px", padding: "4px 6px", borderRadius: "6px", border: "1.5px solid #a5f3fc", textAlign: "right", fontSize: "12px", background: "#f0fdfa", fontWeight: 700, color: "#0891b2" }}
                                value={row.conveyanceAllowance}
                                onChange={e => handlePreviewRowChange(idx, "conveyanceAllowance", e.target.value)}
                                title="Edit Conveyance Allowance"
                              />
                            </td>
                            <td style={{ ...styles.td, textAlign: "right" }}>
                              <input 
                                type="number"
                                min="0"
                                style={{ width: "70px", padding: "4px 6px", borderRadius: "6px", border: "1.5px solid #d8b4fe", textAlign: "right", fontSize: "12px", background: "#faf5ff", fontWeight: 700, color: "#6b21a8" }}
                                value={row.pfDeducted}
                                onChange={e => handlePreviewRowChange(idx, "pfDeducted", e.target.value)}
                                title="Edit EPF (PF) deduction"
                              />
                            </td>
                            <td style={{ ...styles.td, textAlign: "right" }}>
                              <input 
                                type="number"
                                min="0"
                                style={{ width: "70px", padding: "4px 6px", borderRadius: "6px", border: "1.5px solid #c7d2fe", textAlign: "right", fontSize: "12px", background: "#eef2ff", fontWeight: 700, color: "#3730a3" }}
                                value={row.esicDeducted}
                                onChange={e => handlePreviewRowChange(idx, "esicDeducted", e.target.value)}
                                title="Edit ESIC deduction"
                              />
                            </td>
                            <td style={{ ...styles.td, textAlign: "right" }}>
                              <input 
                                type="number"
                                min="0"
                                style={{ width: "70px", padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", textAlign: "right", fontSize: "12px", background: "#fff", fontWeight: 700, color: row.advanceDeducted > 0 ? "#e11d48" : "#475569" }}
                                value={row.advanceDeducted}
                                onChange={e => handlePreviewRowChange(idx, "advanceDeducted", e.target.value)}
                                title="Edit Advance / Kharcha deducted"
                              />
                            </td>
                            <td style={{ ...styles.td, textAlign: "right", fontWeight: 800, color: "#16a34a" }}>
                              ₹{row.netAmount.toLocaleString('en-IN')}
                            </td>
                            <td style={styles.td}>
                              <span style={row.balanceAmount === 0 && row.netAmount > 0 ? styles.statusPaid : (row.paidAmount > 0 ? styles.statusPartial : styles.statusPending)}>
                                {row.balanceAmount === 0 && row.netAmount > 0 ? "Paid" : (row.paidAmount > 0 ? "Partial" : "Pending")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={styles.modalActions}>
                    <button 
                      type="button" 
                      onClick={() => { setIsImportModalOpen(false); setParsedRows([]); setImportFileName(""); }} 
                      style={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={handleExecuteImport} 
                      style={{ ...styles.confirmBtn, background: "#15803d" }} 
                      disabled={isSubmittingImport}
                    >
                      {isSubmittingImport ? "Saving & Calculating..." : `Confirm & Save All (${parsedRows.length} Workers)`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit EPF, ESIC & Salary Deductions Modal */}
        {editingSalary && (
          <div style={styles.modalOverlay}>
            <div style={{ ...styles.modalContent, maxWidth: "580px" }}>
              <div style={styles.modalHeader}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Sliders size={20} color="#0f766e" />
                    <h2 style={styles.modalTitle}>Edit EPF, ESIC & Deductions</h2>
                  </div>
                  <p style={styles.modalSub}>
                    {editingSalary.worker?.fullName} ({editingSalary.worker?.workerId}) • {editingSalary.month}/{editingSalary.year}
                  </p>
                </div>
                <button onClick={() => setEditingSalary(null)} style={styles.closeBtn}>&times;</button>
              </div>

              <form onSubmit={handleSaveSalaryEdit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Info Card */}
                <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Site</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{editingSalary.worker?.site?.name || "Unassigned"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Attendance</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{editingSalary.presentDays} Days (OT: {editingSalary.otHours || 0} hrs)</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={styles.inputLabel}>Gross Wages (₹)</label>
                    <input 
                      type="number"
                      step="any"
                      min="0"
                      style={styles.modalInput}
                      value={editGross}
                      onChange={e => setEditGross(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ ...styles.inputLabel, color: "#0891b2", fontWeight: 700 }}>
                      Conveyance Allowance (₹)
                    </label>
                    <input 
                      type="number"
                      step="any"
                      min="0"
                      style={{ ...styles.modalInput, border: "1.5px solid #a5f3fc", background: "#f0fdfa", fontWeight: 700, color: "#0891b2" }}
                      value={editConveyance}
                      onChange={e => setEditConveyance(e.target.value)}
                      placeholder="e.g. 1000"
                    />
                    <span style={{ fontSize: "11px", color: "#0891b2" }}>Travel / Conveyance allowance</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ ...styles.inputLabel, color: "#6b21a8", fontWeight: 700 }}>
                      EPF / PF Deduction (₹)
                    </label>
                    <input 
                      type="number"
                      step="any"
                      min="0"
                      style={{ ...styles.modalInput, border: "1.5px solid #c084fc", background: "#faf5ff", fontWeight: 700, color: "#6b21a8" }}
                      value={editPf}
                      onChange={e => setEditPf(e.target.value)}
                      placeholder="e.g. 1800"
                    />
                    <span style={{ fontSize: "11px", color: "#9333ea" }}>Har worker ka EPF alag ho sakta hai</span>
                  </div>
                  <div>
                    <label style={{ ...styles.inputLabel, color: "#3730a3", fontWeight: 700 }}>
                      ESIC Deduction (₹)
                    </label>
                    <input 
                      type="number"
                      step="any"
                      min="0"
                      style={{ ...styles.modalInput, border: "1.5px solid #818cf8", background: "#eef2ff", fontWeight: 700, color: "#3730a3" }}
                      value={editEsic}
                      onChange={e => setEditEsic(e.target.value)}
                      placeholder="e.g. 150"
                    />
                    <span style={{ fontSize: "11px", color: "#4f46e5" }}>State Insurance deduction</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={styles.inputLabel}>Advance / Kharcha Deducted (₹)</label>
                    <input 
                      type="number"
                      step="any"
                      min="0"
                      style={styles.modalInput}
                      value={editAdvance}
                      onChange={e => setEditAdvance(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Other Deductions (Mess, Room, etc.) (₹)</label>
                    <input 
                      type="number"
                      step="any"
                      min="0"
                      style={styles.modalInput}
                      value={editOther}
                      onChange={e => setEditOther(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={styles.inputLabel}>Remarks / Notes</label>
                  <input 
                    type="text"
                    style={styles.modalInput}
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="e.g. Conveyance allowance & EPF adjusted"
                  />
                </div>

                {/* Live Calculation Box */}
                {(() => {
                  const g = Number(editGross || 0);
                  const p = Number(editPf || 0);
                  const es = Number(editEsic || 0);
                  const a = Number(editAdvance || 0);
                  const o = Number(editOther || 0);
                  const pTax = Number(editingSalary.professionalTax || 0);
                  const net = Math.max(0, Math.round((g - p - es - a - o - pTax) * 100) / 100);
                  const paid = Number(editingSalary.paidAmount || 0);
                  const bal = Math.max(0, Math.round((net - paid) * 100) / 100);

                  return (
                    <div style={{ background: "#ecfdf5", border: "1.5px solid #a7f3d0", padding: "14px 18px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "12px", color: "#065f46", fontWeight: 700 }}>Recalculated Net Payable</div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#047857" }}>₹{net.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: "11px", color: "#059669" }}>
                          Total Deductions: ₹{(p + es + a + o + pTax).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Balance Pending</div>
                        <div style={{ fontSize: "18px", fontWeight: 800, color: bal > 0 ? "#d97706" : "#16a34a" }}>
                          ₹{bal.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>Already Paid: ₹{paid.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  );
                })()}

                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setEditingSalary(null)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" style={{ ...styles.confirmBtn, background: "#0f766e" }} disabled={isSubmittingEdit}>
                    {isSubmittingEdit ? "Saving Changes..." : "Save & Update Salary"}
                  </button>
                </div>
              </form>
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
  importExcelBtn: { display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)", height: "42px" },
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
