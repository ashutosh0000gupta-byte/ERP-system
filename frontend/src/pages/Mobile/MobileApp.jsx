import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  Receipt,
  CalendarCheck,
  CreditCard,
  Users,
  Plus,
  Camera,
  Trash2,
  CheckCircle2,
  Phone,
  MessageCircle,
  Clock,
  ArrowLeft,
  X,
  Search,
  Check,
  Building2,
  AlertCircle,
  Monitor
} from "lucide-react";

export default function MobileApp() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Navigation tab state: 'home' | 'expenses' | 'attendance' | 'advances' | 'workers'
  const [activeTab, setActiveTab] = useState("home");

  // Global / Shared States
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Today's Dashboard summary
  const [todaySummary, setTodaySummary] = useState({
    totalExpense: 0,
    presentCount: 0,
    totalAdvance: 0,
    totalOtHours: 0
  });

  // ── Expense Form State ───────────────────────────────────────────────────
  const [expenseForm, setExpenseForm] = useState({
    siteId: "",
    date: todayStr,
    category: "Material",
    amount: "",
    description: "",
    receiptUrl: ""
  });
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  // ── Attendance State ─────────────────────────────────────────────────────
  const [attendanceDate, setAttendanceDate] = useState(todayStr);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [savingAttendanceWorkerId, setSavingAttendanceWorkerId] = useState(null);

  // ── Advance Form State ───────────────────────────────────────────────────
  const [advanceForm, setAdvanceForm] = useState({
    workerId: "",
    siteId: "",
    date: todayStr,
    amount: "",
    reason: ""
  });
  const [submittingAdvance, setSubmittingAdvance] = useState(false);
  const [recentAdvances, setRecentAdvances] = useState([]);

  // ── Quick Worker Add Modal State ─────────────────────────────────────────
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [newWorkerForm, setNewWorkerForm] = useState({
    fullName: "",
    mobileNumber: "",
    skillTrade: "Mason",
    salaryType: "Daily",
    dailyWage: "",
    siteId: ""
  });
  const [submittingWorker, setSubmittingWorker] = useState(false);
  const [workerSearch, setWorkerSearch] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Initial Fetch: Sites & Workers ──────────────────────────────────────
  const loadInitialData = useCallback(async () => {
    try {
      const [sitesRes, workersRes] = await Promise.all([
        api.get("/snmr/sites"),
        api.get("/snmr/workers")
      ]);
      const siteList = Array.isArray(sitesRes.data) ? sitesRes.data : [];
      const workerList = Array.isArray(workersRes.data) ? workersRes.data : [];

      setSites(siteList);
      setWorkers(workerList);

      if (siteList.length > 0 && !selectedSiteId) {
        setSelectedSiteId(siteList[0].id);
        setExpenseForm((prev) => ({ ...prev, siteId: siteList[0].id }));
        setAdvanceForm((prev) => ({ ...prev, siteId: siteList[0].id }));
        setNewWorkerForm((prev) => ({ ...prev, siteId: siteList[0].id }));
      }
    } catch (err) {
      console.error("Failed to load initial data", err);
    }
  }, [selectedSiteId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ── Load Today's Summary & Recent Data ──────────────────────────────────
  const refreshSiteData = useCallback(async () => {
    if (!selectedSiteId) return;
    setLoading(true);
    try {
      const [expRes, attRes, advRes] = await Promise.all([
        api.get(`/snmr/expenses?siteId=${selectedSiteId}`),
        api.get(`/snmr/attendance?siteId=${selectedSiteId}&date=${attendanceDate}`),
        api.get(`/snmr/advances?siteId=${selectedSiteId}`)
      ]);

      const expList = Array.isArray(expRes.data) ? expRes.data : [];
      const attList = Array.isArray(attRes.data) ? attRes.data : [];
      const advList = Array.isArray(advRes.data) ? advRes.data : [];

      setRecentExpenses(expList.slice(0, 15));
      setRecentAdvances(advList.slice(0, 15));

      // Map existing attendance records
      const attMap = {};
      let presentCount = 0;
      let totalOtHours = 0;

      attList.forEach((rec) => {
        attMap[rec.workerId] = {
          status: rec.status,
          otHours: Number(rec.otHours || 0),
          remarks: rec.remarks || ""
        };
        if (rec.status === "Present") presentCount++;
        else if (rec.status === "Half Day") presentCount += 0.5;
        totalOtHours += Number(rec.otHours || 0);
      });
      setAttendanceRecords(attMap);

      // Compute today's expenses
      const todayExpensesTotal = expList
        .filter((e) => e.date && e.date.startsWith(todayStr))
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      // Compute today's advances
      const todayAdvancesTotal = advList
        .filter((a) => a.date && a.date.startsWith(todayStr))
        .reduce((sum, a) => sum + Number(a.amount || 0), 0);

      setTodaySummary({
        totalExpense: todayExpensesTotal,
        presentCount,
        totalAdvance: todayAdvancesTotal,
        totalOtHours
      });
    } catch (err) {
      console.error("Failed to refresh site data", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSiteId, attendanceDate, todayStr]);

  useEffect(() => {
    if (selectedSiteId) {
      refreshSiteData();
    }
  }, [selectedSiteId, attendanceDate, refreshSiteData]);

  // Handle Photo Capture for Bill / Receipt
  const handlePhotoCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Photo size should be less than 8MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setExpenseForm((prev) => ({ ...prev, receiptUrl: base64 }));
      showToast("Bill photo attached!");
    };
    reader.readAsDataURL(file);
  };

  // ── Save Expense Handler ────────────────────────────────────────────────
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      alert("Kripya sahi amount dalein.");
      return;
    }
    setSubmittingExpense(true);
    try {
      await api.post("/snmr/expenses", {
        siteId: selectedSiteId,
        date: expenseForm.date,
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        description: expenseForm.description,
        receiptUrl: expenseForm.receiptUrl || null
      });

      showToast(`₹${expenseForm.amount} ka kharcha darj ho gaya!`);
      setExpenseForm({
        siteId: selectedSiteId,
        date: todayStr,
        category: "Material",
        amount: "",
        description: "",
        receiptUrl: ""
      });
      refreshSiteData();
    } catch (err) {
      console.error("Expense save failed", err);
      alert("Failed to save expense: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingExpense(false);
    }
  };

  // ── Mark Attendance Handler ─────────────────────────────────────────────
  const handleMarkAttendance = async (workerId, newStatus, ot = null) => {
    setSavingAttendanceWorkerId(workerId);
    const current = attendanceRecords[workerId] || { status: "Present", otHours: 0, remarks: "" };
    const statusToSave = newStatus !== undefined ? newStatus : current.status;
    const otToSave = ot !== null ? Number(ot) : Number(current.otHours || 0);

    try {
      await api.post("/snmr/attendance", {
        workerId,
        siteId: selectedSiteId,
        date: attendanceDate,
        status: statusToSave,
        otHours: otToSave,
        remarks: current.remarks || ""
      });

      setAttendanceRecords((prev) => ({
        ...prev,
        [workerId]: {
          ...current,
          status: statusToSave,
          otHours: otToSave
        }
      }));
      if (navigator.vibrate) navigator.vibrate(30);
    } catch (err) {
      console.error("Attendance mark failed", err);
      alert("Attendance save nahi hui: " + (err.response?.data?.error || err.message));
    } finally {
      setSavingAttendanceWorkerId(null);
    }
  };

  // Mark all workers as Present for today
  const handleMarkAllPresent = async () => {
    const siteWorkers = workers.filter((w) => w.siteId === selectedSiteId || !w.siteId);
    if (!siteWorkers.length) return;

    if (!window.confirm(`Kya aap sabhi ${siteWorkers.length} workers ko Present mark karna chahte hain?`)) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        siteWorkers.map((w) =>
          api.post("/snmr/attendance", {
            workerId: w.id,
            siteId: selectedSiteId,
            date: attendanceDate,
            status: "Present",
            otHours: 0,
            remarks: "Bulk Mark"
          })
        )
      );
      showToast(`Sabhi ${siteWorkers.length} workers Present mark ho gaye!`);
      refreshSiteData();
    } catch (err) {
      alert("Bulk attendance error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Save Advance Handler ────────────────────────────────────────────────
  const handleSaveAdvance = async (e) => {
    e.preventDefault();
    if (!advanceForm.workerId) {
      alert("Kripya worker chunein.");
      return;
    }
    if (!advanceForm.amount || Number(advanceForm.amount) <= 0) {
      alert("Kripya sahi advance amount dalein.");
      return;
    }

    setSubmittingAdvance(true);
    try {
      await api.post("/snmr/advances", {
        workerId: advanceForm.workerId,
        siteId: selectedSiteId,
        date: advanceForm.date,
        amount: Number(advanceForm.amount),
        reason: advanceForm.reason || "Daily Site Advance"
      });

      const workerObj = workers.find((w) => w.id === advanceForm.workerId);
      showToast(`${workerObj?.fullName || "Worker"} ko ₹${advanceForm.amount} advance darj hua!`);

      setAdvanceForm({
        workerId: "",
        siteId: selectedSiteId,
        date: todayStr,
        amount: "",
        reason: ""
      });
      refreshSiteData();
    } catch (err) {
      console.error("Advance save failed", err);
      alert("Failed to record advance: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingAdvance(false);
    }
  };

  // ── Quick Worker Create Handler ─────────────────────────────────────────
  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (!newWorkerForm.fullName.trim()) {
      alert("Worker ka naam zaroori hai.");
      return;
    }

    setSubmittingWorker(true);
    try {
      const res = await api.post("/snmr/workers", {
        fullName: newWorkerForm.fullName.trim(),
        mobileNumber: newWorkerForm.mobileNumber.trim() || null,
        skillTrade: newWorkerForm.skillTrade,
        salaryType: newWorkerForm.salaryType,
        dailyWage: Number(newWorkerForm.dailyWage || 0),
        wageRate: Number(newWorkerForm.dailyWage || 0),
        siteId: selectedSiteId || null,
        joiningDate: new Date().toISOString()
      });

      showToast(`Naya worker ${res.data.fullName} jod diya gaya!`);
      setIsAddWorkerOpen(false);
      setNewWorkerForm({
        fullName: "",
        mobileNumber: "",
        skillTrade: "Mason",
        salaryType: "Daily",
        dailyWage: "",
        siteId: selectedSiteId
      });

      // Reload workers
      const wRes = await api.get("/snmr/workers");
      setWorkers(Array.isArray(wRes.data) ? wRes.data : []);
    } catch (err) {
      console.error("Worker create failed", err);
      alert("Failed to add worker: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingWorker(false);
    }
  };

  // Filter workers for current site or search
  const filteredWorkers = useMemo(() => {
    let list = workers;
    if (selectedSiteId) {
      list = list.filter((w) => w.siteId === selectedSiteId || !w.siteId);
    }
    if (workerSearch.trim()) {
      const q = workerSearch.toLowerCase().trim();
      list = list.filter(
        (w) =>
          (w.fullName || "").toLowerCase().includes(q) ||
          (w.workerId || "").toLowerCase().includes(q) ||
          (w.skillTrade || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [workers, selectedSiteId, workerSearch]);

  const activeSiteName = sites.find((s) => s.id === selectedSiteId)?.name || "Select Site";

  return (
    <div style={mStyles.appWrapper}>
      {/* ── Mobile Top App Bar ────────────────────────────────────────────── */}
      <header style={mStyles.topBar}>
        <div style={mStyles.topBarLeft}>
          <div style={mStyles.logoCircle}>
            <span>SN</span>
          </div>
          <div>
            <h1 style={mStyles.appTitle}>SNMR FAB INDIA</h1>
            <div style={mStyles.siteSelectorBox}>
              <Building2 size={12} color="#0f766e" />
              <select
                style={mStyles.siteSelect}
                value={selectedSiteId}
                onChange={(e) => {
                  setSelectedSiteId(e.target.value);
                  setExpenseForm((prev) => ({ ...prev, siteId: e.target.value }));
                  setAdvanceForm((prev) => ({ ...prev, siteId: e.target.value }));
                }}
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={mStyles.topBarRight}>
          <button
            style={mStyles.desktopSwitchBtn}
            onClick={() => navigate("/")}
            title="Switch to Full Desktop View"
          >
            <Monitor size={15} />
            <span style={{ fontSize: "11px", fontWeight: "700" }}>Desktop</span>
          </button>
        </div>
      </header>

      {/* ── Toast Notification ───────────────────────────────────────────── */}
      {toastMessage && (
        <div style={mStyles.toastNotification}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Main Scrollable Body ─────────────────────────────────────────── */}
      <main style={mStyles.scrollArea}>
        {/* ══════════════════════════════════════════════════════════════════
            TAB 1: HOME / DASHBOARD (आज का खाता)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "home" && (
          <div style={mStyles.contentContainer}>
            {/* Greeting & Date Banner */}
            <div style={mStyles.dateBanner}>
              <div>
                <p style={mStyles.dateBannerSub}>Daily Site Operations</p>
                <h2 style={mStyles.dateBannerTitle}>
                  {new Date().toLocaleDateString("hi-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                  })}
                </h2>
              </div>
              <span style={mStyles.siteBadge}>{activeSiteName}</span>
            </div>

            {/* Quick KPI Stats Cards */}
            <div style={mStyles.statsGrid}>
              <div
                style={{ ...mStyles.statCard, borderColor: "#fecdd3", background: "#fff1f2" }}
                onClick={() => setActiveTab("expenses")}
              >
                <Receipt size={18} color="#e11d48" />
                <span style={mStyles.statValue}>₹{todaySummary.totalExpense.toLocaleString("en-IN")}</span>
                <span style={mStyles.statLabel}>Aaj Ka Kharch</span>
              </div>

              <div
                style={{ ...mStyles.statCard, borderColor: "#bbf7d0", background: "#f0fdf4" }}
                onClick={() => setActiveTab("attendance")}
              >
                <CalendarCheck size={18} color="#16a34a" />
                <span style={mStyles.statValue}>{todaySummary.presentCount}</span>
                <span style={mStyles.statLabel}>Present Workers</span>
              </div>

              <div
                style={{ ...mStyles.statCard, borderColor: "#ddd6fe", background: "#f5f3ff" }}
                onClick={() => setActiveTab("advances")}
              >
                <CreditCard size={18} color="#7c3aed" />
                <span style={mStyles.statValue}>₹{todaySummary.totalAdvance.toLocaleString("en-IN")}</span>
                <span style={mStyles.statLabel}>Aaj Ka Advance</span>
              </div>

              <div
                style={{ ...mStyles.statCard, borderColor: "#fed7aa", background: "#fff7ed" }}
                onClick={() => setActiveTab("attendance")}
              >
                <Clock size={18} color="#ea580c" />
                <span style={mStyles.statValue}>{todaySummary.totalOtHours} hrs</span>
                <span style={mStyles.statLabel}>Total OT Hours</span>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <h3 style={mStyles.sectionTitle}>Quick Actions (तुरंत एंट्री करें)</h3>
            <div style={mStyles.actionButtonsGrid}>
              <button
                style={{ ...mStyles.quickActionTile, background: "#f0fdfa", borderColor: "#99f6e4" }}
                onClick={() => setActiveTab("expenses")}
              >
                <div style={{ ...mStyles.tileIconCircle, background: "#0f766e", color: "#fff" }}>
                  <Plus size={20} />
                </div>
                <div>
                  <h4 style={mStyles.tileTitle}>Kharch Darj Karein</h4>
                  <p style={mStyles.tileSub}>Material, Diesel, Chai, Bills</p>
                </div>
              </button>

              <button
                style={{ ...mStyles.quickActionTile, background: "#f0fdf4", borderColor: "#bbf7d0" }}
                onClick={() => setActiveTab("attendance")}
              >
                <div style={{ ...mStyles.tileIconCircle, background: "#16a34a", color: "#fff" }}>
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <h4 style={mStyles.tileTitle}>Hajiri / OT Lagayein</h4>
                  <p style={mStyles.tileSub}>Daily punches & overtime</p>
                </div>
              </button>

              <button
                style={{ ...mStyles.quickActionTile, background: "#faf5ff", borderColor: "#e9d5ff" }}
                onClick={() => setActiveTab("advances")}
              >
                <div style={{ ...mStyles.tileIconCircle, background: "#7c3aed", color: "#fff" }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 style={mStyles.tileTitle}>Advance Entry Karein</h4>
                  <p style={mStyles.tileSub}>Worker cash payments</p>
                </div>
              </button>

              <button
                style={{ ...mStyles.quickActionTile, background: "#fffbeb", borderColor: "#fde68a" }}
                onClick={() => setIsAddWorkerOpen(true)}
              >
                <div style={{ ...mStyles.tileIconCircle, background: "#d97706", color: "#fff" }}>
                  <Users size={20} />
                </div>
                <div>
                  <h4 style={mStyles.tileTitle}>Naya Worker Jodein</h4>
                  <p style={mStyles.tileSub}>Direct onsite onboarding</p>
                </div>
              </button>
            </div>

            {/* Recent Expenses List */}
            <div style={{ marginTop: "24px" }}>
              <div style={mStyles.sectionHeaderRow}>
                <h3 style={mStyles.sectionTitle}>Recent Site Kharch</h3>
                <button style={mStyles.seeAllBtn} onClick={() => setActiveTab("expenses")}>
                  Poora Dekhein →
                </button>
              </div>

              {recentExpenses.length === 0 ? (
                <div style={mStyles.emptyStateBox}>
                  <Receipt size={32} color="#cbd5e1" />
                  <p style={mStyles.emptyText}>Is site par abhi koi kharcha darj nahi hai.</p>
                </div>
              ) : (
                <div style={mStyles.recentList}>
                  {recentExpenses.slice(0, 5).map((exp) => (
                    <div key={exp.id} style={mStyles.recentItem}>
                      <div style={mStyles.recentItemLeft}>
                        <div style={mStyles.categoryPill}>{exp.category}</div>
                        <div>
                          <p style={mStyles.recentItemTitle}>{exp.description || exp.category}</p>
                          <p style={mStyles.recentItemDate}>
                            {exp.date ? new Date(exp.date).toLocaleDateString("hi-IN") : todayStr}
                          </p>
                        </div>
                      </div>
                      <div style={mStyles.recentItemRight}>
                        <span style={mStyles.expenseAmountText}>
                          ₹{Number(exp.amount || 0).toLocaleString("en-IN")}
                        </span>
                        {exp.receiptUrl && (
                          <button
                            style={mStyles.viewBillBtn}
                            onClick={() => setPreviewImage(exp.receiptUrl)}
                          >
                            📷 Bill
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 2: DAILY EXPENSES (खर्चा एंट्री)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "expenses" && (
          <div style={mStyles.contentContainer}>
            <div style={mStyles.pageHeader}>
              <div>
                <h2 style={mStyles.pageTitle}>Daily Site Kharch</h2>
                <p style={mStyles.pageSubtitle}>Bill photo aur category ke sath turant kharcha dalein</p>
              </div>
            </div>

            {/* New Expense Entry Card */}
            <form onSubmit={handleSaveExpense} style={mStyles.formCard}>
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Kharch Category</label>
                <div style={mStyles.categoryChipRow}>
                  {["Material", "Diesel/Gaadi", "Khana/Chai", "Petty Cash", "Tools", "Labour", "Misc"].map(
                    (cat) => (
                      <button
                        type="button"
                        key={cat}
                        style={{
                          ...mStyles.categoryChip,
                          background: expenseForm.category === cat ? "#0f766e" : "#f1f5f9",
                          color: expenseForm.category === cat ? "#ffffff" : "#334155"
                        }}
                        onClick={() => setExpenseForm((p) => ({ ...p, category: cat }))}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Amount Input */}
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Amount (₹)</label>
                <div style={mStyles.amountInputWrap}>
                  <span style={mStyles.rupeeSymbol}>₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    style={mStyles.amountInput}
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, amount: e.target.value }))}
                    required
                  />
                </div>
                {/* Quick denomination chips */}
                <div style={mStyles.quickAmtChips}>
                  {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      style={mStyles.quickAmtBtn}
                      onClick={() =>
                        setExpenseForm((p) => ({
                          ...p,
                          amount: String((Number(p.amount) || 0) + amt)
                        }))
                      }
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description / Notes */}
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Vivaran (Description / Kaam ka note)</label>
                <input
                  type="text"
                  placeholder="e.g. 5 Bori Cement, Generator Diesel, Mistry ka khana"
                  style={mStyles.textInput}
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              {/* Tarikh */}
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Tarikh (Date)</label>
                <input
                  type="date"
                  style={mStyles.textInput}
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, date: e.target.value }))}
                />
              </div>

              {/* Bill / Receipt Camera Upload */}
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Bill / Receipt Photo</label>
                {expenseForm.receiptUrl ? (
                  <div style={mStyles.photoPreviewBox}>
                    <img
                      src={expenseForm.receiptUrl}
                      alt="Bill receipt"
                      style={mStyles.thumbnailImg}
                      onClick={() => setPreviewImage(expenseForm.receiptUrl)}
                    />
                    <button
                      type="button"
                      style={mStyles.removePhotoBtn}
                      onClick={() => setExpenseForm((p) => ({ ...p, receiptUrl: "" }))}
                    >
                      <Trash2 size={16} /> Hatao
                    </button>
                  </div>
                ) : (
                  <label style={mStyles.cameraUploadBtn}>
                    <Camera size={20} color="#0f766e" />
                    <span>Bill / Receipt Ki Photo Khinchein</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: "none" }}
                      onChange={handlePhotoCapture}
                    />
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                style={mStyles.submitBigBtn}
                disabled={submittingExpense || !expenseForm.amount}
              >
                {submittingExpense ? "Save Ho Raha Hai..." : "✓ Kharch Save Karein"}
              </button>
            </form>

            {/* List of Recent Expenses */}
            <h3 style={{ ...mStyles.sectionTitle, marginTop: "24px" }}>Site Ke Haal Ke Kharch</h3>
            <div style={mStyles.recentList}>
              {recentExpenses.map((exp) => (
                <div key={exp.id} style={mStyles.recentItem}>
                  <div style={mStyles.recentItemLeft}>
                    <div style={mStyles.categoryPill}>{exp.category}</div>
                    <div>
                      <p style={mStyles.recentItemTitle}>{exp.description || exp.category}</p>
                      <p style={mStyles.recentItemDate}>
                        {exp.date ? new Date(exp.date).toLocaleDateString("hi-IN") : todayStr}
                      </p>
                    </div>
                  </div>
                  <div style={mStyles.recentItemRight}>
                    <span style={mStyles.expenseAmountText}>
                      ₹{Number(exp.amount || 0).toLocaleString("en-IN")}
                    </span>
                    {exp.receiptUrl && (
                      <button
                        style={mStyles.viewBillBtn}
                        onClick={() => setPreviewImage(exp.receiptUrl)}
                      >
                        📷 Bill Dekhein
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 3: ATTENDANCE / HAJIRI (हाजिरी & ओवर-टाइम)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "attendance" && (
          <div style={mStyles.contentContainer}>
            <div style={mStyles.pageHeader}>
              <div>
                <h2 style={mStyles.pageTitle}>Site Hajiri & OT</h2>
                <p style={mStyles.pageSubtitle}>1-tap me Present, Absent aur Overtime lagayein</p>
              </div>
            </div>

            {/* Control Bar: Date & Bulk Present */}
            <div style={mStyles.attControlBar}>
              <input
                type="date"
                style={mStyles.dateInputCompact}
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />

              <button style={mStyles.markAllPresentBtn} onClick={handleMarkAllPresent}>
                <Check size={14} /> Sabhi Present
              </button>
            </div>

            {/* Search worker */}
            <div style={mStyles.searchBar}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Worker ka naam ya ID khojein..."
                style={mStyles.searchInput}
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
              />
            </div>

            {/* Workers Attendance List */}
            <div style={mStyles.workersAttList}>
              {filteredWorkers.length === 0 ? (
                <div style={mStyles.emptyStateBox}>
                  <Users size={32} color="#cbd5e1" />
                  <p style={mStyles.emptyText}>Is site par koi worker nahi mila.</p>
                </div>
              ) : (
                filteredWorkers.map((w) => {
                  const rec = attendanceRecords[w.id] || { status: "Present", otHours: 0 };
                  const isSaving = savingAttendanceWorkerId === w.id;

                  return (
                    <div key={w.id} style={mStyles.workerAttCard}>
                      <div style={mStyles.workerAttHeader}>
                        <div>
                          <h4 style={mStyles.workerNameText}>{w.fullName}</h4>
                          <p style={mStyles.workerMetaText}>
                            {w.workerId || "ID-Pending"} • {w.skillTrade || "General"} • ₹
                            {Number(w.dailyWage || w.wageRate || 0)}/day
                          </p>
                        </div>
                        {isSaving && <span style={mStyles.savingDot}>Saving...</span>}
                      </div>

                      {/* Status Buttons: P, HD, A */}
                      <div style={mStyles.attActionRow}>
                        <div style={mStyles.statusPillsGroup}>
                          <button
                            type="button"
                            style={{
                              ...mStyles.statusPillBtn,
                              background: rec.status === "Present" ? "#16a34a" : "#f1f5f9",
                              color: rec.status === "Present" ? "#ffffff" : "#475569",
                              fontWeight: rec.status === "Present" ? "800" : "600"
                            }}
                            onClick={() => handleMarkAttendance(w.id, "Present")}
                          >
                            P (Present)
                          </button>

                          <button
                            type="button"
                            style={{
                              ...mStyles.statusPillBtn,
                              background: rec.status === "Half Day" ? "#ea580c" : "#f1f5f9",
                              color: rec.status === "Half Day" ? "#ffffff" : "#475569",
                              fontWeight: rec.status === "Half Day" ? "800" : "600"
                            }}
                            onClick={() => handleMarkAttendance(w.id, "Half Day")}
                          >
                            HD (Half)
                          </button>

                          <button
                            type="button"
                            style={{
                              ...mStyles.statusPillBtn,
                              background: rec.status === "Absent" ? "#dc2626" : "#f1f5f9",
                              color: rec.status === "Absent" ? "#ffffff" : "#475569",
                              fontWeight: rec.status === "Absent" ? "800" : "600"
                            }}
                            onClick={() => handleMarkAttendance(w.id, "Absent")}
                          >
                            A (Absent)
                          </button>
                        </div>

                        {/* Overtime Counter */}
                        <div style={mStyles.otCounterBox}>
                          <span style={mStyles.otLabel}>OT</span>
                          <button
                            type="button"
                            style={mStyles.otStepBtn}
                            onClick={() =>
                              handleMarkAttendance(w.id, undefined, Math.max(0, rec.otHours - 1))
                            }
                          >
                            -
                          </button>
                          <span style={mStyles.otValueText}>{rec.otHours}h</span>
                          <button
                            type="button"
                            style={mStyles.otStepBtn}
                            onClick={() =>
                              handleMarkAttendance(w.id, undefined, rec.otHours + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 4: ADVANCES (एडवांस एंट्री)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "advances" && (
          <div style={mStyles.contentContainer}>
            <div style={mStyles.pageHeader}>
              <div>
                <h2 style={mStyles.pageTitle}>Worker Advance</h2>
                <p style={mStyles.pageSubtitle}>Worker ko diye gaye advance ka record darj karein</p>
              </div>
            </div>

            {/* Advance Entry Form */}
            <form onSubmit={handleSaveAdvance} style={mStyles.formCard}>
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Worker Chunein</label>
                <select
                  style={mStyles.textInput}
                  value={advanceForm.workerId}
                  onChange={(e) => setAdvanceForm((p) => ({ ...p, workerId: e.target.value }))}
                  required
                >
                  <option value="">-- Worker Select Karein --</option>
                  {filteredWorkers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} ({w.workerId || "ID"} • {w.skillTrade})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Advance Amount (₹)</label>
                <div style={mStyles.amountInputWrap}>
                  <span style={mStyles.rupeeSymbol}>₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    style={mStyles.amountInput}
                    value={advanceForm.amount}
                    onChange={(e) => setAdvanceForm((p) => ({ ...p, amount: e.target.value }))}
                    required
                  />
                </div>
                {/* Quick denomination chips */}
                <div style={mStyles.quickAmtChips}>
                  {[500, 1000, 2000, 3000, 5000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      style={mStyles.quickAmtBtn}
                      onClick={() =>
                        setAdvanceForm((p) => ({
                          ...p,
                          amount: String((Number(p.amount) || 0) + amt)
                        }))
                      }
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason / Notes */}
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Karan (Reason)</label>
                <input
                  type="text"
                  placeholder="e.g. Ghar bhej rahe hain, Medical, Tyohar kharch"
                  style={mStyles.textInput}
                  value={advanceForm.reason}
                  onChange={(e) => setAdvanceForm((p) => ({ ...p, reason: e.target.value }))}
                />
              </div>

              {/* Date */}
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Tarikh (Date)</label>
                <input
                  type="date"
                  style={mStyles.textInput}
                  value={advanceForm.date}
                  onChange={(e) => setAdvanceForm((p) => ({ ...p, date: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                style={{ ...mStyles.submitBigBtn, background: "#7c3aed" }}
                disabled={submittingAdvance || !advanceForm.workerId || !advanceForm.amount}
              >
                {submittingAdvance ? "Save Ho Raha Hai..." : "✓ Advance Save Karein"}
              </button>
            </form>

            {/* Recent Advances List */}
            <h3 style={{ ...mStyles.sectionTitle, marginTop: "24px" }}>Haal Ke Advances</h3>
            <div style={mStyles.recentList}>
              {recentAdvances.map((adv) => (
                <div key={adv.id} style={mStyles.recentItem}>
                  <div style={mStyles.recentItemLeft}>
                    <div style={{ ...mStyles.categoryPill, background: "#f5f3ff", color: "#7c3aed" }}>
                      ₹{Number(adv.amount || 0).toLocaleString("en-IN")}
                    </div>
                    <div>
                      <p style={mStyles.recentItemTitle}>{adv.worker?.fullName || "Worker"}</p>
                      <p style={mStyles.recentItemDate}>
                        {adv.reason || "Advance"} •{" "}
                        {adv.date ? new Date(adv.date).toLocaleDateString("hi-IN") : todayStr}
                      </p>
                    </div>
                  </div>
                  <div style={mStyles.recentItemRight}>
                    <span
                      style={{
                        ...mStyles.recoveryBadge,
                        background: adv.isDeducted ? "#dcfce7" : "#fee2e2",
                        color: adv.isDeducted ? "#16a34a" : "#dc2626"
                      }}
                    >
                      {adv.isDeducted ? "Recovered" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 5: WORKERS DIRECTORY & ONBOARDING (कारीगर / लेबर)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "workers" && (
          <div style={mStyles.contentContainer}>
            <div style={mStyles.pageHeader}>
              <div>
                <h2 style={mStyles.pageTitle}>Workers Directory</h2>
                <p style={mStyles.pageSubtitle}>Direct call, WhatsApp aur naye worker ka registration</p>
              </div>

              <button style={mStyles.addWorkerHeaderBtn} onClick={() => setIsAddWorkerOpen(true)}>
                <Plus size={16} /> Naya Worker
              </button>
            </div>

            {/* Search Bar */}
            <div style={mStyles.searchBar}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Worker ka naam, trade ya phone khojein..."
                style={mStyles.searchInput}
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
              />
            </div>

            {/* Workers Cards List */}
            <div style={mStyles.workerDirectoryList}>
              {filteredWorkers.map((w) => (
                <div key={w.id} style={mStyles.workerProfileCard}>
                  <div style={mStyles.workerCardTopRow}>
                    <div style={mStyles.workerAvatar}>
                      {(w.fullName || "W").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={mStyles.workerNameText}>{w.fullName}</h4>
                      <p style={mStyles.workerMetaText}>
                        {w.workerId || "ID-Pending"} • {w.skillTrade || "General"}
                      </p>
                      <p style={mStyles.workerWageBadge}>
                        ₹{Number(w.dailyWage || w.wageRate || 0)} / {w.salaryType || "Day"}
                      </p>
                    </div>

                    {/* Quick Call / WhatsApp Buttons */}
                    <div style={mStyles.workerContactBtns}>
                      {w.mobileNumber ? (
                        <>
                          <a
                            href={`tel:${w.mobileNumber}`}
                            style={mStyles.callIconBtn}
                            title="Direct Call"
                          >
                            <Phone size={16} color="#16a34a" />
                          </a>
                          <a
                            href={`https://wa.me/91${w.mobileNumber.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            style={mStyles.whatsappIconBtn}
                            title="WhatsApp Chat"
                          >
                            <MessageCircle size={16} color="#0284c7" />
                          </a>
                        </>
                      ) : (
                        <span style={mStyles.noPhoneText}>No Phone</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Bill Image Full-Screen Viewer ─────────────────────────────────── */}
      {previewImage && (
        <div style={mStyles.imageModalOverlay} onClick={() => setPreviewImage(null)}>
          <div style={mStyles.imageModalContent} onClick={(e) => e.stopPropagation()}>
            <button style={mStyles.closeModalBtn} onClick={() => setPreviewImage(null)}>
              <X size={20} />
            </button>
            <img src={previewImage} alt="Receipt preview" style={mStyles.fullReceiptImage} />
          </div>
        </div>
      )}

      {/* ── Add New Worker Modal ──────────────────────────────────────────── */}
      {isAddWorkerOpen && (
        <div style={mStyles.modalOverlay} onClick={() => setIsAddWorkerOpen(false)}>
          <div style={mStyles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={mStyles.modalHeader}>
              <h3 style={mStyles.modalTitle}>Naya Worker Jodein</h3>
              <button style={mStyles.closeModalIconBtn} onClick={() => setIsAddWorkerOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} style={mStyles.modalBody}>
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Poora Naam (Full Name) *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  style={mStyles.textInput}
                  value={newWorkerForm.fullName}
                  onChange={(e) => setNewWorkerForm((p) => ({ ...p, fullName: e.target.value }))}
                  required
                />
              </div>

              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  style={mStyles.textInput}
                  value={newWorkerForm.mobileNumber}
                  onChange={(e) => setNewWorkerForm((p) => ({ ...p, mobileNumber: e.target.value }))}
                />
              </div>

              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Kaam / Skill Trade</label>
                <select
                  style={mStyles.textInput}
                  value={newWorkerForm.skillTrade}
                  onChange={(e) => setNewWorkerForm((p) => ({ ...p, skillTrade: e.target.value }))}
                >
                  <option value="Mason">Mason (कारीगर / मिस्त्री)</option>
                  <option value="Helper">Helper (मज़दूर / हेल्पर)</option>
                  <option value="Fitter">Fitter (फ़िटर)</option>
                  <option value="Welder">Welder (वेल्डर)</option>
                  <option value="Electrician">Electrician (इलेक्ट्रीशियन)</option>
                  <option value="Plumber">Plumber (प्लंबर)</option>
                  <option value="Supervisor">Supervisor (सुपरवाइज़र)</option>
                </select>
              </div>

              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Daily Wage Rate (दिहाड़ी ₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  style={mStyles.textInput}
                  value={newWorkerForm.dailyWage}
                  onChange={(e) => setNewWorkerForm((p) => ({ ...p, dailyWage: e.target.value }))}
                  required
                />
              </div>

              <button
                type="submit"
                style={{ ...mStyles.submitBigBtn, background: "#d97706" }}
                disabled={submittingWorker || !newWorkerForm.fullName}
              >
                {submittingWorker ? "Register Ho Raha Hai..." : "✓ Worker Save Karein"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Fixed Bottom Navigation Bar ──────────────────────────────────── */}
      <nav style={mStyles.bottomNav}>
        <button
          style={{
            ...mStyles.navItem,
            color: activeTab === "home" ? "#0f766e" : "#64748b"
          }}
          onClick={() => setActiveTab("home")}
        >
          <Home size={20} />
          <span style={mStyles.navLabel}>Home</span>
        </button>

        <button
          style={{
            ...mStyles.navItem,
            color: activeTab === "expenses" ? "#e11d48" : "#64748b"
          }}
          onClick={() => setActiveTab("expenses")}
        >
          <Receipt size={20} />
          <span style={mStyles.navLabel}>Kharch</span>
        </button>

        <button
          style={{
            ...mStyles.navItem,
            color: activeTab === "attendance" ? "#16a34a" : "#64748b"
          }}
          onClick={() => setActiveTab("attendance")}
        >
          <CalendarCheck size={20} />
          <span style={mStyles.navLabel}>Hajiri</span>
        </button>

        <button
          style={{
            ...mStyles.navItem,
            color: activeTab === "advances" ? "#7c3aed" : "#64748b"
          }}
          onClick={() => setActiveTab("advances")}
        >
          <CreditCard size={20} />
          <span style={mStyles.navLabel}>Advance</span>
        </button>

        <button
          style={{
            ...mStyles.navItem,
            color: activeTab === "workers" ? "#d97706" : "#64748b"
          }}
          onClick={() => setActiveTab("workers")}
        >
          <Users size={20} />
          <span style={mStyles.navLabel}>Workers</span>
        </button>
      </nav>
    </div>
  );
}

// ── Mobile Responsive Styles ───────────────────────────────────────────────
const mStyles = {
  appWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
    maxWidth: "500px",
    margin: "0 auto",
    background: "#f8fafc",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 0 40px rgba(0,0,0,0.1)"
  },
  topBar: {
    height: "64px",
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    flexShrink: 0,
    zIndex: 10
  },
  topBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  logoCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #0f766e, #14b8a6)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "14px",
    boxShadow: "0 2px 6px rgba(15, 118, 110, 0.3)"
  },
  appTitle: {
    fontSize: "13.5px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.2px"
  },
  siteSelectorBox: {
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  siteSelect: {
    border: "none",
    background: "transparent",
    color: "#0f766e",
    fontWeight: "700",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer",
    maxWidth: "180px"
  },
  topBarRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  desktopSwitchBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    padding: "6px 10px",
    borderRadius: "8px",
    color: "#334155",
    cursor: "pointer"
  },
  toastNotification: {
    position: "absolute",
    top: "72px",
    left: "16px",
    right: "16px",
    background: "#0f172a",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
    zIndex: 100,
    animation: "fadeIn 0.2s ease"
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: "80px",
    WebkitOverflowScrolling: "touch"
  },
  contentContainer: {
    padding: "16px"
  },
  dateBanner: {
    background: "linear-gradient(135deg, #0f766e, #115e59)",
    color: "#ffffff",
    padding: "18px 20px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    boxShadow: "0 4px 16px rgba(15, 118, 110, 0.2)"
  },
  dateBannerSub: {
    margin: "0 0 2px 0",
    fontSize: "11.5px",
    opacity: 0.85,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "600"
  },
  dateBannerTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "800"
  },
  siteBadge: {
    background: "rgba(255,255,255,0.2)",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "20px"
  },
  statCard: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
  },
  statValue: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#0f172a"
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#64748b"
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 12px 0",
    letterSpacing: "-0.2px"
  },
  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  },
  seeAllBtn: {
    background: "none",
    border: "none",
    color: "#0f766e",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer"
  },
  actionButtonsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "16px"
  },
  quickActionTile: {
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    textAlign: "left",
    cursor: "pointer",
    transition: "transform 0.1s"
  },
  tileIconCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  tileTitle: {
    margin: "0 0 2px 0",
    fontSize: "13px",
    fontWeight: "800",
    color: "#0f172a"
  },
  tileSub: {
    margin: 0,
    fontSize: "11px",
    color: "#64748b"
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },
  pageTitle: {
    margin: "0 0 2px 0",
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a"
  },
  pageSubtitle: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b"
  },
  formCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  inputLabel: {
    fontSize: "11.5px",
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.4px"
  },
  categoryChipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  },
  categoryChip: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer"
  },
  amountInputWrap: {
    display: "flex",
    alignItems: "center",
    background: "#f8fafc",
    border: "2px solid #cbd5e1",
    borderRadius: "10px",
    padding: "0 14px",
    height: "50px"
  },
  rupeeSymbol: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f766e",
    marginRight: "6px"
  },
  amountInput: {
    border: "none",
    background: "transparent",
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    width: "100%",
    outline: "none"
  },
  quickAmtChips: {
    display: "flex",
    gap: "6px",
    overflowX: "auto",
    paddingTop: "4px"
  },
  quickAmtBtn: {
    padding: "4px 8px",
    borderRadius: "6px",
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    fontSize: "11.5px",
    fontWeight: "700",
    color: "#334155",
    cursor: "pointer"
  },
  textInput: {
    height: "44px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13.5px",
    outline: "none",
    background: "#f8fafc",
    color: "#0f172a"
  },
  cameraUploadBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    height: "48px",
    borderRadius: "10px",
    border: "2px dashed #99f6e4",
    background: "#f0fdfa",
    color: "#0f766e",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer"
  },
  photoPreviewBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px"
  },
  thumbnailImg: {
    width: "48px",
    height: "48px",
    borderRadius: "6px",
    objectFit: "cover",
    cursor: "pointer"
  },
  removePhotoBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer"
  },
  submitBigBtn: {
    height: "48px",
    borderRadius: "10px",
    border: "none",
    background: "#0f766e",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(15, 118, 110, 0.3)",
    marginTop: "6px"
  },
  attControlBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px"
  },
  dateInputCompact: {
    height: "38px",
    padding: "0 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "12.5px",
    fontWeight: "600",
    background: "#ffffff"
  },
  markAllPresentBtn: {
    height: "38px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "none",
    background: "#16a34a",
    color: "#ffffff",
    fontSize: "12.5px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer"
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "0 12px",
    height: "40px",
    marginBottom: "12px"
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "13px",
    width: "100%"
  },
  workersAttList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  workerAttCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px 14px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
  },
  workerAttHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px"
  },
  workerNameText: {
    margin: "0 0 2px 0",
    fontSize: "14px",
    fontWeight: "800",
    color: "#0f172a"
  },
  workerMetaText: {
    margin: 0,
    fontSize: "11.5px",
    color: "#64748b"
  },
  savingDot: {
    fontSize: "10px",
    color: "#0f766e",
    fontWeight: "700"
  },
  attActionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px"
  },
  statusPillsGroup: {
    display: "flex",
    gap: "6px"
  },
  statusPillBtn: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "none",
    fontSize: "11.5px",
    cursor: "pointer",
    transition: "all 0.1s"
  },
  otCounterBox: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "2px 6px"
  },
  otLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#64748b",
    marginRight: "2px"
  },
  otStepBtn: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer"
  },
  otValueText: {
    fontSize: "12px",
    fontWeight: "800",
    minWidth: "20px",
    textAlign: "center"
  },
  recentList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  recentItem: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "10px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  recentItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  categoryPill: {
    background: "#f1f5f9",
    color: "#334155",
    fontSize: "10px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "6px",
    textTransform: "uppercase"
  },
  recentItemTitle: {
    margin: "0 0 2px 0",
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f172a"
  },
  recentItemDate: {
    margin: 0,
    fontSize: "11px",
    color: "#64748b"
  },
  recentItemRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px"
  },
  expenseAmountText: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#0f172a"
  },
  viewBillBtn: {
    background: "none",
    border: "none",
    color: "#0284c7",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer"
  },
  recoveryBadge: {
    fontSize: "10.5px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "6px"
  },
  workerDirectoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  workerProfileCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
  },
  workerCardTopRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  workerAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  workerWageBadge: {
    margin: "2px 0 0 0",
    fontSize: "11px",
    fontWeight: "700",
    color: "#0f766e"
  },
  workerContactBtns: {
    display: "flex",
    gap: "6px"
  },
  callIconBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none"
  },
  whatsappIconBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none"
  },
  noPhoneText: {
    fontSize: "10px",
    color: "#94a3b8"
  },
  addWorkerHeaderBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "#d97706",
    color: "#ffffff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer"
  },
  emptyStateBox: {
    padding: "36px 16px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px"
  },
  emptyText: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b"
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 200,
    padding: "0"
  },
  modalCard: {
    background: "#ffffff",
    width: "100%",
    maxWidth: "500px",
    borderRadius: "20px 20px 0 0",
    padding: "20px",
    maxHeight: "90vh",
    overflowY: "auto",
    animation: "slideUp 0.25s ease"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },
  modalTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "800",
    color: "#0f172a"
  },
  closeModalIconBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer"
  },
  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  imageModalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 300,
    padding: "16px"
  },
  imageModalContent: {
    position: "relative",
    maxWidth: "100%",
    maxHeight: "90vh"
  },
  closeModalBtn: {
    position: "absolute",
    top: "-36px",
    right: 0,
    background: "#ffffff",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  fullReceiptImage: {
    maxWidth: "100%",
    maxHeight: "80vh",
    borderRadius: "12px",
    objectFit: "contain"
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "64px",
    background: "#ffffff",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 50,
    boxShadow: "0 -2px 10px rgba(0,0,0,0.03)"
  },
  navItem: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px 0"
  },
  navLabel: {
    fontSize: "10.5px",
    fontWeight: "700"
  }
};
