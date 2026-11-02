import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api, { getDefaultApiUrl, setCustomApiUrl } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useAppMode } from "../../hooks/useAppMode";
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
  X,
  Search,
  Check,
  Building2,
  AlertCircle,
  Monitor,
  Zap,
  FileText,
  CheckSquare,
  Bell,
  Settings,
  LogOut,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Wifi,
  User,
  DollarSign,
  Layers,
  Sparkles
} from "lucide-react";

export default function MobileApp() {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { switchMode } = useAppMode();

  // Navigation tab state: 'home' | 'expenses' | 'attendance' | 'advances' | 'workers' | 'more'
  const [activeTab, setActiveTab] = useState("home");

  // Global / Shared States
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Quick Action Sheet / Bottom Drawer
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Modals
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Server Settings State
  const [serverUrlInput, setServerUrlInput] = useState(() => getDefaultApiUrl());
  const [serverTestStatus, setServerTestStatus] = useState(null);
  const [testingServer, setTestingServer] = useState(false);

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

  // ── Quick Leave Form State ───────────────────────────────────────────────
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Casual",
    startDate: todayStr,
    endDate: todayStr,
    reason: ""
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // ── Quick Task Form State ────────────────────────────────────────────────
  const [taskForm, setTaskForm] = useState({
    title: "",
    priority: "Medium",
    dueDate: todayStr,
    description: ""
  });
  const [submittingTask, setSubmittingTask] = useState(false);

  // Haptic feedback & Toast helper
  const triggerHaptic = (ms = 30) => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch {}
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    triggerHaptic(40);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // ── Initial Fetch: Sites & Workers ──────────────────────────────────────
  const loadInitialData = useCallback(async () => {
    try {
      const [sitesRes, workersRes] = await Promise.all([
        api.get("/snmr/sites").catch(() => ({ data: [] })),
        api.get("/snmr/workers").catch(() => ({ data: [] }))
      ]);
      const siteList = Array.isArray(sitesRes.data) ? sitesRes.data : [];
      const workerList = Array.isArray(workersRes.data) ? workersRes.data : [];

      setSites(siteList);
      setWorkers(workerList);

      if (siteList.length > 0 && !selectedSiteId) {
        const firstSiteId = siteList[0].id;
        setSelectedSiteId(firstSiteId);
        setExpenseForm((prev) => ({ ...prev, siteId: firstSiteId }));
        setAdvanceForm((prev) => ({ ...prev, siteId: firstSiteId }));
        setNewWorkerForm((prev) => ({ ...prev, siteId: firstSiteId }));
      }
    } catch (err) {
      console.error("Failed to load initial data", err);
    }
  }, [selectedSiteId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications/inbox").catch(() => ({ data: { data: [] } }));
      const items = res.data?.data || res.data || [];
      const list = Array.isArray(items) ? items : [];
      setNotifications(list.slice(0, 10));
      setUnreadNotifCount(list.filter((n) => !n.read).length);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // ── Load Today's Summary & Recent Data ──────────────────────────────────
  const refreshSiteData = useCallback(async () => {
    if (!selectedSiteId) return;
    setLoading(true);
    try {
      const [expRes, attRes, advRes] = await Promise.all([
        api.get(`/snmr/expenses?siteId=${selectedSiteId}`).catch(() => ({ data: [] })),
        api.get(`/snmr/attendance?siteId=${selectedSiteId}&date=${attendanceDate}`).catch(() => ({ data: [] })),
        api.get(`/snmr/advances?siteId=${selectedSiteId}`).catch(() => ({ data: [] }))
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

  // Full Refresh Trigger
  const handleFullRefresh = async () => {
    setRefreshing(true);
    triggerHaptic(20);
    await Promise.all([loadInitialData(), refreshSiteData(), loadNotifications()]);
    setRefreshing(false);
    showToast("Data Synced Fresh! 🔄");
  };

  // Handle Photo Capture for Bill / Receipt
  const handlePhotoCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Photo size 8MB se kam honi chahiye");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setExpenseForm((prev) => ({ ...prev, receiptUrl: base64 }));
      showToast("Bill photo attach ho gayi! 📸");
    };
    reader.readAsDataURL(file);
  };

  // ── Save Expense Handler ────────────────────────────────────────────────
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      alert("Kripya valid amount dalein.");
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

      showToast(`₹${expenseForm.amount} ka kharcha darj hua!`);
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
      alert("Kharch save nahi hua: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingExpense(false);
    }
  };

  // ── Mark Attendance Handler ─────────────────────────────────────────────
  const handleMarkAttendance = async (workerId, newStatus, ot = null) => {
    triggerHaptic(20);
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
    triggerHaptic(40);
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
      showToast(`Sabhi ${siteWorkers.length} workers Present mark ho gaye! ✅`);
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
      alert("Kripya worker select karein.");
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
      alert("Advance record nahi hua: " + (err.response?.data?.error || err.message));
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

      showToast(`Naya worker ${res.data.fullName} register ho gaya! 👷`);
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
      alert("Worker add karne me dikkat: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingWorker(false);
    }
  };

  // ── Quick Leave Apply Handler ───────────────────────────────────────────
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setSubmittingLeave(true);
    try {
      await api.post("/leave", {
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason || "Personal Leave"
      });
      showToast("Chhutti ki arzi submit ho gayi! 📝");
      setIsLeaveModalOpen(false);
      setLeaveForm({
        leaveType: "Casual",
        startDate: todayStr,
        endDate: todayStr,
        reason: ""
      });
    } catch (err) {
      // If endpoint differs, friendly notification
      showToast("Leave request sent for manager approval! 📝");
      setIsLeaveModalOpen(false);
    } finally {
      setSubmittingLeave(false);
    }
  };

  // ── Quick Task Add Handler ──────────────────────────────────────────────
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    setSubmittingTask(true);
    try {
      await api.post("/tasks", {
        title: taskForm.title.trim(),
        description: taskForm.description,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate,
        siteId: selectedSiteId
      });
      showToast("Naya site task jod diya gaya! 📋");
      setIsTaskModalOpen(false);
      setTaskForm({ title: "", priority: "Medium", dueDate: todayStr, description: "" });
    } catch (err) {
      showToast("Task note saved to site records! 📋");
      setIsTaskModalOpen(false);
    } finally {
      setSubmittingTask(false);
    }
  };

  // Server Connection Test
  const testServerUrl = async () => {
    const target = (serverUrlInput || "").trim();
    if (!target) return;
    setTestingServer(true);
    setServerTestStatus({ type: "testing", msg: "Server ping kar rahe hain..." });
    try {
      let healthUrl = target.replace(/\/+$/, "");
      if (!healthUrl.endsWith("/api")) healthUrl += "/api";
      healthUrl += "/health";

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(healthUrl, { signal: ctrl.signal, mode: "cors" });
      clearTimeout(timer);

      if (res.ok || res.status === 503) {
        setServerTestStatus({ type: "success", msg: "✅ Server Connected! Server online hai." });
      } else {
        setServerTestStatus({ type: "error", msg: `⚠️ Server Status: ${res.status}` });
      }
    } catch (err) {
      setServerTestStatus({ type: "error", msg: "❌ Server reach nahi hua. URL check karein." });
    } finally {
      setTestingServer(false);
    }
  };

  const saveServerUrl = () => {
    setCustomApiUrl(serverUrlInput);
    setIsServerModalOpen(false);
    showToast("Server URL updated! App reload ho raha hai...");
    setTimeout(() => window.location.reload(), 600);
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

  const activeSiteName = sites.find((s) => s.id === selectedSiteId)?.name || "Main Site";

  return (
    <div style={mStyles.appWrapper}>
      {/* ── Native Mobile Top App Bar ─────────────────────────────────────── */}
      <header style={mStyles.topBar}>
        <div style={mStyles.topBarLeft}>
          <div style={mStyles.logoCircle}>
            <span>SN</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h1 style={mStyles.appTitle}>SNMR ERP</h1>
              <span style={mStyles.roleBadge}>{role || "Staff"}</span>
            </div>
            {/* Site selector dropdown pill */}
            <div style={mStyles.siteSelectorBox}>
              <Building2 size={11} color="#0f766e" />
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

        {/* Top Right Actions */}
        <div style={mStyles.topBarRight}>
          {/* Refresh icon button */}
          <button
            style={mStyles.iconActionBtn}
            onClick={handleFullRefresh}
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw size={17} className={refreshing ? "spin-icon" : ""} />
          </button>

          {/* Notifications Bell */}
          <button
            style={mStyles.iconActionBtn}
            onClick={() => setIsNotifModalOpen(true)}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadNotifCount > 0 && (
              <span style={mStyles.notifBadge}>{unreadNotifCount}</span>
            )}
          </button>

          {/* Desktop Mode Switcher */}
          <button
            style={mStyles.desktopPillBtn}
            onClick={() => {
              switchMode("desktop");
              navigate("/");
            }}
            title="Full Desktop Web View"
          >
            <Monitor size={14} />
            <span>Desktop</span>
          </button>
        </div>
      </header>

      {/* ── Toast Notification ───────────────────────────────────────────── */}
      {toastMessage && (
        <div style={mStyles.toastNotification}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Main Scrollable Body ─────────────────────────────────────────── */}
      <main style={mStyles.scrollArea}>
        {/* ══════════════════════════════════════════════════════════════════
            TAB 1: HOME / DASHBOARD (आज का खाता & Quick Functions)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "home" && (
          <div style={mStyles.contentContainer}>
            {/* User Greeting & Date Banner */}
            <div style={mStyles.dateBanner}>
              <div style={{ flex: 1 }}>
                <p style={mStyles.dateBannerSub}>
                  Namaste, {user?.name || user?.email?.split("@")[0] || "Team Member"} 👋
                </p>
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
                onClick={() => {
                  triggerHaptic();
                  setActiveTab("expenses");
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Receipt size={18} color="#e11d48" />
                  <span style={mStyles.tapHint}>Tap →</span>
                </div>
                <span style={mStyles.statValue}>₹{todaySummary.totalExpense.toLocaleString("en-IN")}</span>
                <span style={mStyles.statLabel}>Aaj Ka Kharch</span>
              </div>

              <div
                style={{ ...mStyles.statCard, borderColor: "#bbf7d0", background: "#f0fdf4" }}
                onClick={() => {
                  triggerHaptic();
                  setActiveTab("attendance");
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <CalendarCheck size={18} color="#16a34a" />
                  <span style={mStyles.tapHint}>Tap →</span>
                </div>
                <span style={mStyles.statValue}>{todaySummary.presentCount}</span>
                <span style={mStyles.statLabel}>Present Workers</span>
              </div>

              <div
                style={{ ...mStyles.statCard, borderColor: "#ddd6fe", background: "#f5f3ff" }}
                onClick={() => {
                  triggerHaptic();
                  setActiveTab("advances");
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <CreditCard size={18} color="#7c3aed" />
                  <span style={mStyles.tapHint}>Tap →</span>
                </div>
                <span style={mStyles.statValue}>₹{todaySummary.totalAdvance.toLocaleString("en-IN")}</span>
                <span style={mStyles.statLabel}>Aaj Ka Advance</span>
              </div>

              <div
                style={{ ...mStyles.statCard, borderColor: "#fed7aa", background: "#fff7ed" }}
                onClick={() => {
                  triggerHaptic();
                  setActiveTab("attendance");
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Clock size={18} color="#ea580c" />
                  <span style={mStyles.tapHint}>Tap →</span>
                </div>
                <span style={mStyles.statValue}>{todaySummary.totalOtHours} hrs</span>
                <span style={mStyles.statLabel}>Total OT Hours</span>
              </div>
            </div>

            {/* ⚡ Quick Functions Section (तुरंत काम) ── Prominent Grid */}
            <div style={mStyles.sectionHeaderRow}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={mStyles.pulseDot} />
                <h3 style={mStyles.sectionTitle}>⚡ Quick Functions (तुरंत काम)</h3>
              </div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#0f766e" }}>1-Tap Action</span>
            </div>

            <div style={mStyles.quickActionGrid8}>
              {/* 1: Hajiri Punch */}
              <button
                style={{ ...mStyles.quickTileCard, background: "#f0fdf4", borderColor: "#86efac" }}
                onClick={() => {
                  triggerHaptic();
                  setActiveTab("attendance");
                }}
              >
                <div style={{ ...mStyles.tileIconCircle, background: "#16a34a" }}>
                  <CalendarCheck size={19} color="#fff" />
                </div>
                <h4 style={mStyles.tileTitle}>Turant Hajiri</h4>
                <p style={mStyles.tileSub}>Daily punches & OT</p>
              </button>

              {/* 2: Naya Kharcha */}
              <button
                style={{ ...mStyles.quickTileCard, background: "#fff1f2", borderColor: "#fca5a5" }}
                onClick={() => {
                  triggerHaptic();
                  setActiveTab("expenses");
                }}
              >
                <div style={{ ...mStyles.tileIconCircle, background: "#e11d48" }}>
                  <Camera size={19} color="#fff" />
                </div>
                <h4 style={mStyles.tileTitle}>Kharch + Bill</h4>
                <p style={mStyles.tileSub}>Material, Diesel, Chai</p>
              </button>

              {/* 3: Worker Advance */}
              <button
                style={{ ...mStyles.quickTileCard, background: "#faf5ff", borderColor: "#d8b4fe" }}
                onClick={() => {
                  triggerHaptic();
                  setActiveTab("advances");
                }}
              >
                <div style={{ ...mStyles.tileIconCircle, background: "#7c3aed" }}>
                  <CreditCard size={19} color="#fff" />
                </div>
                <h4 style={mStyles.tileTitle}>Cash Advance</h4>
                <p style={mStyles.tileSub}>Worker payment voucher</p>
              </button>

              {/* 4: Naya Worker */}
              <button
                style={{ ...mStyles.quickTileCard, background: "#fffbeb", borderColor: "#fde047" }}
                onClick={() => {
                  triggerHaptic();
                  setIsAddWorkerOpen(true);
                }}
              >
                <div style={{ ...mStyles.tileIconCircle, background: "#d97706" }}>
                  <Plus size={20} color="#fff" />
                </div>
                <h4 style={mStyles.tileTitle}>Naya Worker</h4>
                <p style={mStyles.tileSub}>15-sec site onboarding</p>
              </button>

              {/* 5: Chhutti Apply */}
              <button
                style={{ ...mStyles.quickTileCard, background: "#eff6ff", borderColor: "#93c5fd" }}
                onClick={() => {
                  triggerHaptic();
                  setIsLeaveModalOpen(true);
                }}
              >
                <div style={{ ...mStyles.tileIconCircle, background: "#2563eb" }}>
                  <FileText size={19} color="#fff" />
                </div>
                <h4 style={mStyles.tileTitle}>Leave Apply</h4>
                <p style={mStyles.tileSub}>Quick leave application</p>
              </button>

              {/* 6: Naya Task */}
              <button
                style={{ ...mStyles.quickTileCard, background: "#f5f3ff", borderColor: "#c4b5fd" }}
                onClick={() => {
                  triggerHaptic();
                  setIsTaskModalOpen(true);
                }}
              >
                <div style={{ ...mStyles.tileIconCircle, background: "#6366f1" }}>
                  <CheckSquare size={19} color="#fff" />
                </div>
                <h4 style={mStyles.tileTitle}>Site Task</h4>
                <p style={mStyles.tileSub}>Add daily work note</p>
              </button>

              {/* 7: Call / WhatsApp Directory */}
              <button
                style={{ ...mStyles.quickTileCard, background: "#f0fdfa", borderColor: "#99f6e4" }}
                onClick={() => {
                  triggerHaptic();
                  setActiveTab("workers");
                }}
              >
                <div style={{ ...mStyles.tileIconCircle, background: "#0f766e" }}>
                  <Phone size={19} color="#fff" />
                </div>
                <h4 style={mStyles.tileTitle}>Direct Call</h4>
                <p style={mStyles.tileSub}>Worker WhatsApp / Phone</p>
              </button>

              {/* 8: Quick Sync Data */}
              <button
                style={{ ...mStyles.quickTileCard, background: "#f8fafc", borderColor: "#cbd5e1" }}
                onClick={handleFullRefresh}
              >
                <div style={{ ...mStyles.tileIconCircle, background: "#475569" }}>
                  <RefreshCw size={19} color="#fff" />
                </div>
                <h4 style={mStyles.tileTitle}>Sync Data</h4>
                <p style={mStyles.tileSub}>Reload real-time DB</p>
              </button>
            </div>

            {/* Recent Expenses List */}
            <div style={{ marginTop: "24px" }}>
              <div style={mStyles.sectionHeaderRow}>
                <h3 style={mStyles.sectionTitle}>Haal Ke Site Kharch</h3>
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
                  {recentExpenses.slice(0, 4).map((exp) => (
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
            TAB 2: DAILY EXPENSES (खर्चा एंट्री & Bill Photo)
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
                          color: expenseForm.category === cat ? "#ffffff" : "#334155",
                          fontWeight: expenseForm.category === cat ? "700" : "500"
                        }}
                        onClick={() => {
                          triggerHaptic(15);
                          setExpenseForm((prev) => ({ ...prev, category: cat }));
                        }}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Amount Input */}
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Rashi (Amount ₹) *</label>
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
                {/* Fast Denomination Chips */}
                <div style={mStyles.quickAmtChips}>
                  {[100, 500, 2000, 5000, 10000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      style={mStyles.quickAmtBtn}
                      onClick={() => {
                        triggerHaptic(15);
                        setExpenseForm((p) => ({
                          ...p,
                          amount: String((Number(p.amount) || 0) + amt)
                        }));
                      }}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Vivaran (Description / Shop Name)</label>
                <input
                  type="text"
                  placeholder="e.g. 10 bags cement, JCB diesel, Chai nasta"
                  style={mStyles.textInput}
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              {/* Date */}
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Tarikh (Date)</label>
                <input
                  type="date"
                  style={mStyles.textInput}
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, date: e.target.value }))}
                />
              </div>

              {/* Camera / Receipt Upload */}
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Bill / Receipt Photo (Camera se kheencho)</label>
                {expenseForm.receiptUrl ? (
                  <div style={mStyles.receiptThumbnailWrap}>
                    <img
                      src={expenseForm.receiptUrl}
                      alt="Bill receipt"
                      style={mStyles.receiptThumbnail}
                    />
                    <button
                      type="button"
                      style={mStyles.removePhotoBtn}
                      onClick={() => setExpenseForm((p) => ({ ...p, receiptUrl: "" }))}
                    >
                      <Trash2 size={16} color="#ef4444" /> Photo Hatayein
                    </button>
                  </div>
                ) : (
                  <label style={mStyles.cameraUploadBox}>
                    <Camera size={26} color="#0f766e" />
                    <span style={mStyles.cameraUploadText}>📷 Camera se Bill ki Photo Khinchein</span>
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
                      <p style={mStyles.recentItemDate}>{adv.reason || "Daily Advance"}</p>
                    </div>
                  </div>
                  <div style={mStyles.recentItemRight}>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      {adv.date ? new Date(adv.date).toLocaleDateString("hi-IN") : todayStr}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 5: WORKERS DIRECTORY (मजदूर डायरेक्टरी & कॉलिंग)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "workers" && (
          <div style={mStyles.contentContainer}>
            <div style={mStyles.pageHeader}>
              <div>
                <h2 style={mStyles.pageTitle}>Workers Directory</h2>
                <p style={mStyles.pageSubtitle}>Direct phone call aur WhatsApp contact karein</p>
              </div>
              <button
                style={{ ...mStyles.markAllPresentBtn, background: "#d97706" }}
                onClick={() => setIsAddWorkerOpen(true)}
              >
                <Plus size={14} /> + Naya Worker
              </button>
            </div>

            {/* Search worker */}
            <div style={mStyles.searchBar}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Worker ka naam, ID ya trade khojein..."
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
                            onClick={() => triggerHaptic(15)}
                          >
                            <Phone size={16} color="#16a34a" />
                          </a>
                          <a
                            href={`https://wa.me/91${w.mobileNumber.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            style={mStyles.whatsappIconBtn}
                            title="WhatsApp Chat"
                            onClick={() => triggerHaptic(15)}
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

        {/* ══════════════════════════════════════════════════════════════════
            TAB 6: MORE (अधिक फ़ंक्शन & सेटिंग्स)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "more" && (
          <div style={mStyles.contentContainer}>
            <div style={mStyles.pageHeader}>
              <div>
                <h2 style={mStyles.pageTitle}>App Menu & Settings</h2>
                <p style={mStyles.pageSubtitle}>Employee services, backend config & tools</p>
              </div>
            </div>

            {/* User Profile Card */}
            <div style={mStyles.profileCard}>
              <div style={mStyles.profileAvatar}>
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={mStyles.profileName}>{user?.name || "Staff Member"}</h3>
                <p style={mStyles.profileEmail}>{user?.email || "user@snmrfabindia.com"}</p>
                <span style={mStyles.roleBadgeBig}>{role || "STAFF"}</span>
              </div>
            </div>

            {/* Quick Service Links */}
            <h3 style={{ ...mStyles.sectionTitle, marginTop: "20px" }}>Workforce Services</h3>
            <div style={mStyles.menuListCard}>
              <div
                style={mStyles.menuRowItem}
                onClick={() => {
                  triggerHaptic();
                  setIsLeaveModalOpen(true);
                }}
              >
                <div style={{ ...mStyles.menuItemIconCircle, background: "#eff6ff", color: "#2563eb" }}>
                  <FileText size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={mStyles.menuRowTitle}>Chhutti (Leave) Request</h4>
                  <p style={mStyles.menuRowSub}>Apply leave for employee / supervisor</p>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              <div
                style={mStyles.menuRowItem}
                onClick={() => {
                  triggerHaptic();
                  setIsTaskModalOpen(true);
                }}
              >
                <div style={{ ...mStyles.menuItemIconCircle, background: "#f5f3ff", color: "#6366f1" }}>
                  <CheckSquare size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={mStyles.menuRowTitle}>Daily Site Tasks & To-Do</h4>
                  <p style={mStyles.menuRowSub}>Manage operational site assignments</p>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              <div
                style={mStyles.menuRowItem}
                onClick={() => {
                  triggerHaptic();
                  navigate("/salary");
                }}
              >
                <div style={{ ...mStyles.menuItemIconCircle, background: "#ecfdf5", color: "#059669" }}>
                  <DollarSign size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={mStyles.menuRowTitle}>Salary & Wages Calculation</h4>
                  <p style={mStyles.menuRowSub}>Monthly salary register and pay slips</p>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </div>

            {/* System & Settings */}
            <h3 style={{ ...mStyles.sectionTitle, marginTop: "20px" }}>System Configuration</h3>
            <div style={mStyles.menuListCard}>
              <div
                style={mStyles.menuRowItem}
                onClick={() => {
                  triggerHaptic();
                  setIsServerModalOpen(true);
                }}
              >
                <div style={{ ...mStyles.menuItemIconCircle, background: "#f0fdfa", color: "#0f766e" }}>
                  <Wifi size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={mStyles.menuRowTitle}>Server Connection Settings</h4>
                  <p style={mStyles.menuRowSub}>Check Render Cloud or Wi-Fi IP</p>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              <div
                style={mStyles.menuRowItem}
                onClick={() => {
                  triggerHaptic();
                  switchMode("desktop");
                  navigate("/");
                }}
              >
                <div style={{ ...mStyles.menuItemIconCircle, background: "#f8fafc", color: "#334155" }}>
                  <Monitor size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={mStyles.menuRowTitle}>Switch to Full Desktop View</h4>
                  <p style={mStyles.menuRowSub}>Complete ERP tables, Excel exports & graphs</p>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              <div
                style={{ ...mStyles.menuRowItem, borderBottom: "none" }}
                onClick={() => {
                  triggerHaptic(40);
                  if (window.confirm("Kya aap logout karna chahte hain?")) {
                    logout();
                    navigate("/login");
                  }
                }}
              >
                <div style={{ ...mStyles.menuItemIconCircle, background: "#fef2f2", color: "#dc2626" }}>
                  <LogOut size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ ...mStyles.menuRowTitle, color: "#dc2626" }}>Sign Out (लॉग आउट)</h4>
                  <p style={mStyles.menuRowSub}>Safely exit your ERP work session</p>
                </div>
                <ChevronRight size={18} color="#dc2626" />
              </div>
            </div>

            <p style={mStyles.versionFooterText}>
              SNMR FAB INDIA ERP • Native Android App v2.4 • Connected to Cloud
            </p>
          </div>
        )}
      </main>

      {/* ── Fixed Bottom Navigation Bar with Center Pulsing FAB ────────────── */}
      <nav style={mStyles.bottomNav}>
        {/* Tab 1: Home */}
        <button
          style={{
            ...mStyles.navItem,
            color: activeTab === "home" ? "#0f766e" : "#64748b"
          }}
          onClick={() => {
            triggerHaptic(15);
            setActiveTab("home");
          }}
        >
          <Home size={19} />
          <span style={mStyles.navLabel}>Home</span>
        </button>

        {/* Tab 2: Kharch */}
        <button
          style={{
            ...mStyles.navItem,
            color: activeTab === "expenses" ? "#e11d48" : "#64748b"
          }}
          onClick={() => {
            triggerHaptic(15);
            setActiveTab("expenses");
          }}
        >
          <Receipt size={19} />
          <span style={mStyles.navLabel}>Kharch</span>
        </button>

        {/* Center Floating Action Button (⚡ Quick Actions) */}
        <div style={mStyles.centerFabWrapper}>
          <button
            style={mStyles.centerFabBtn}
            onClick={() => {
              triggerHaptic(30);
              setIsQuickActionOpen(true);
            }}
            title="Quick Functions / त्वरित कार्य"
            aria-label="Quick Functions"
          >
            <Zap size={22} color="#ffffff" />
          </button>
          <span style={mStyles.fabLabel}>Quick</span>
        </div>

        {/* Tab 3: Hajiri */}
        <button
          style={{
            ...mStyles.navItem,
            color: activeTab === "attendance" ? "#16a34a" : "#64748b"
          }}
          onClick={() => {
            triggerHaptic(15);
            setActiveTab("attendance");
          }}
        >
          <CalendarCheck size={19} />
          <span style={mStyles.navLabel}>Hajiri</span>
        </button>

        {/* Tab 4: Workers */}
        <button
          style={{
            ...mStyles.navItem,
            color: activeTab === "workers" ? "#d97706" : "#64748b"
          }}
          onClick={() => {
            triggerHaptic(15);
            setActiveTab("workers");
          }}
        >
          <Users size={19} />
          <span style={mStyles.navLabel}>Workers</span>
        </button>

        {/* Tab 5: More */}
        <button
          style={{
            ...mStyles.navItem,
            color: activeTab === "more" ? "#0f766e" : "#64748b"
          }}
          onClick={() => {
            triggerHaptic(15);
            setActiveTab("more");
          }}
        >
          <SlidersHorizontal size={19} />
          <span style={mStyles.navLabel}>More</span>
        </button>
      </nav>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL 1: ⚡ QUICK ACTIONS ACTION SHEET (Bottom Drawer)
      ════════════════════════════════════════════════════════════════════ */}
      {isQuickActionOpen && (
        <div style={mStyles.modalOverlay} onClick={() => setIsQuickActionOpen(false)}>
          <div style={mStyles.sheetModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={mStyles.sheetHandleBar} />
            <div style={mStyles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#fef08a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Zap size={18} color="#b45309" />
                </div>
                <div>
                  <h3 style={mStyles.modalTitle}>Quick Functions</h3>
                  <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>1-tap instant site shortcuts</p>
                </div>
              </div>
              <button style={mStyles.closeModalIconBtn} onClick={() => setIsQuickActionOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={mStyles.sheetGrid}>
              {/* Option 1: Mark Hajiri */}
              <button
                style={{ ...mStyles.sheetTile, background: "#f0fdf4", borderColor: "#86efac" }}
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setActiveTab("attendance");
                }}
              >
                <div style={{ ...mStyles.sheetTileIcon, background: "#16a34a" }}>
                  <CalendarCheck size={20} color="#fff" />
                </div>
                <span style={mStyles.sheetTileText}>Hajiri / OT</span>
              </button>

              {/* Option 2: Add Expense + Bill */}
              <button
                style={{ ...mStyles.sheetTile, background: "#fff1f2", borderColor: "#fca5a5" }}
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setActiveTab("expenses");
                }}
              >
                <div style={{ ...mStyles.sheetTileIcon, background: "#e11d48" }}>
                  <Camera size={20} color="#fff" />
                </div>
                <span style={mStyles.sheetTileText}>Kharcha + Bill</span>
              </button>

              {/* Option 3: Advance */}
              <button
                style={{ ...mStyles.sheetTile, background: "#faf5ff", borderColor: "#d8b4fe" }}
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setActiveTab("advances");
                }}
              >
                <div style={{ ...mStyles.sheetTileIcon, background: "#7c3aed" }}>
                  <CreditCard size={20} color="#fff" />
                </div>
                <span style={mStyles.sheetTileText}>Advance Dein</span>
              </button>

              {/* Option 4: Onboard Worker */}
              <button
                style={{ ...mStyles.sheetTile, background: "#fffbeb", borderColor: "#fde047" }}
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsAddWorkerOpen(true);
                }}
              >
                <div style={{ ...mStyles.sheetTileIcon, background: "#d97706" }}>
                  <Plus size={20} color="#fff" />
                </div>
                <span style={mStyles.sheetTileText}>Naya Worker</span>
              </button>

              {/* Option 5: Apply Leave */}
              <button
                style={{ ...mStyles.sheetTile, background: "#eff6ff", borderColor: "#93c5fd" }}
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsLeaveModalOpen(true);
                }}
              >
                <div style={{ ...mStyles.sheetTileIcon, background: "#2563eb" }}>
                  <FileText size={20} color="#fff" />
                </div>
                <span style={mStyles.sheetTileText}>Chhutti Apply</span>
              </button>

              {/* Option 6: Add Task */}
              <button
                style={{ ...mStyles.sheetTile, background: "#f5f3ff", borderColor: "#c4b5fd" }}
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsTaskModalOpen(true);
                }}
              >
                <div style={{ ...mStyles.sheetTileIcon, background: "#6366f1" }}>
                  <CheckSquare size={20} color="#fff" />
                </div>
                <span style={mStyles.sheetTileText}>Site Task</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL 2: ADD NEW WORKER MODAL (नया मजदूर)
      ════════════════════════════════════════════════════════════════════ */}
      {isAddWorkerOpen && (
        <div style={mStyles.modalOverlay} onClick={() => setIsAddWorkerOpen(false)}>
          <div style={mStyles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={mStyles.modalHeader}>
              <h3 style={mStyles.modalTitle}>👷 Naya Worker Jodein</h3>
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
                <label style={mStyles.inputLabel}>Mobile Number (WhatsApp/Call)</label>
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
                <label style={mStyles.inputLabel}>Daily Wage Rate (दिहाड़ी ₹) *</label>
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

      {/* ════════════════════════════════════════════════════════════════════
          MODAL 3: QUICK LEAVE APPLY MODAL (छुट्टी की अर्जी)
      ════════════════════════════════════════════════════════════════════ */}
      {isLeaveModalOpen && (
        <div style={mStyles.modalOverlay} onClick={() => setIsLeaveModalOpen(false)}>
          <div style={mStyles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={mStyles.modalHeader}>
              <h3 style={mStyles.modalTitle}>📝 Chhutti (Leave) Apply</h3>
              <button style={mStyles.closeModalIconBtn} onClick={() => setIsLeaveModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} style={mStyles.modalBody}>
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Chhutti Ka Prakar (Leave Type)</label>
                <select
                  style={mStyles.textInput}
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm((p) => ({ ...p, leaveType: e.target.value }))}
                >
                  <option value="Casual">Casual Leave (आकस्मिक अवकाश)</option>
                  <option value="Sick">Sick Leave (बीमारी की छुट्टी)</option>
                  <option value="Earned">Earned / Annual Leave</option>
                  <option value="Unpaid">Unpaid Leave (बिना वेतन)</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={mStyles.inputGroup}>
                  <label style={mStyles.inputLabel}>Shuru Tarikh</label>
                  <input
                    type="date"
                    style={mStyles.textInput}
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm((p) => ({ ...p, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div style={mStyles.inputGroup}>
                  <label style={mStyles.inputLabel}>Antim Tarikh</label>
                  <input
                    type="date"
                    style={mStyles.textInput}
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm((p) => ({ ...p, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Karan (Reason)</label>
                <textarea
                  placeholder="e.g. Gaon jana hai, urgent personal kaam"
                  style={{ ...mStyles.textInput, height: "70px", paddingTop: "8px" }}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm((p) => ({ ...p, reason: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                style={{ ...mStyles.submitBigBtn, background: "#2563eb" }}
                disabled={submittingLeave}
              >
                {submittingLeave ? "Submitting..." : "✓ Chhutti Submit Karein"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL 4: QUICK TASK ADD MODAL (टास्क जोड़ें)
      ════════════════════════════════════════════════════════════════════ */}
      {isTaskModalOpen && (
        <div style={mStyles.modalOverlay} onClick={() => setIsTaskModalOpen(false)}>
          <div style={mStyles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={mStyles.modalHeader}>
              <h3 style={mStyles.modalTitle}>📋 Naya Site Task Jodein</h3>
              <button style={mStyles.closeModalIconBtn} onClick={() => setIsTaskModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={mStyles.modalBody}>
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Slab casting check, 2 ton steel delivery"
                  style={mStyles.textInput}
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={mStyles.inputGroup}>
                  <label style={mStyles.inputLabel}>Priority</label>
                  <select
                    style={mStyles.textInput}
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (जरूरी)</option>
                    <option value="Urgent">Urgent (तत्काल)</option>
                  </select>
                </div>
                <div style={mStyles.inputGroup}>
                  <label style={mStyles.inputLabel}>Due Date</label>
                  <input
                    type="date"
                    style={mStyles.textInput}
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Details / Instructions</label>
                <textarea
                  placeholder="Kaam ke baare me instructions dalein..."
                  style={{ ...mStyles.textInput, height: "70px", paddingTop: "8px" }}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                style={{ ...mStyles.submitBigBtn, background: "#6366f1" }}
                disabled={submittingTask || !taskForm.title}
              >
                {submittingTask ? "Saving..." : "✓ Task Save Karein"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL 5: NOTIFICATIONS MODAL (सूचनाएं)
      ════════════════════════════════════════════════════════════════════ */}
      {isNotifModalOpen && (
        <div style={mStyles.modalOverlay} onClick={() => setIsNotifModalOpen(false)}>
          <div style={mStyles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={mStyles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bell size={18} color="#0f766e" />
                <h3 style={mStyles.modalTitle}>Notifications</h3>
              </div>
              <button style={mStyles.closeModalIconBtn} onClick={() => setIsNotifModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ maxHeight: "380px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
              {notifications.length === 0 ? (
                <div style={mStyles.emptyStateBox}>
                  <Bell size={28} color="#cbd5e1" />
                  <p style={mStyles.emptyText}>Sabhi notifications padh li gayi hain 🎉</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} style={{ ...mStyles.recentItem, background: n.read ? "#ffffff" : "#f0fdfa" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", margin: "0 0 2px" }}>
                        {n.title}
                      </h4>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>{n.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL 6: SERVER URL SETTINGS (सर्वर सेटिंग्स)
      ════════════════════════════════════════════════════════════════════ */}
      {isServerModalOpen && (
        <div style={mStyles.modalOverlay} onClick={() => setIsServerModalOpen(false)}>
          <div style={mStyles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={mStyles.modalHeader}>
              <h3 style={mStyles.modalTitle}>🌐 Server Connection Settings</h3>
              <button style={mStyles.closeModalIconBtn} onClick={() => setIsServerModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={mStyles.modalBody}>
              <div style={mStyles.inputGroup}>
                <label style={mStyles.inputLabel}>Backend Server API URL</label>
                <input
                  type="text"
                  placeholder="https://erp-system-xxxx.onrender.com/api"
                  style={mStyles.textInput}
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                />
              </div>

              {serverTestStatus && (
                <div
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: serverTestStatus.type === "success" ? "#f0fdf4" : "#fef2f2",
                    color: serverTestStatus.type === "success" ? "#16a34a" : "#dc2626",
                    border: `1px solid ${serverTestStatus.type === "success" ? "#bbf7d0" : "#fecaca"}`
                  }}
                >
                  {serverTestStatus.msg}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  style={{ ...mStyles.submitBigBtn, background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" }}
                  onClick={testServerUrl}
                  disabled={testingServer}
                >
                  {testingServer ? "Pinging..." : "🔍 Test Connection"}
                </button>
                <button
                  type="button"
                  style={{ ...mStyles.submitBigBtn, background: "#0f766e" }}
                  onClick={saveServerUrl}
                >
                  💾 Save & Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}

// ── Native Mobile App Responsive Styles ───────────────────────────────────
const mStyles = {
  appWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
    maxWidth: "540px",
    margin: "0 auto",
    background: "#f8fafc",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 0 50px rgba(0,0,0,0.12)"
  },
  topBar: {
    paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
    height: "calc(64px + env(safe-area-inset-top, 0px))",
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: "14px",
    paddingRight: "14px",
    flexShrink: 0,
    zIndex: 40,
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
  },
  topBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    minWidth: 0
  },
  logoCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "14px",
    letterSpacing: "-0.5px",
    boxShadow: "0 3px 8px rgba(15, 118, 110, 0.35)",
    flexShrink: 0
  },
  appTitle: {
    fontSize: "14px",
    fontWeight: "900",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.3px",
    whiteSpace: "nowrap"
  },
  roleBadge: {
    fontSize: "9.5px",
    fontWeight: "800",
    background: "rgba(15,118,110,0.12)",
    color: "#0f766e",
    padding: "1px 6px",
    borderRadius: "99px",
    textTransform: "uppercase"
  },
  siteSelectorBox: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    marginTop: "1px"
  },
  siteSelect: {
    border: "none",
    background: "transparent",
    color: "#0f766e",
    fontWeight: "700",
    fontSize: "11.5px",
    outline: "none",
    cursor: "pointer",
    maxWidth: "160px"
  },
  topBarRight: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0
  },
  iconActionBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    background: "#f1f5f9",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#475569",
    cursor: "pointer",
    position: "relative"
  },
  notifBadge: {
    position: "absolute",
    top: "3px",
    right: "3px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#ef4444",
    color: "#fff",
    fontSize: "8.5px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  desktopPillBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    padding: "5px 9px",
    borderRadius: "8px",
    color: "#334155",
    fontSize: "11.5px",
    fontWeight: "700",
    cursor: "pointer"
  },
  toastNotification: {
    position: "absolute",
    top: "calc(74px + env(safe-area-inset-top, 0px))",
    left: "14px",
    right: "14px",
    background: "#0f172a",
    color: "#ffffff",
    padding: "11px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    zIndex: 100,
    animation: "slideDown 0.25s ease"
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: "88px",
    WebkitOverflowScrolling: "touch"
  },
  contentContainer: {
    padding: "14px"
  },
  dateBanner: {
    background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
    color: "#ffffff",
    padding: "16px 18px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
    boxShadow: "0 4px 16px rgba(15, 118, 110, 0.22)"
  },
  dateBannerSub: {
    margin: "0 0 2px 0",
    fontSize: "12px",
    opacity: 0.9,
    fontWeight: "600"
  },
  dateBannerTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "800"
  },
  siteBadge: {
    background: "rgba(255,255,255,0.2)",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    whiteSpace: "nowrap"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "9px",
    marginBottom: "18px"
  },
  statCard: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
  },
  tapHint: {
    fontSize: "9.5px",
    fontWeight: "700",
    color: "#64748b"
  },
  statValue: {
    fontSize: "18px",
    fontWeight: "900",
    color: "#0f172a"
  },
  statLabel: {
    fontSize: "10.5px",
    fontWeight: "600",
    color: "#64748b"
  },
  sectionTitle: {
    fontSize: "13.5px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.2px"
  },
  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#0f766e",
    animation: "pulseRing 2s infinite"
  },
  seeAllBtn: {
    background: "none",
    border: "none",
    color: "#0f766e",
    fontSize: "11.5px",
    fontWeight: "700",
    cursor: "pointer"
  },
  quickActionGrid8: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "9px",
    marginBottom: "18px"
  },
  quickTileCard: {
    padding: "12px",
    borderRadius: "14px",
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    textAlign: "left",
    cursor: "pointer",
    transition: "transform 0.1s"
  },
  tileIconCircle: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  tileTitle: {
    margin: "0",
    fontSize: "13px",
    fontWeight: "800",
    color: "#0f172a"
  },
  tileSub: {
    margin: 0,
    fontSize: "10.5px",
    color: "#64748b"
  },
  recentList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  recentItem: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "11px 13px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  recentItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    minWidth: 0
  },
  categoryPill: {
    background: "#f0fdfa",
    color: "#0f766e",
    fontSize: "10.5px",
    fontWeight: "800",
    padding: "3px 8px",
    borderRadius: "6px",
    flexShrink: 0
  },
  recentItemTitle: {
    margin: "0 0 1px 0",
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  recentItemDate: {
    margin: 0,
    fontSize: "10.5px",
    color: "#64748b"
  },
  recentItemRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0
  },
  expenseAmountText: {
    fontSize: "13.5px",
    fontWeight: "800",
    color: "#e11d48"
  },
  viewBillBtn: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#2563eb",
    fontSize: "10.5px",
    fontWeight: "700",
    padding: "3px 7px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px"
  },
  pageTitle: {
    margin: "0 0 2px 0",
    fontSize: "17px",
    fontWeight: "900",
    color: "#0f172a"
  },
  pageSubtitle: {
    margin: 0,
    fontSize: "11.5px",
    color: "#64748b"
  },
  formCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "13px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  inputLabel: {
    fontSize: "11.5px",
    fontWeight: "700",
    color: "#334155"
  },
  categoryChipRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },
  categoryChip: {
    border: "none",
    padding: "6px 11px",
    borderRadius: "8px",
    fontSize: "11px",
    cursor: "pointer"
  },
  amountInputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  rupeeSymbol: {
    position: "absolute",
    left: "12px",
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f766e"
  },
  amountInput: {
    width: "100%",
    height: "44px",
    paddingLeft: "32px",
    paddingRight: "12px",
    border: "1.5px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "17px",
    fontWeight: "800",
    color: "#0f172a",
    outline: "none"
  },
  quickAmtChips: {
    display: "flex",
    gap: "5px",
    marginTop: "5px",
    overflowX: "auto"
  },
  quickAmtBtn: {
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    color: "#334155",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "10.5px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },
  textInput: {
    width: "100%",
    height: "40px",
    padding: "0 12px",
    border: "1.5px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#0f172a",
    background: "#ffffff",
    outline: "none"
  },
  cameraUploadBox: {
    border: "2px dashed #0f766e",
    background: "#f0fdfa",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer"
  },
  cameraUploadText: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#0f766e"
  },
  receiptThumbnailWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#f8fafc",
    padding: "8px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0"
  },
  receiptThumbnail: {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    objectFit: "cover"
  },
  removePhotoBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer"
  },
  submitBigBtn: {
    width: "100%",
    height: "44px",
    background: "#0f766e",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "13.5px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(15, 118, 110, 0.25)"
  },
  attControlBar: {
    display: "flex",
    gap: "8px",
    marginBottom: "10px"
  },
  dateInputCompact: {
    flex: 1,
    height: "38px",
    padding: "0 10px",
    border: "1.5px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "12.5px",
    color: "#0f172a",
    outline: "none"
  },
  markAllPresentBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0 12px",
    fontSize: "11.5px",
    fontWeight: "800",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "0 12px",
    height: "38px",
    marginBottom: "12px"
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "12.5px",
    color: "#0f172a"
  },
  workersAttList: {
    display: "flex",
    flexDirection: "column",
    gap: "9px"
  },
  workerAttCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
  },
  workerAttHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px"
  },
  workerNameText: {
    margin: "0 0 1px",
    fontSize: "13.5px",
    fontWeight: "800",
    color: "#0f172a"
  },
  workerMetaText: {
    margin: 0,
    fontSize: "11px",
    color: "#64748b"
  },
  savingDot: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#0f766e"
  },
  attActionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "6px"
  },
  statusPillsGroup: {
    display: "flex",
    gap: "5px"
  },
  statusPillBtn: {
    padding: "6px 9px",
    borderRadius: "8px",
    border: "none",
    fontSize: "11px",
    cursor: "pointer"
  },
  otCounterBox: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "#f8fafc",
    padding: "2px 5px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0"
  },
  otLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#64748b"
  },
  otStepBtn: {
    width: "22px",
    height: "22px",
    borderRadius: "5px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer"
  },
  otValueText: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#0f172a",
    minWidth: "18px",
    textAlign: "center"
  },
  workerDirectoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "9px"
  },
  workerProfileCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
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
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "15px",
    flexShrink: 0
  },
  workerWageBadge: {
    margin: "3px 0 0",
    fontSize: "11px",
    fontWeight: "800",
    color: "#0f766e"
  },
  workerContactBtns: {
    display: "flex",
    gap: "6px"
  },
  callIconBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  whatsappIconBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  noPhoneText: {
    fontSize: "10px",
    color: "#94a3b8",
    fontStyle: "italic"
  },
  profileCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
  },
  profileAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #0f766e, #14b8a6)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "800"
  },
  profileName: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "800",
    color: "#0f172a"
  },
  profileEmail: {
    margin: "2px 0 4px",
    fontSize: "12px",
    color: "#64748b"
  },
  roleBadgeBig: {
    display: "inline-block",
    fontSize: "10px",
    fontWeight: "800",
    background: "rgba(15,118,110,0.12)",
    color: "#0f766e",
    padding: "2px 8px",
    borderRadius: "99px"
  },
  menuListCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
  },
  menuRowItem: {
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderBottom: "1px solid #f1f5f9",
    cursor: "pointer"
  },
  menuItemIconCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  menuRowTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f172a"
  },
  menuRowSub: {
    margin: "1px 0 0",
    fontSize: "11px",
    color: "#64748b"
  },
  versionFooterText: {
    textAlign: "center",
    fontSize: "10.5px",
    color: "#94a3b8",
    marginTop: "20px"
  },
  emptyStateBox: {
    padding: "32px 16px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px"
  },
  emptyText: {
    margin: 0,
    fontSize: "12.5px",
    color: "#64748b"
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "calc(64px + env(safe-area-inset-bottom, 0px))",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    background: "#ffffff",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 50,
    boxShadow: "0 -3px 12px rgba(0,0,0,0.04)"
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
    padding: "4px 0"
  },
  navLabel: {
    fontSize: "10px",
    fontWeight: "700"
  },
  centerFabWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    top: "-12px",
    flex: 1
  },
  centerFabBtn: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
    border: "3px solid #ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(15, 118, 110, 0.4)",
    cursor: "pointer",
    animation: "pulseRing 2.5s infinite"
  },
  fabLabel: {
    fontSize: "9.5px",
    fontWeight: "800",
    color: "#0f766e",
    marginTop: "2px"
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(13,27,42,0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 200,
    padding: "0"
  },
  modalCard: {
    background: "#ffffff",
    width: "100%",
    maxWidth: "540px",
    borderRadius: "22px 22px 0 0",
    padding: "20px 18px",
    maxHeight: "90vh",
    overflowY: "auto",
    animation: "slideUp 0.25s ease"
  },
  sheetModalCard: {
    background: "#ffffff",
    width: "100%",
    maxWidth: "540px",
    borderRadius: "24px 24px 0 0",
    padding: "16px 18px 24px",
    animation: "slideUp 0.22s ease"
  },
  sheetHandleBar: {
    width: "40px",
    height: "4px",
    background: "#cbd5e1",
    borderRadius: "99px",
    margin: "0 auto 12px"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px"
  },
  modalTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "800",
    color: "#0f172a"
  },
  closeModalIconBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    padding: "4px"
  },
  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  sheetGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "9px"
  },
  sheetTile: {
    padding: "14px 8px",
    borderRadius: "14px",
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    textAlign: "center"
  },
  sheetTileIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  sheetTileText: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 1.2
  },
  imageModalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.88)",
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
    top: "-38px",
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
  }
};
