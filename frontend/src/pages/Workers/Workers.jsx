import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { Users, Search, Plus, X, Briefcase, MapPin, IndianRupee, HardHat, Printer, UploadCloud, Download, ShieldCheck, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';
import WorkerIdCard from "../../components/shared/WorkerIdCard";

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "supervisors" | "workers"
  const [tradeFilter, setTradeFilter] = useState("all");
  const [siteFilter, setSiteFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [printWorker, setPrintWorker] = useState(null);
  const fileInputRef = React.useRef(null);
  
  const [formData, setFormData] = useState({
    workerId: "",
    fullName: "",
    skillTrade: "",
    salaryType: "Daily",
    dailyWage: "",
    wageRate: "",
    paymentFrequency: "Monthly",
    otRatePerHour: "",
    paymentMethod: "Bank Transfer",
    paymentDay: "",
    joiningDate: new Date().toISOString().split("T")[0],
    siteId: "",
    bankName: "",
    bankAccount: "",
    ifsc: "",
    mobileNumber: "",
    currentAddress: ""
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
      const isStaff = /supervisor|incharge|in-charge|engineer|foreman/i.test(formData.skillTrade || "");
      const rateVal = formData.wageRate ? parseFloat(formData.wageRate) : (formData.dailyWage ? parseFloat(formData.dailyWage) : 0);
      const payload = {
        ...formData,
        category: isStaff ? "Supervisor" : "Worker",
        dailyWage: rateVal,
        wageRate: rateVal,
        salaryType: formData.salaryType || "Daily",
        paymentFrequency: formData.paymentFrequency || "Monthly",
        paymentMethod: formData.paymentMethod || "Bank Transfer",
        paymentDay: formData.paymentDay || null,
        otRatePerHour: formData.otRatePerHour ? parseFloat(formData.otRatePerHour) : 0
      };
      // Format date for Prisma
      if (payload.joiningDate) {
        payload.joiningDate = new Date(payload.joiningDate).toISOString();
      }
      // Remove empty optional fields
      if (!payload.siteId) delete payload.siteId;
      if (!payload.bankName) delete payload.bankName;
      if (!payload.bankAccount) delete payload.bankAccount;
      if (!payload.ifsc) delete payload.ifsc;
      if (!payload.mobileNumber) delete payload.mobileNumber;
      if (!payload.currentAddress) delete payload.currentAddress;
      if (!payload.skillTrade) delete payload.skillTrade;

      const res = await api.post("/snmr/workers", payload);
      
      // If we assigned a site, attach the site object for immediate display
      if (payload.siteId) {
        res.data.site = sites.find(s => s.id === payload.siteId);
      }
      
      setWorkers([res.data, ...workers]);
      setIsModalOpen(false);
      setFormData({
        workerId: "",
        fullName: "",
        skillTrade: "",
        salaryType: "Daily",
        dailyWage: "",
        wageRate: "",
        paymentFrequency: "Monthly",
        otRatePerHour: "",
        paymentMethod: "Bank Transfer",
        paymentDay: "",
        joiningDate: new Date().toISOString().split("T")[0],
        siteId: "",
        bankName: "",
        bankAccount: "",
        ifsc: "",
        mobileNumber: "",
        currentAddress: ""
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
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        // Robust value extractor with case/whitespace/punctuation stripping
        const getVal = (row, aliases) => {
          const keys = Object.keys(row);
          for (const alias of aliases) {
            const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
            for (const key of keys) {
              const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (cleanKey === cleanAlias) {
                const val = row[key];
                if (val !== undefined && val !== null) {
                  const str = val.toString().trim();
                  if (str.length > 0 && str.toUpperCase() !== "NA" && str.toUpperCase() !== "N/A" && str.toLowerCase() !== "null") {
                    return str;
                  }
                }
              }
            }
          }
          return "";
        };

        const parsedWorkers = [];
        for (const row of rows) {
          const workerId = getVal(row, ["Worker ID", "ID", "WorkerID", "Emp ID", "worker_id", "emp_id"]);
          const name = getVal(row, ["Name", "Full Name", "Worker Name", "Employee Name", "name", "full_name"]);
          const siteName = getVal(row, ["Site", "Site Name", "Location", "Project", "site"]) || "Unassigned";
          
          const rawDailyWage = getVal(row, ["Daily Wage", "DailyWage", "Wage", "Basic", "Rate", "daily_wage"]);
          const dailyWage = parseFloat(rawDailyWage.replace(/[^0-9.]/g, '') || "0") || 0;
          
          const mobileNumber = getVal(row, ["Mobile", "Phone", "Mobile Number", "Contact", "Phone Number", "mobile_number"]);
          const skillTrade = getVal(row, ["Trade", "Skill", "Skill Trade", "Category", "Role", "Designation", "skill_trade"]);
          const fatherName = getVal(row, ["Father Name", "Father's Name", "Father", "father_name"]);
          const address = getVal(row, ["Address", "Current Address", "Permanent Address", "current_address"]);
          const bankName = getVal(row, ["Bank Name", "Bank", "BankName", "bank_name", "Bank Branch"]);
          const bankAccount = getVal(row, ["Bank Account", "Account No", "A/C", "bankAccount", "Account Number", "bank_account"]);
          const ifsc = getVal(row, ["IFSC Code", "IFSC", "ifsc"]);
          const pan = getVal(row, ["PAN", "PAN No", "pan", "PAN Number"]);
          const aadhaar = getVal(row, ["Aadhaar", "Aadhar", "Aadhaar No", "Aadhar No", "UID", "aadhaar"]);
          
          const salaryType = getVal(row, ["Salary Type", "SalaryType", "Wage Type"]) || "Daily";
          const paymentFrequency = getVal(row, ["Pay Frequency", "Payment Frequency", "Frequency"]) || "Weekly";
          const paymentMethod = getVal(row, ["Payment Mode", "Payment Method", "PaymentMode"]) || "Bank Transfer";
          const rawOtRate = getVal(row, ["OT Rate", "Overtime Rate", "OTRate"]);
          const otRatePerHour = parseFloat(rawOtRate.replace(/[^0-9.]/g, '') || "0") || 0;
          
          if (!workerId || !name) continue;
          
          const isStaff = /supervisor|incharge|in-charge|engineer|foreman/i.test(skillTrade);
          const siteMatch = sites.find(s => s.name?.toLowerCase().trim() === siteName.toLowerCase().trim());
          
          parsedWorkers.push({
            workerId,
            fullName: name,
            siteId: siteMatch ? siteMatch.id : null,
            siteName: siteName,
            dailyWage,
            wageRate: dailyWage,
            salaryType,
            paymentFrequency,
            paymentMethod,
            otRatePerHour,
            mobileNumber,
            skillTrade,
            category: isStaff ? "Supervisor" : "Worker",
            fatherName: fatherName || null,
            currentAddress: address || null,
            permanentAddress: address || null,
            bankName: bankName || null,
            bankAccount: bankAccount || null,
            ifsc: ifsc || null,
            pan: pan || null,
            aadhaar: aadhaar || null,
            joiningDate: new Date().toISOString(),
            status: "Active"
          });
        }
        
        if (parsedWorkers.length === 0) {
          return alert("No valid worker rows found in the uploaded file. Ensure 'Worker ID' and 'Name' columns are present.");
        }
        
        setLoading(true);
        const res = await api.post("/snmr/workers/import", { workers: parsedWorkers });
        const resData = res.data;
        if (resData && resData.importedCount !== undefined) {
          alert(`Successfully imported ${resData.importedCount} workers!` + (resData.errorCount > 0 ? ` (${resData.errorCount} skipped/failed)` : ""));
        } else {
          alert(`Successfully imported ${parsedWorkers.length} workers!`);
        }
        fetchWorkersAndSites();
      } catch (error) {
        console.error("Import error:", error);
        const errDetail = error.response?.data?.error || error.response?.data?.message || error.message || "Please check the file format.";
        alert(`Failed to import workers: ${errDetail}`);
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportWorkersExcel = () => {
    try {
      if (!workers || workers.length === 0) {
        return alert("No workers available to export!");
      }

      const exportData = workers.map((w) => ({
        "Worker ID": w.workerId || "",
        "Name": w.fullName || "",
        "Site": w.site?.name || "Unassigned",
        "Daily Wage": w.dailyWage || w.wageRate || 0,
        "Salary Type": w.salaryType || "Daily",
        "Pay Frequency": w.paymentFrequency || "Weekly",
        "Payment Mode": w.paymentMethod || "Bank Transfer",
        "OT Rate": w.otRatePerHour || 0,
        "Mobile": w.mobileNumber || "",
        "Trade": w.skillTrade || "",
        "Category": w.category || (/supervisor|incharge|in-charge|engineer/i.test(w.skillTrade) ? "Supervisor" : "Worker"),
        "Father Name": w.fatherName || "",
        "Address": w.currentAddress || w.permanentAddress || "",
        "Bank Name": w.bankName || "",
        "Bank Account": w.bankAccount || "",
        "IFSC Code": w.ifsc || "",
        "PAN": w.pan || "",
        "Aadhaar": w.aadhaar || "",
        "Status": w.status || "Active"
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      const colWidths = [
        { wch: 14 }, // Worker ID
        { wch: 22 }, // Name
        { wch: 18 }, // Site
        { wch: 12 }, // Daily Wage
        { wch: 12 }, // Salary Type
        { wch: 14 }, // Pay Frequency
        { wch: 16 }, // Payment Mode
        { wch: 10 }, // OT Rate
        { wch: 14 }, // Mobile
        { wch: 18 }, // Trade
        { wch: 14 }, // Category
        { wch: 18 }, // Father Name
        { wch: 24 }, // Address
        { wch: 22 }, // Bank Name
        { wch: 18 }, // Bank Account
        { wch: 14 }, // IFSC Code
        { wch: 14 }, // PAN
        { wch: 16 }, // Aadhaar
        { wch: 10 }  // Status
      ];
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Workers Master");
      
      const fileName = `Workers_List_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export workers: " + err.message);
    }
  };

  const downloadSampleTemplate = () => {
    const defaultSiteName = sites.length > 0 ? sites[0].name : "HCCB Khurda";
    const sampleData = [
      {
        "Worker ID": "SNMR0001",
        "Name": "ANIL SHARMA",
        "Site": defaultSiteName,
        "Daily Wage": 1200,
        "Salary Type": "Daily",
        "Pay Frequency": "Weekly",
        "Payment Mode": "Bank Transfer",
        "OT Rate": 150,
        "Mobile": "9876543210",
        "Trade": "SITE INCHARGE",
        "Father Name": "NA",
        "Address": "NA",
        "Bank Name": "State Bank of India",
        "Bank Account": "37826459225",
        "IFSC Code": "SBIN0006018",
        "PAN": "NA",
        "Aadhaar": "NA"
      },
      {
        "Worker ID": "SNMR0002",
        "Name": "RAJESH VERMA",
        "Site": defaultSiteName,
        "Daily Wage": 1000,
        "Mobile": "9876543211",
        "Trade": "SUPERVISOR",
        "Father Name": "NA",
        "Address": "NA",
        "Bank Name": "Punjab National Bank",
        "Bank Account": "123456789012",
        "IFSC Code": "PUNB0295200",
        "PAN": "NA",
        "Aadhaar": "NA"
      },
      {
        "Worker ID": "SNMR0003",
        "Name": "UPENDRA KUMAR",
        "Site": defaultSiteName,
        "Daily Wage": 836.87,
        "Mobile": "1234569870",
        "Trade": "FITTER",
        "Father Name": "NA",
        "Address": "NA",
        "Bank Name": "Canara Bank",
        "Bank Account": "4588101004320",
        "IFSC Code": "CNRB0004588",
        "PAN": "NA",
        "Aadhaar": "NA"
      },
      {
        "Worker ID": "SNMR0004",
        "Name": "SUBHASH KUMAR",
        "Site": defaultSiteName,
        "Daily Wage": 836.87,
        "Mobile": "1234569870",
        "Trade": "RIGGER",
        "Father Name": "NA",
        "Address": "NA",
        "Bank Name": "Central Bank of India",
        "Bank Account": "2176118485",
        "IFSC Code": "CBIN0281086",
        "PAN": "NA",
        "Aadhaar": "NA"
      },
      {
        "Worker ID": "SNMR0005",
        "Name": "DUDH NATH ROY",
        "Site": defaultSiteName,
        "Daily Wage": 836.87,
        "Mobile": "1234569870",
        "Trade": "WELDER",
        "Father Name": "NA",
        "Address": "NA",
        "Bank Name": "Union Bank of India",
        "Bank Account": "35814047446",
        "IFSC Code": "UBIN0576221",
        "PAN": "NA",
        "Aadhaar": "NA"
      },
      {
        "Worker ID": "SNMR0006",
        "Name": "RAJESH KUMAR",
        "Site": defaultSiteName,
        "Daily Wage": 836.87,
        "Mobile": "1234569870",
        "Trade": "HELPER",
        "Father Name": "NA",
        "Address": "NA",
        "Bank Name": "Bank of Baroda",
        "Bank Account": "6202265865",
        "IFSC Code": "BARB0001234",
        "PAN": "NA",
        "Aadhaar": "NA"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Workers");
    XLSX.writeFile(wb, "Worker_Import_Sample_Template.xlsx");
  };

  useEffect(() => {
    if (printWorker) {
      setTimeout(() => {
        window.print();
        setPrintWorker(null);
      }, 500);
    }
  }, [printWorker]);

  const isSupervisorOrIncharge = (w) => {
    const trade = (w.skillTrade || "").toLowerCase();
    const cat = (w.category || "").toLowerCase();
    return (
      trade.includes("supervisor") ||
      trade.includes("incharge") ||
      trade.includes("in-charge") ||
      trade.includes("ssite incharge") ||
      trade.includes("site incharge") ||
      trade.includes("engineer") ||
      trade.includes("foreman") ||
      cat === "supervisor"
    );
  };

  const supervisorCount = workers.filter(isSupervisorOrIncharge).length;
  const tradesmanCount = workers.filter(w => !isSupervisorOrIncharge(w)).length;
  const availableTrades = Array.from(new Set(workers.map(w => w.skillTrade?.trim()).filter(Boolean)));

  const filteredWorkers = workers.filter(w => {
    if (activeTab === "supervisors" && !isSupervisorOrIncharge(w)) return false;
    if (activeTab === "workers" && isSupervisorOrIncharge(w)) return false;
    if (tradeFilter !== "all" && (w.skillTrade || "").toLowerCase() !== tradeFilter.toLowerCase()) return false;
    if (siteFilter !== "all" && w.siteId !== siteFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = w.fullName?.toLowerCase().includes(q);
      const matchId = w.workerId?.toLowerCase().includes(q);
      const matchTrade = w.skillTrade?.toLowerCase().includes(q);
      const matchBank = w.bankName?.toLowerCase().includes(q) || w.bankAccount?.includes(q);
      const matchSite = w.site?.name?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchTrade && !matchBank && !matchSite) return false;
    }
    return true;
  });

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
            <button 
              id="download-template-btn"
              style={{
                ...styles.createButton, 
                background: "#f0fdf4", 
                color: "#15803d", 
                border: "1.5px solid #86efac",
                boxShadow: "0 2px 8px rgba(34, 197, 94, 0.15)",
                display: "inline-flex",
                alignItems: "center"
              }} 
              onClick={downloadSampleTemplate}
              title="Download pre-formatted Excel template"
            >
              <Download size={18} color="#15803d" />
              <span>Download Template</span>
            </button>
            <button 
              id="export-workers-btn"
              style={{
                ...styles.createButton, 
                background: "#f0f9ff", 
                color: "#0369a1", 
                border: "1.5px solid #bae6fd",
                boxShadow: "0 2px 8px rgba(14, 165, 233, 0.12)",
                display: "inline-flex",
                alignItems: "center"
              }} 
              onClick={handleExportWorkersExcel}
              title="Export all workers to Excel sheet"
            >
              <FileSpreadsheet size={18} color="#0369a1" />
              <span>Export Excel</span>
            </button>
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

        {/* Navigation Tabs for Staff vs Labors */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "18px",
          marginTop: "4px"
        }}>
          {/* Section Tabs */}
          <div style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTab("all")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === "all" ? "#fff" : "transparent",
                color: activeTab === "all" ? "#0f172a" : "#64748b",
                boxShadow: activeTab === "all" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span>All Staff & Labours</span>
              <span style={{ fontSize: "11px", background: activeTab === "all" ? "#e2e8f0" : "#cbd5e1", padding: "2px 6px", borderRadius: "10px" }}>{workers.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("supervisors")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === "supervisors" ? "#fff" : "transparent",
                color: activeTab === "supervisors" ? "#7c3aed" : "#64748b",
                boxShadow: activeTab === "supervisors" ? "0 2px 6px rgba(124, 58, 237, 0.12)" : "none",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <ShieldCheck size={15} color={activeTab === "supervisors" ? "#7c3aed" : "#64748b"} />
              <span>Supervisor & Site Incharge</span>
              <span style={{ fontSize: "11px", background: activeTab === "supervisors" ? "#ede9fe" : "#cbd5e1", color: activeTab === "supervisors" ? "#6d28d9" : "#475569", padding: "2px 6px", borderRadius: "10px" }}>{supervisorCount}</span>
            </button>
            <button
              onClick={() => setActiveTab("workers")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === "workers" ? "#fff" : "transparent",
                color: activeTab === "workers" ? "#0284c7" : "#64748b",
                boxShadow: activeTab === "workers" ? "0 2px 6px rgba(2, 132, 199, 0.12)" : "none",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <HardHat size={15} color={activeTab === "workers" ? "#0284c7" : "#64748b"} />
              <span>Tradesmen & Labors</span>
              <span style={{ fontSize: "11px", background: activeTab === "workers" ? "#e0f2fe" : "#cbd5e1", color: activeTab === "workers" ? "#0369a1" : "#475569", padding: "2px 6px", borderRadius: "10px" }}>{tradesmanCount}</span>
            </button>
          </div>

          {/* Quick Filters: Trade & Site */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={tradeFilter}
              onChange={e => setTradeFilter(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "#fff",
                fontSize: "13px",
                color: "#334155",
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              <option value="all">Filter by Trade / Role (All)</option>
              {availableTrades.map(trade => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
            </select>

            <select
              value={siteFilter}
              onChange={e => setSiteFilter(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "#fff",
                fontSize: "13px",
                color: "#334155",
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              <option value="all">Filter by Site (All)</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
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
              <p style={styles.emptyDesc}>Add workers or import them using Excel to start tracking attendance and wages.</p>
              <div style={{ display: "flex", gap: "12px", marginTop: "16px", justifyContent: "center" }}>
                <button 
                  style={{ ...styles.createButton, background: "#f0fdf4", color: "#15803d", border: "1px solid #86efac" }}
                  onClick={downloadSampleTemplate}
                >
                  <Download size={16} color="#15803d" />
                  <span>Download Excel Template</span>
                </button>
                <button 
                  style={{ ...styles.createButton, background: "#fff", color: "#334155", border: "1px solid #cbd5e1" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud size={16} />
                  <span>Import Excel</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>Worker ID</th>
                    <th style={styles.th}>Full Name</th>
                    <th style={styles.th}>Role / Trade</th>
                    <th style={styles.th}>Bank Details</th>
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
                          <div style={{
                            ...styles.avatar,
                            background: isSupervisorOrIncharge(w) ? "#ede9fe" : "#e0e7ff",
                            color: isSupervisorOrIncharge(w) ? "#7c3aed" : "#4f46e5"
                          }}>
                            {w.fullName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#0f172a" }}>{w.fullName}</div>
                            {w.mobileNumber && <div style={{ fontSize: "12px", color: "#64748b" }}>{w.mobileNumber}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        {isSupervisorOrIncharge(w) ? (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 700,
                            background: "#f5f3ff",
                            color: "#6d28d9",
                            border: "1px solid #ddd6fe"
                          }}>
                            <ShieldCheck size={13} color="#7c3aed" />
                            {w.skillTrade?.toUpperCase() || "SUPERVISOR"}
                          </span>
                        ) : (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: "#f1f5f9",
                            color: "#475569"
                          }}>
                            <HardHat size={12} color="#64748b" />
                            {w.skillTrade || "General Worker"}
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {w.bankName || w.bankAccount ? (
                          <div>
                            <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>
                              {w.bankName || "Bank N/A"}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              A/C: {w.bankAccount || "—"}
                              {w.ifsc ? ` | ${w.ifsc}` : ""}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "13px" }}>Not Provided</span>
                        )}
                      </td>
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
                    <label style={styles.label}>Phone Number</label>
                    <input 
                      style={styles.input} 
                      placeholder="e.g. 9876543210" 
                      value={formData.mobileNumber}
                      onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Address</label>
                    <input 
                      style={styles.input} 
                      placeholder="e.g. 123 Main St, City" 
                      value={formData.currentAddress}
                      onChange={e => setFormData({...formData, currentAddress: e.target.value})}
                    />
                  </div>
                </div>
                
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Skill / Trade / Role</label>
                    <input 
                      list="trade-datalist"
                      style={styles.input} 
                      placeholder="e.g. SITE INCHARGE, SUPERVISOR, FITTER" 
                      value={formData.skillTrade}
                      onChange={e => setFormData({...formData, skillTrade: e.target.value})}
                    />
                    <datalist id="trade-datalist">
                      <option value="SITE INCHARGE" />
                      <option value="SUPERVISOR" />
                      <option value="FITTER" />
                      <option value="RIGGER" />
                      <option value="WELDER" />
                      <option value="HELPER" />
                      <option value="MASON" />
                      <option value="ELECTRICIAN" />
                      <option value="CARPENTER" />
                      <option value="SAFETY OFFICER" />
                      <option value="ENGINEER" />
                      <option value="FOREMAN" />
                    </datalist>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Salary Type</label>
                    <select 
                      style={styles.input}
                      value={formData.salaryType}
                      onChange={e => setFormData({...formData, salaryType: e.target.value})}
                    >
                      <option value="Daily">Daily Wage (Per working day)</option>
                      <option value="Weekly">Weekly Wage (Per week)</option>
                      <option value="Monthly">Monthly Salary (Fixed monthly)</option>
                      <option value="Hourly">Hourly Wage (Per hour)</option>
                      <option value="Contract">Contract-Based Payment</option>
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Wage / Salary Rate (₹) *</label>
                    <input 
                      type="number"
                      step="any"
                      required
                      style={styles.input} 
                      placeholder="e.g. 700 or 18000" 
                      value={formData.wageRate || formData.dailyWage}
                      onChange={e => setFormData({...formData, wageRate: e.target.value, dailyWage: e.target.value})}
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Payment Frequency</label>
                    <select 
                      style={styles.input}
                      value={formData.paymentFrequency}
                      onChange={e => setFormData({...formData, paymentFrequency: e.target.value})}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly (Every week)</option>
                      <option value="Biweekly">Biweekly (Every 2 weeks)</option>
                      <option value="Monthly">Monthly (Once a month)</option>
                      <option value="Custom">Custom Period</option>
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Overtime Rate (₹/hr)</label>
                    <input 
                      type="number"
                      step="any"
                      style={styles.input} 
                      placeholder="Auto if 0" 
                      value={formData.otRatePerHour}
                      onChange={e => setFormData({...formData, otRatePerHour: e.target.value})}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Payment Mode</label>
                    <select 
                      style={styles.input}
                      value={formData.paymentMethod}
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
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

                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Bank Name</label>
                    <input 
                      style={styles.input} 
                      placeholder="e.g. State Bank of India, PNB" 
                      value={formData.bankName}
                      onChange={e => setFormData({...formData, bankName: e.target.value})}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Bank Account No.</label>
                    <input 
                      style={styles.input} 
                      placeholder="e.g. 1234567890" 
                      value={formData.bankAccount}
                      onChange={e => setFormData({...formData, bankAccount: e.target.value})}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>IFSC Code</label>
                    <input 
                      style={styles.input} 
                      placeholder="e.g. SBIN0001234" 
                      value={formData.ifsc}
                      onChange={e => setFormData({...formData, ifsc: e.target.value})}
                    />
                  </div>
                </div>

                <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", color: "#64748b", display: "flex", gap: "8px", alignItems: "center" }}>
                  <UploadCloud size={16} color="#0f766e" />
                  <span>To upload Aadhaar, PAN, and other documents, please save the worker first and go to their Profile.</span>
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
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
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
