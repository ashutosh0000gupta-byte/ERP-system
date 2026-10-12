import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet, Search, Plus, Filter, Download, Eye, Trash2,
  Calendar, Building2, HardDrive, Tag, Layers, RefreshCw, X,
  CheckCircle2, AlertTriangle, Lock, EyeOff, Play, Folder,
  Clock, ShieldAlert, ArrowUpDown, FileText, ChevronRight,
  ExternalLink, Sparkles
} from "lucide-react";

export default function ExcelSheetsHub() {
  const navigate = useNavigate();

  // Data state
  const [archives, setArchives] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSite, setSelectedSite] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [viewMode, setViewMode] = useState("grouped"); // 'grouped' | 'grid' | 'table'

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Worker Payroll");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [uploadSiteId, setUploadSiteId] = useState("");
  const [uploadMonth, setUploadMonth] = useState(new Date().getMonth() + 1);
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear());
  const [uploadNotes, setUploadNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // Delete Security Modal State
  const [deletingItem, setDeletingItem] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // In-Browser Preview Modal State
  const [previewItem, setPreviewItem] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSheets, setPreviewSheets] = useState([]);
  const [activeSheetName, setActiveSheetName] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [previewSearch, setPreviewSearch] = useState("");
  const [previewError, setPreviewError] = useState("");

  // Initial Load
  useEffect(() => {
    fetchData();
    fetchSites();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [archivesRes, categoriesRes] = await Promise.all([
        api.get("/snmr/excel-sheets"),
        api.get("/snmr/excel-sheets/categories")
      ]);
      setArchives(archivesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error("Failed to load Excel archives:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await api.get("/snmr/sites");
      setSites(res.data || []);
    } catch (err) {
      console.error("Failed to load sites:", err);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filtered Sheets
  const filteredArchives = useMemo(() => {
    return archives.filter((item) => {
      // Category filter
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }
      // Site filter
      if (selectedSite !== "All" && item.siteId !== selectedSite) {
        return false;
      }
      // Month filter
      if (selectedMonth !== "All" && Number(item.month) !== Number(selectedMonth)) {
        return false;
      }
      // Year filter
      if (selectedYear !== "All" && Number(item.year) !== Number(selectedYear)) {
        return false;
      }
      // Live Search query (Title, File Name, Category, Site, Notes, Uploader)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.title || "").toLowerCase().includes(q);
        const matchFile = (item.fileName || "").toLowerCase().includes(q);
        const matchCat = (item.category || "").toLowerCase().includes(q);
        const matchSite = (item.siteName || "").toLowerCase().includes(q);
        const matchNotes = (item.notes || "").toLowerCase().includes(q);
        const matchUser = (item.uploadedBy || "").toLowerCase().includes(q);
        if (!matchTitle && !matchFile && !matchCat && !matchSite && !matchNotes && !matchUser) {
          return false;
        }
      }
      return true;
    });
  }, [archives, selectedCategory, selectedSite, selectedMonth, selectedYear, searchQuery]);

  // Grouped by Category
  const groupedArchives = useMemo(() => {
    const groups = {};
    filteredArchives.forEach((item) => {
      const cat = item.category || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredArchives]);

  // Total Storage Size calculation
  const totalSizeBytes = useMemo(() => {
    return archives.reduce((acc, a) => acc + (Number(a.fileSize) || 0), 0);
  }, [archives]);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Handle File selection in upload modal
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setUploadTitle(cleanName);
      }
      setUploadError("");
    }
  };

  // Submit Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please choose an Excel (.xlsx, .xls) or CSV (.csv) file.");
      return;
    }

    const finalCategory = isCustomCategory
      ? (customCategoryInput.trim() || "Custom Category")
      : uploadCategory;

    if (!finalCategory.trim()) {
      setUploadError("Please provide a category for this Excel sheet.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError("");

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadTitle.trim() || uploadFile.name);
      formData.append("category", finalCategory);
      if (uploadSiteId && uploadSiteId !== "All") formData.append("siteId", uploadSiteId);
      if (uploadMonth && uploadMonth !== "All") formData.append("month", String(uploadMonth));
      if (uploadYear && uploadYear !== "All") formData.append("year", String(uploadYear));
      if (uploadNotes.trim()) formData.append("notes", uploadNotes.trim());

      await api.post("/snmr/excel-sheets/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setShowUploadModal(false);
      resetUploadForm();
      await fetchData();
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.error || err.message || "Failed to upload Excel sheet.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle("");
    setUploadCategory("Worker Payroll");
    setIsCustomCategory(false);
    setCustomCategoryInput("");
    setUploadSiteId("");
    setUploadMonth(new Date().getMonth() + 1);
    setUploadYear(new Date().getFullYear());
    setUploadNotes("");
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Password-Protected Delete
  const handleOpenDelete = (item) => {
    setDeletingItem(item);
    setDeletePassword("");
    setShowPassword(false);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter the admin security password.");
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");
      await api.delete(`/snmr/excel-sheets/${deletingItem.id}`, {
        data: { password: deletePassword }
      });
      setDeletingItem(null);
      await fetchData();
    } catch (err) {
      setDeleteError(err.response?.data?.error || "Incorrect admin password or deletion failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  // In-Browser Preview
  const handleOpenPreview = async (item) => {
    setPreviewItem(item);
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewSheets([]);
    setPreviewData([]);
    setActiveSheetName("");
    setPreviewSearch("");

    try {
      const fileUrl = item.fileUrl.startsWith("http")
        ? item.fileUrl
        : `${api.defaults.baseURL.replace(/\/api$/, "")}${item.fileUrl}`;

      const res = await api.get(fileUrl, { responseType: "arraybuffer" });
      const workbook = XLSX.read(res.data, { type: "array" });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error("No sheets found in workbook.");
      }

      setPreviewSheets(workbook.SheetNames);
      const firstSheet = workbook.SheetNames[0];
      setActiveSheetName(firstSheet);

      const worksheet = workbook.Sheets[firstSheet];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      setPreviewData(json);
    } catch (err) {
      console.error("Preview error:", err);
      setPreviewError("Unable to parse preview. You can still download the file directly.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSwitchPreviewSheet = (sheetName) => {
    if (!previewItem) return;
    setActiveSheetName(sheetName);
    try {
      const fileUrl = previewItem.fileUrl.startsWith("http")
        ? previewItem.fileUrl
        : `${api.defaults.baseURL.replace(/\/api$/, "")}${previewItem.fileUrl}`;

      api.get(fileUrl, { responseType: "arraybuffer" }).then((res) => {
        const workbook = XLSX.read(res.data, { type: "array" });
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        setPreviewData(json);
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Download Trigger
  const handleDownload = (item) => {
    const fileUrl = item.fileUrl.startsWith("http")
      ? item.fileUrl
      : `${api.defaults.baseURL.replace(/\/api$/, "")}${item.fileUrl}`;

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = item.fileName || "sheet.xlsx";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct Payroll Link
  const handleProcessAsPayroll = (item) => {
    navigate("/salary", {
      state: {
        fromExcelHub: true,
        month: item.month,
        year: item.year,
        siteId: item.siteId,
        sheetTitle: item.title,
        fileUrl: item.fileUrl
      }
    });
  };

  // Preset categories for quick selection
  const presetCategories = [
    "Worker Payroll",
    "Monthly Attendance",
    "Site Expenses & Advances",
    "PF / ESIC Statutory",
    "Contractor Wages",
    "Inventory & Material",
    "General Reports"
  ];

  // Distinct category names from server + defaults
  const allAvailableCategories = useMemo(() => {
    const set = new Set(presetCategories);
    categories.forEach(c => set.add(c.name));
    archives.forEach(a => { if (a.category) set.add(a.category); });
    return Array.from(set);
  }, [categories, archives]);

  return (
    <MainLayout>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div>
            <div style={styles.titleRow}>
              <div style={styles.iconBadge}>
                <FileSpreadsheet size={24} color="#0f766e" />
              </div>
              <div>
                <h1 style={styles.title}>Excel Sheets Hub & Repository</h1>
                <p style={styles.subtitle}>
                  Archive, search, and categorize all company spreadsheets (.xlsx, .xls, .csv). Group by category, instant search, and secure password-protected deletion.
                </p>
              </div>
            </div>
          </div>

          <div style={styles.headerActions}>
            <button
              style={styles.refreshBtn}
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh repository"
            >
              <RefreshCw size={16} className={refreshing ? "spin-animate" : ""} />
              <span>Refresh</span>
            </button>

            <button
              style={styles.payrollShortcutBtn}
              onClick={() => navigate("/salary")}
              title="Open Worker Payroll"
            >
              <Play size={16} />
              <span>Worker Payroll</span>
            </button>

            <button
              style={styles.uploadBtn}
              onClick={() => setShowUploadModal(true)}
            >
              <Plus size={18} />
              <span>Upload New Excel</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>
              <FileSpreadsheet size={20} color="#0f766e" />
            </div>
            <div>
              <div style={styles.statLabel}>Total Excel Sheets</div>
              <div style={styles.statValue}>{archives.length}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIconWrapper, background: "rgba(59, 130, 246, 0.12)", color: "#2563eb" }}>
              <Layers size={20} color="#2563eb" />
            </div>
            <div>
              <div style={styles.statLabel}>Active Categories</div>
              <div style={styles.statValue}>{Object.keys(groupedArchives).length}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIconWrapper, background: "rgba(16, 185, 129, 0.12)", color: "#059669" }}>
              <HardDrive size={20} color="#059669" />
            </div>
            <div>
              <div style={styles.statLabel}>Total Repository Size</div>
              <div style={styles.statValue}>{formatFileSize(totalSizeBytes)}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIconWrapper, background: "rgba(245, 158, 11, 0.12)", color: "#d97706" }}>
              <ShieldAlert size={20} color="#d97706" />
            </div>
            <div>
              <div style={styles.statLabel}>Delete Protection</div>
              <div style={{ ...styles.statValue, fontSize: "16px", color: "#0f766e", fontWeight: "700" }}>Admin Protected</div>
            </div>
          </div>
        </div>

        {/* Main Controls Card: Search + Category Pills + View Mode */}
        <div style={styles.controlsCard}>
          {/* Top Search & Filter Bar */}
          <div style={styles.searchBarRow}>
            <div style={styles.searchBox}>
              <Search size={18} color="#0f766e" />
              <input
                type="text"
                placeholder="Search Excel sheets by Title, File Name, Category, Site, Notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button
                  style={styles.clearSearchBtn}
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Quick Filter Selects */}
            <div style={styles.quickFilters}>
              <select
                style={styles.filterSelect}
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
              >
                <option value="All">All Sites / Projects</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                style={styles.filterSelect}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="All">All Months</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>

              <select
                style={styles.filterSelect}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="All">All Years</option>
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div style={styles.viewModeToggle}>
                <button
                  style={{
                    ...styles.viewBtn,
                    background: viewMode === "grouped" ? "#0f766e" : "transparent",
                    color: viewMode === "grouped" ? "#fff" : "var(--text)"
                  }}
                  onClick={() => setViewMode("grouped")}
                  title="Group sheets by Category"
                >
                  <Layers size={15} />
                  <span>By Category</span>
                </button>
                <button
                  style={{
                    ...styles.viewBtn,
                    background: viewMode === "grid" ? "#0f766e" : "transparent",
                    color: viewMode === "grid" ? "#fff" : "var(--text)"
                  }}
                  onClick={() => setViewMode("grid")}
                  title="Cards Grid"
                >
                  <Tag size={15} />
                  <span>Cards</span>
                </button>
                <button
                  style={{
                    ...styles.viewBtn,
                    background: viewMode === "table" ? "#0f766e" : "transparent",
                    color: viewMode === "table" ? "#fff" : "var(--text)"
                  }}
                  onClick={() => setViewMode("table")}
                  title="Table view"
                >
                  <ArrowUpDown size={15} />
                  <span>Table</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs / Pills Bar */}
          <div style={styles.categoryPillsContainer}>
            <div style={styles.categoryLabel}>Categories:</div>
            <div style={styles.pillsScroll}>
              <button
                style={{
                  ...styles.pillBtn,
                  background: selectedCategory === "All" ? "#0f766e" : "var(--hover-bg, #f1f5f9)",
                  color: selectedCategory === "All" ? "#fff" : "var(--text, #334155)",
                  borderColor: selectedCategory === "All" ? "#0f766e" : "var(--border, #cbd5e1)"
                }}
                onClick={() => setSelectedCategory("All")}
              >
                <span>All Sheets</span>
                <span style={styles.pillBadge}>{archives.length}</span>
              </button>

              {allAvailableCategories.map((catName) => {
                const count = archives.filter((a) => a.category === catName).length;
                if (count === 0 && selectedCategory !== catName) return null;
                const isSelected = selectedCategory === catName;
                return (
                  <button
                    key={catName}
                    style={{
                      ...styles.pillBtn,
                      background: isSelected ? "#0f766e" : "var(--hover-bg, #f1f5f9)",
                      color: isSelected ? "#fff" : "var(--text, #334155)",
                      borderColor: isSelected ? "#0f766e" : "var(--border, #cbd5e1)"
                    }}
                    onClick={() => setSelectedCategory(catName)}
                  >
                    <span>{catName}</span>
                    <span style={{
                      ...styles.pillBadge,
                      background: isSelected ? "rgba(255,255,255,0.25)" : "rgba(15,118,110,0.12)",
                      color: isSelected ? "#fff" : "#0f766e"
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}

              <button
                style={styles.addCategoryPillBtn}
                onClick={() => {
                  setShowUploadModal(true);
                  setIsCustomCategory(true);
                }}
                title="Create a custom category with new Excel sheet"
              >
                <Plus size={14} />
                <span>+ Custom Category</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Banner when Searching */}
        {searchQuery.trim() && (
          <div style={styles.searchResultBanner}>
            <span>Found <strong>{filteredArchives.length}</strong> Excel sheet(s) matching &ldquo;{searchQuery}&rdquo;</span>
            <button style={styles.resetFilterLink} onClick={() => setSearchQuery("")}>Reset search</button>
          </div>
        )}

        {/* Loading / Empty States */}
        {loading ? (
          <div style={styles.emptyState}>
            <RefreshCw size={36} className="spin-animate" color="#0f766e" />
            <h3 style={styles.emptyTitle}>Loading Excel Sheets...</h3>
            <p style={styles.emptySubtitle}>Fetching archived spreadsheets from storage repository</p>
          </div>
        ) : filteredArchives.length === 0 ? (
          <div style={styles.emptyState}>
            <FileSpreadsheet size={54} color="#94a3b8" />
            <h3 style={styles.emptyTitle}>No Excel Sheets Found</h3>
            <p style={styles.emptySubtitle}>
              {searchQuery || selectedCategory !== "All" || selectedSite !== "All"
                ? "No spreadsheets match the selected filters. Try clearing your search or category."
                : "Your Excel repository is currently empty. Click 'Upload New Excel' to add your first spreadsheet."}
            </p>
            <button
              style={styles.uploadBtn}
              onClick={() => setShowUploadModal(true)}
            >
              <Plus size={16} /> Upload First Excel Sheet
            </button>
          </div>
        ) : (
          <>
            {/* VIEW MODE 1: Grouped by Category */}
            {viewMode === "grouped" && (
              <div style={styles.groupedContainer}>
                {Object.entries(groupedArchives).map(([categoryName, items]) => (
                  <div key={categoryName} style={styles.categorySectionCard}>
                    {/* Section Header */}
                    <div style={styles.categorySectionHeader}>
                      <div style={styles.categoryTitleGroup}>
                        <div style={styles.categoryFolderIcon}>
                          <Folder size={18} color="#0f766e" />
                        </div>
                        <h2 style={styles.categorySectionTitle}>{categoryName}</h2>
                        <span style={styles.categorySectionCountBadge}>
                          {items.length} {items.length === 1 ? "sheet" : "sheets"}
                        </span>
                      </div>

                      <button
                        style={styles.sectionUploadShortcut}
                        onClick={() => {
                          setShowUploadModal(true);
                          setUploadCategory(categoryName);
                          setIsCustomCategory(false);
                        }}
                        title={`Upload another file into ${categoryName}`}
                      >
                        <Plus size={14} /> Add to {categoryName}
                      </button>
                    </div>

                    {/* Cards Grid for this category */}
                    <div style={styles.cardsGrid}>
                      {items.map((item) => (
                        <ExcelSheetCard
                          key={item.id}
                          item={item}
                          formatFileSize={formatFileSize}
                          onDownload={handleDownload}
                          onPreview={handleOpenPreview}
                          onDelete={handleOpenDelete}
                          onProcessPayroll={handleProcessAsPayroll}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW MODE 2: Unified Cards Grid */}
            {viewMode === "grid" && (
              <div style={styles.cardsGrid}>
                {filteredArchives.map((item) => (
                  <ExcelSheetCard
                    key={item.id}
                    item={item}
                    formatFileSize={formatFileSize}
                    onDownload={handleDownload}
                    onPreview={handleOpenPreview}
                    onDelete={handleOpenDelete}
                    onProcessPayroll={handleProcessAsPayroll}
                  />
                ))}
              </div>
            )}

            {/* VIEW MODE 3: Dense Enterprise Table */}
            {viewMode === "table" && (
              <div style={styles.tableCard}>
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeadRow}>
                        <th style={styles.th}>Title & File</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Site / Project</th>
                        <th style={styles.th}>Period</th>
                        <th style={styles.th}>File Size</th>
                        <th style={styles.th}>Uploaded By</th>
                        <th style={styles.th}>Notes</th>
                        <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArchives.map((item) => (
                        <tr key={item.id} style={styles.tableRow}>
                          <td style={styles.td}>
                            <div style={styles.tableTitleGroup}>
                              <FileSpreadsheet size={18} color="#0f766e" />
                              <div>
                                <div style={styles.tableSheetTitle}>{item.title}</div>
                                <div style={styles.tableFileName}>{item.fileName}</div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.categoryPillTag}>{item.category}</span>
                          </td>
                          <td style={styles.td}>{item.siteName || "General / All"}</td>
                          <td style={styles.td}>
                            {item.month && item.year
                              ? `${new Date(2000, item.month - 1).toLocaleString("default", { month: "short" })} ${item.year}`
                              : "—"}
                          </td>
                          <td style={styles.td}>{formatFileSize(item.fileSize)}</td>
                          <td style={styles.td}>
                            <div>{item.uploadedBy || "Admin"}</div>
                            <div style={styles.tableDateText}>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.tableNotes} title={item.notes || ""}>
                              {item.notes || "—"}
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: "right" }}>
                            <div style={styles.tableActionsRow}>
                              <button
                                style={styles.actionIconBtn}
                                onClick={() => handleOpenPreview(item)}
                                title="In-browser Preview"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                style={styles.actionIconBtn}
                                onClick={() => handleDownload(item)}
                                title="Download File"
                              >
                                <Download size={16} />
                              </button>
                              <button
                                style={{ ...styles.actionIconBtn, color: "#ef4444" }}
                                onClick={() => handleOpenDelete(item)}
                                title="Password-protected Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── MODAL 1: Upload Excel Sheet Modal ───────────────────────── */}
        {showUploadModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={styles.iconBadge}>
                    <Plus size={20} color="#0f766e" />
                  </div>
                  <div>
                    <h2 style={styles.modalTitle}>Upload Excel Sheet</h2>
                    <p style={styles.modalSubtitle}>Store any Excel/CSV spreadsheet under a standard or custom category.</p>
                  </div>
                </div>
                <button
                  style={styles.closeBtn}
                  onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                >
                  <X size={18} />
                </button>
              </div>

              {uploadError && (
                <div style={styles.errorAlert}>
                  <AlertTriangle size={18} color="#dc2626" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} style={styles.form}>
                {/* File Drop / Select Area */}
                <div
                  style={styles.dropZone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <FileSpreadsheet size={38} color="#0f766e" />
                  {uploadFile ? (
                    <div>
                      <div style={styles.dropSelectedName}>{uploadFile.name}</div>
                      <div style={styles.dropSelectedSize}>{formatFileSize(uploadFile.size)} • Click to change file</div>
                    </div>
                  ) : (
                    <div>
                      <div style={styles.dropText}>Click or drag to select Excel/CSV file</div>
                      <div style={styles.dropSubtext}>Supports .xlsx, .xls, and .csv files up to 50MB</div>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Spreadsheet Title *</label>
                  <input
                    type="text"
                    required
                    style={styles.input}
                    placeholder="e.g. Workers Wage Sheet - October 2026"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>

                {/* Category Selection & Custom Category Input */}
                <div style={styles.formGroup}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={styles.label}>Category Grouping *</label>
                    <button
                      type="button"
                      style={styles.toggleCustomCategoryLink}
                      onClick={() => setIsCustomCategory(!isCustomCategory)}
                    >
                      {isCustomCategory ? "← Select from existing categories" : "+ Create Custom Category"}
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <div style={styles.customCategoryBox}>
                      <input
                        type="text"
                        required
                        style={{ ...styles.input, borderColor: "#0f766e" }}
                        placeholder="Enter your custom category name (e.g. Phase 2 Contractor Bills, Subcontractor Wages)"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        autoFocus
                      />
                      <span style={styles.customCategoryHint}>
                        ✨ This category will be saved and grouped with all sheets of the same category!
                      </span>
                    </div>
                  ) : (
                    <select
                      style={styles.input}
                      value={uploadCategory}
                      onChange={(e) => {
                        if (e.target.value === "__NEW_CUSTOM__") {
                          setIsCustomCategory(true);
                        } else {
                          setUploadCategory(e.target.value);
                        }
                      }}
                    >
                      {allAvailableCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__NEW_CUSTOM__">+ Create Custom Category...</option>
                    </select>
                  )}
                </div>

                {/* Site & Period Row */}
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Associated Project / Site</label>
                    <select
                      style={styles.input}
                      value={uploadSiteId}
                      onChange={(e) => setUploadSiteId(e.target.value)}
                    >
                      <option value="">General / All Sites</option>
                      {sites.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.siteId || "Site"})</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Month</label>
                    <select
                      style={styles.input}
                      value={uploadMonth}
                      onChange={(e) => setUploadMonth(e.target.value)}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {new Date(2000, m - 1).toLocaleString("default", { month: "long" })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Year</label>
                    <select
                      style={styles.input}
                      value={uploadYear}
                      onChange={(e) => setUploadYear(e.target.value)}
                    >
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description & Notes (Optional)</label>
                  <textarea
                    rows={2}
                    style={{ ...styles.input, resize: "vertical" }}
                    placeholder="Add details, wage rates, revision notes, or reference numbers..."
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                  />
                </div>

                {/* Modal Footer Actions */}
                <div style={styles.modalFooter}>
                  <button
                    type="button"
                    style={styles.cancelBtn}
                    onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={styles.submitBtn}
                    disabled={isUploading || !uploadFile}
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw size={16} className="spin-animate" />
                        <span>Uploading & Archiving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Save to Repository</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── MODAL 2: Password-Protected Delete Confirmation ───────── */}
        {deletingItem && (
          <div style={styles.modalOverlay}>
            <div style={{ ...styles.modalContent, maxWidth: "460px" }}>
              <div style={styles.modalHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ ...styles.iconBadge, background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}>
                    <ShieldAlert size={22} color="#ef4444" />
                  </div>
                  <div>
                    <h2 style={{ ...styles.modalTitle, color: "#b91c1c" }}>Admin Password Required</h2>
                    <p style={styles.modalSubtitle}>Confirm deletion of Excel archive</p>
                  </div>
                </div>
                <button
                  style={styles.closeBtn}
                  onClick={() => setDeletingItem(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={styles.deleteWarningBox}>
                <div style={styles.deleteFileTitle}>
                  <FileSpreadsheet size={18} color="#b91c1c" />
                  <span>{deletingItem.title}</span>
                </div>
                <div style={styles.deleteFileMeta}>
                  Category: <strong>{deletingItem.category}</strong> • File: {deletingItem.fileName}
                </div>
                <p style={styles.deleteWarningText}>
                  ⚠️ This action will permanently remove this Excel sheet and its physical file from storage.
                </p>
              </div>

              {deleteError && (
                <div style={styles.errorAlert}>
                  <AlertTriangle size={18} color="#dc2626" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Enter Admin Security Password *</label>
                <div style={styles.passwordInputWrapper}>
                  <Lock size={16} color="#64748b" style={styles.passwordIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    style={{ ...styles.input, paddingLeft: "36px", paddingRight: "40px" }}
                    placeholder="Enter admin password (Password@123)"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleConfirmDelete(); }}
                    autoFocus
                  />
                  <button
                    type="button"
                    style={styles.eyeToggleBtn}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setDeletingItem(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={{ ...styles.submitBtn, background: "#dc2626", borderColor: "#dc2626" }}
                  onClick={handleConfirmDelete}
                  disabled={isDeleting || !deletePassword}
                >
                  {isDeleting ? "Verifying..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL 3: In-Browser Quick Preview ──────────────────────── */}
        {previewItem && (
          <div style={styles.modalOverlay}>
            <div style={{ ...styles.modalContent, maxWidth: "94vw", width: "1200px", height: "85vh", display: "flex", flexDirection: "column" }}>
              <div style={styles.modalHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={styles.iconBadge}>
                    <FileSpreadsheet size={20} color="#0f766e" />
                  </div>
                  <div>
                    <h2 style={styles.modalTitle}>{previewItem.title}</h2>
                    <p style={styles.modalSubtitle}>
                      {previewItem.fileName} • {formatFileSize(previewItem.fileSize)} • Category: {previewItem.category}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    style={styles.previewActionBtn}
                    onClick={() => handleDownload(previewItem)}
                    title="Download file"
                  >
                    <Download size={15} /> Download
                  </button>
                  <button
                    style={styles.closeBtn}
                    onClick={() => setPreviewItem(null)}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Sheet Tabs & Search */}
              <div style={styles.previewToolbar}>
                <div style={styles.sheetTabs}>
                  {previewSheets.map((name) => (
                    <button
                      key={name}
                      style={{
                        ...styles.sheetTabBtn,
                        background: activeSheetName === name ? "#0f766e" : "var(--hover-bg, #f1f5f9)",
                        color: activeSheetName === name ? "#fff" : "var(--text, #334155)"
                      }}
                      onClick={() => handleSwitchPreviewSheet(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                <div style={styles.previewSearchBox}>
                  <Search size={15} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search inside preview rows..."
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    style={styles.previewSearchInput}
                  />
                  {previewSearch && (
                    <button
                      style={styles.clearSearchBtn}
                      onClick={() => setPreviewSearch("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Table Data Preview Container */}
              <div style={styles.previewTableWrapper}>
                {previewLoading ? (
                  <div style={styles.previewEmpty}>
                    <RefreshCw size={32} className="spin-animate" color="#0f766e" />
                    <span>Parsing spreadsheet content...</span>
                  </div>
                ) : previewError ? (
                  <div style={styles.previewEmpty}>
                    <AlertTriangle size={32} color="#dc2626" />
                    <span>{previewError}</span>
                  </div>
                ) : previewData.length === 0 ? (
                  <div style={styles.previewEmpty}>
                    <FileSpreadsheet size={32} color="#94a3b8" />
                    <span>Empty sheet or no data available.</span>
                  </div>
                ) : (
                  <table style={styles.previewTable}>
                    <thead>
                      <tr>
                        {previewData[0]?.map((col, idx) => (
                          <th key={idx} style={styles.previewTh}>
                            {String(col ?? "")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(1).filter((row) => {
                        if (!previewSearch.trim()) return true;
                        const rowStr = row.join(" ").toLowerCase();
                        return rowStr.includes(previewSearch.toLowerCase());
                      }).map((row, rIdx) => (
                        <tr key={rIdx} style={styles.previewTr}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} style={styles.previewTd}>
                              {String(cell ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={styles.previewFooter}>
                <span>Showing {previewData.length > 0 ? previewData.length - 1 : 0} rows</span>
                <button
                  style={styles.submitBtn}
                  onClick={() => handleDownload(previewItem)}
                >
                  <Download size={15} /> Download Original File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// ── Component: ExcelSheetCard ──────────────────────────────────────────────
function ExcelSheetCard({ item, formatFileSize, onDownload, onPreview, onDelete, onProcessPayroll }) {
  const isPayrollCategory =
    item.category?.toLowerCase().includes("payroll") ||
    item.category?.toLowerCase().includes("wages") ||
    item.category?.toLowerCase().includes("salary");

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardIconBox}>
          <FileSpreadsheet size={22} color="#0f766e" />
        </div>
        <div style={styles.cardTitleBox}>
          <h3 style={styles.cardTitle} title={item.title}>
            {item.title}
          </h3>
          <span style={styles.cardCategoryBadge}>{item.category}</span>
        </div>
      </div>

      <div style={styles.cardMetaList}>
        <div style={styles.cardMetaRow}>
          <FileText size={14} color="#64748b" />
          <span style={styles.cardFileName} title={item.fileName}>{item.fileName}</span>
        </div>

        <div style={styles.cardMetaRow}>
          <HardDrive size={14} color="#64748b" />
          <span>{formatFileSize(item.fileSize)}</span>
          <span style={styles.metaDot}>•</span>
          <Clock size={14} color="#64748b" />
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>

        {(item.siteName || (item.month && item.year)) && (
          <div style={styles.cardMetaRow}>
            {item.siteName && (
              <>
                <Building2 size={14} color="#64748b" />
                <span>{item.siteName}</span>
              </>
            )}
            {item.month && item.year && (
              <>
                <span style={styles.metaDot}>•</span>
                <Calendar size={14} color="#64748b" />
                <span>
                  {new Date(2000, item.month - 1).toLocaleString("default", { month: "short" })} {item.year}
                </span>
              </>
            )}
          </div>
        )}

        {item.notes && (
          <div style={styles.cardNotesBox} title={item.notes}>
            &ldquo;{item.notes}&rdquo;
          </div>
        )}
      </div>

      {/* Card Action Buttons */}
      <div style={styles.cardActions}>
        <div style={styles.cardPrimaryActions}>
          <button
            style={styles.cardActionBtn}
            onClick={() => onPreview(item)}
            title="Preview spreadsheet in browser"
          >
            <Eye size={15} />
            <span>Preview</span>
          </button>

          <button
            style={styles.cardActionBtn}
            onClick={() => onDownload(item)}
            title="Download original spreadsheet"
          >
            <Download size={15} />
            <span>Download</span>
          </button>

          {isPayrollCategory && (
            <button
              style={styles.cardPayrollBtn}
              onClick={() => onProcessPayroll(item)}
              title="Process directly into Worker Payroll calculation engine"
            >
              <Play size={14} />
              <span>Process Payroll</span>
            </button>
          )}
        </div>

        <button
          style={styles.cardDeleteBtn}
          onClick={() => onDelete(item)}
          title="Password-protected delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  container: {
    padding: "24px 28px",
    maxWidth: "1480px",
    margin: "0 auto",
    color: "var(--text, #1e293b)",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "18px",
    marginBottom: "24px"
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },
  iconBadge: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "rgba(15, 118, 110, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "var(--text, #0f172a)",
    margin: "0 0 4px 0",
    letterSpacing: "-0.02em"
  },
  subtitle: {
    fontSize: "13px",
    color: "var(--text-secondary, #64748b)",
    margin: 0,
    maxWidth: "650px",
    lineHeight: "1.4"
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap"
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border, #cbd5e1)",
    background: "var(--card-bg, #ffffff)",
    color: "var(--text, #334155)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease"
  },
  payrollShortcutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #99f6e4",
    background: "#f0fdfa",
    color: "#0f766e",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer"
  },
  uploadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#0f766e",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(15, 118, 110, 0.25)",
    transition: "background 0.15s ease"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px"
  },
  statCard: {
    background: "var(--card-bg, #ffffff)",
    border: "1px solid var(--border, #e2e8f0)",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
  },
  statIconWrapper: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(15, 118, 110, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  statLabel: {
    fontSize: "12px",
    color: "var(--text-secondary, #64748b)",
    fontWeight: "500"
  },
  statValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--text, #0f172a)",
    marginTop: "2px"
  },
  controlsCard: {
    background: "var(--card-bg, #ffffff)",
    border: "1px solid var(--border, #e2e8f0)",
    borderRadius: "14px",
    padding: "18px 20px",
    marginBottom: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
  },
  searchBarRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "14px",
    marginBottom: "16px"
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "var(--input-bg, #f8fafc)",
    border: "1px solid var(--border, #cbd5e1)",
    borderRadius: "10px",
    padding: "8px 14px",
    flex: "1 1 340px",
    maxWidth: "520px"
  },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: "13px",
    color: "var(--text, #1e293b)"
  },
  clearSearchBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center"
  },
  quickFilters: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap"
  },
  filterSelect: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border, #cbd5e1)",
    background: "var(--card-bg, #ffffff)",
    fontSize: "13px",
    color: "var(--text, #334155)",
    outline: "none",
    cursor: "pointer"
  },
  viewModeToggle: {
    display: "flex",
    alignItems: "center",
    border: "1px solid var(--border, #cbd5e1)",
    borderRadius: "8px",
    padding: "3px",
    background: "var(--input-bg, #f1f5f9)",
    gap: "2px"
  },
  viewBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 10px",
    borderRadius: "6px",
    border: "none",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.12s ease"
  },
  categoryPillsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    paddingTop: "12px",
    borderTop: "1px solid var(--border, #f1f5f9)",
    overflowX: "auto"
  },
  categoryLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-secondary, #64748b)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap"
  },
  pillsScroll: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "nowrap"
  },
  pillBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1px solid",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s ease"
  },
  pillBadge: {
    fontSize: "11px",
    fontWeight: "700",
    borderRadius: "10px",
    padding: "2px 7px",
    background: "rgba(255,255,255,0.25)"
  },
  addCategoryPillBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px dashed #0f766e",
    background: "rgba(15, 118, 110, 0.05)",
    color: "#0f766e",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },
  searchResultBanner: {
    background: "rgba(15, 118, 110, 0.08)",
    border: "1px solid rgba(15, 118, 110, 0.2)",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "13px",
    color: "#0f766e",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px"
  },
  resetFilterLink: {
    background: "none",
    border: "none",
    color: "#0f766e",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600"
  },
  groupedContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "28px"
  },
  categorySectionCard: {
    background: "var(--card-bg, #ffffff)",
    border: "1px solid var(--border, #e2e8f0)",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
  },
  categorySectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid var(--border, #f1f5f9)"
  },
  categoryTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  categoryFolderIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "rgba(15, 118, 110, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  categorySectionTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "var(--text, #0f172a)",
    margin: 0
  },
  categorySectionCountBadge: {
    fontSize: "12px",
    fontWeight: "600",
    background: "var(--hover-bg, #f1f5f9)",
    color: "var(--text-secondary, #64748b)",
    padding: "2px 8px",
    borderRadius: "12px"
  },
  sectionUploadShortcut: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "none",
    color: "#0f766e",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer"
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "16px"
  },
  card: {
    background: "var(--card-bg, #ffffff)",
    border: "1px solid var(--border, #e2e8f0)",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "12px"
  },
  cardIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(15, 118, 110, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  cardTitleBox: {
    overflow: "hidden"
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--text, #0f172a)",
    margin: "0 0 4px 0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  cardCategoryBadge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "6px",
    background: "rgba(15, 118, 110, 0.12)",
    color: "#0f766e"
  },
  cardMetaList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "12px",
    color: "var(--text-secondary, #64748b)",
    marginBottom: "14px"
  },
  cardMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    overflow: "hidden"
  },
  cardFileName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  metaDot: {
    color: "#cbd5e1"
  },
  cardNotesBox: {
    background: "var(--hover-bg, #f8fafc)",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    color: "var(--text-secondary, #475569)",
    fontStyle: "italic",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginTop: "2px"
  },
  cardActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "12px",
    borderTop: "1px solid var(--border, #f1f5f9)"
  },
  cardPrimaryActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  cardActionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid var(--border, #cbd5e1)",
    background: "var(--card-bg, #ffffff)",
    color: "var(--text, #334155)",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer"
  },
  cardPayrollBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #99f6e4",
    background: "#f0fdfa",
    color: "#0f766e",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer"
  },
  cardDeleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    background: "rgba(239, 68, 68, 0.05)",
    color: "#ef4444",
    cursor: "pointer"
  },
  tableCard: {
    background: "var(--card-bg, #ffffff)",
    border: "1px solid var(--border, #e2e8f0)",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
  },
  tableResponsive: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px"
  },
  tableHeadRow: {
    background: "var(--hover-bg, #f8fafc)",
    borderBottom: "1px solid var(--border, #e2e8f0)"
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "var(--text-secondary, #475569)",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.03em"
  },
  tableRow: {
    borderBottom: "1px solid var(--border, #f1f5f9)",
    transition: "background 0.12s ease"
  },
  td: {
    padding: "12px 16px",
    color: "var(--text, #1e293b)",
    verticalAlign: "middle"
  },
  tableTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  tableSheetTitle: {
    fontWeight: "600",
    color: "var(--text, #0f172a)"
  },
  tableFileName: {
    fontSize: "11px",
    color: "var(--text-secondary, #64748b)"
  },
  categoryPillTag: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "10px",
    background: "rgba(15, 118, 110, 0.12)",
    color: "#0f766e"
  },
  tableDateText: {
    fontSize: "11px",
    color: "var(--text-secondary, #94a3b8)"
  },
  tableNotes: {
    maxWidth: "180px",
    display: "inline-block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "var(--text-secondary, #64748b)",
    fontSize: "12px"
  },
  tableActionsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "6px"
  },
  actionIconBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    border: "1px solid var(--border, #cbd5e1)",
    background: "var(--card-bg, #ffffff)",
    color: "var(--text, #334155)",
    cursor: "pointer"
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "var(--card-bg, #ffffff)",
    border: "1px dashed var(--border, #cbd5e1)",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px"
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--text, #0f172a)",
    margin: 0
  },
  emptySubtitle: {
    fontSize: "13px",
    color: "var(--text-secondary, #64748b)",
    maxWidth: "420px",
    margin: 0,
    lineHeight: "1.4"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px"
  },
  modalContent: {
    background: "var(--card-bg, #ffffff)",
    borderRadius: "16px",
    border: "1px solid var(--border, #e2e8f0)",
    padding: "24px",
    maxWidth: "580px",
    width: "100%",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "18px"
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--text, #0f172a)",
    margin: "0 0 2px 0"
  },
  modalSubtitle: {
    fontSize: "12px",
    color: "var(--text-secondary, #64748b)",
    margin: 0
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "4px"
  },
  dropZone: {
    border: "2px dashed #0f766e",
    background: "rgba(15, 118, 110, 0.04)",
    borderRadius: "12px",
    padding: "24px 16px",
    textAlign: "center",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px"
  },
  dropSelectedName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f766e"
  },
  dropSelectedSize: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px"
  },
  dropText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text, #0f172a)"
  },
  dropSubtext: {
    fontSize: "12px",
    color: "var(--text-secondary, #64748b)",
    marginTop: "2px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: "12px"
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text, #334155)"
  },
  input: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border, #cbd5e1)",
    background: "var(--input-bg, #ffffff)",
    fontSize: "13px",
    color: "var(--text, #1e293b)",
    outline: "none"
  },
  toggleCustomCategoryLink: {
    background: "none",
    border: "none",
    color: "#0f766e",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0
  },
  customCategoryBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  customCategoryHint: {
    fontSize: "11px",
    color: "#0f766e",
    fontStyle: "italic"
  },
  errorAlert: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#b91c1c",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "14px"
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "18px",
    paddingTop: "14px",
    borderTop: "1px solid var(--border, #f1f5f9)"
  },
  cancelBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid var(--border, #cbd5e1)",
    background: "transparent",
    color: "var(--text, #475569)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer"
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#0f766e",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer"
  },
  deleteWarningBox: {
    background: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "16px"
  },
  deleteFileTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600",
    color: "#991b1b",
    fontSize: "14px"
  },
  deleteFileMeta: {
    fontSize: "12px",
    color: "#7f1d1d",
    marginTop: "4px"
  },
  deleteWarningText: {
    fontSize: "12px",
    color: "#b91c1c",
    margin: "8px 0 0 0"
  },
  passwordInputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  passwordIcon: {
    position: "absolute",
    left: "12px",
    pointerEvents: "none"
  },
  eyeToggleBtn: {
    position: "absolute",
    right: "10px",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  },
  previewActionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #0f766e",
    background: "rgba(15,118,110,0.06)",
    color: "#0f766e",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer"
  },
  previewToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "10px 0",
    borderBottom: "1px solid var(--border, #e2e8f0)",
    marginBottom: "12px"
  },
  sheetTabs: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    overflowX: "auto"
  },
  sheetTabBtn: {
    padding: "5px 12px",
    borderRadius: "6px",
    border: "none",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },
  previewSearchBox: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "var(--input-bg, #f8fafc)",
    border: "1px solid var(--border, #cbd5e1)",
    borderRadius: "6px",
    padding: "4px 10px",
    width: "240px"
  },
  previewSearchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "12px",
    width: "100%",
    color: "var(--text, #1e293b)"
  },
  previewTableWrapper: {
    flex: 1,
    overflow: "auto",
    border: "1px solid var(--border, #e2e8f0)",
    borderRadius: "8px",
    background: "var(--card-bg, #ffffff)"
  },
  previewEmpty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    height: "100%",
    padding: "40px",
    color: "var(--text-secondary, #64748b)",
    fontSize: "13px"
  },
  previewTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px"
  },
  previewTh: {
    background: "var(--hover-bg, #f1f5f9)",
    borderBottom: "2px solid var(--border, #cbd5e1)",
    borderRight: "1px solid var(--border, #e2e8f0)",
    padding: "8px 12px",
    textAlign: "left",
    fontWeight: "700",
    color: "var(--text, #0f172a)",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    zIndex: 1
  },
  previewTr: {
    borderBottom: "1px solid var(--border, #f1f5f9)"
  },
  previewTd: {
    padding: "6px 12px",
    borderRight: "1px solid var(--border, #f1f5f9)",
    whiteSpace: "nowrap",
    color: "var(--text, #334155)"
  },
  previewFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
    fontSize: "12px",
    color: "var(--text-secondary, #64748b)"
  }
};
