import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { getFileUrl } from "../../utils/uploadFileUrl";
import {
  Receipt,
  Search,
  Plus,
  X,
  Calendar,
  MapPin,
  IndianRupee,
  Eye,
  Trash2,
  Camera,
  ExternalLink,
  Download,
  ImageOff,
  Filter,
  CheckCircle2,
  AlertCircle,
  Upload
} from "lucide-react";

export default function SiteExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [formData, setFormData] = useState({
    siteId: "",
    date: new Date().toISOString().split("T")[0],
    category: "Material",
    amount: "",
    description: "",
    receiptUrl: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, sitesRes] = await Promise.all([
        api.get("/snmr/expenses"),
        api.get("/snmr/sites")
      ]);
      setExpenses(expRes.data || []);
      setSites(sitesRes.data || []);
    } catch (err) {
      console.error("Error fetching site expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Photo / Bill file selection in Create modal
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setFormData((prev) => ({ ...prev, receiptUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!formData.siteId) {
      alert("Please select a site");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Please enter a valid expense amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        siteId: formData.siteId,
        date: formData.date,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        receiptUrl: formData.receiptUrl || null
      };

      await api.post("/snmr/expenses", payload);
      setIsModalOpen(false);
      setFormData({
        siteId: "",
        date: new Date().toISOString().split("T")[0],
        category: "Material",
        amount: "",
        description: "",
        receiptUrl: ""
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to add expense: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this site expense entry?")) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/snmr/expenses/${id}`);
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete expense:", err);
      alert("Failed to delete expense: " + (err.response?.data?.error || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const categories = ["Material", "Transport", "Petty Cash", "Food", "Other"];

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      // Site filter
      if (siteFilter !== "all" && item.siteId !== siteFilter) return false;

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const descMatch = (item.description || "").toLowerCase().includes(query);
        const catMatch = (item.category || "").toLowerCase().includes(query);
        const siteMatch = (item.site?.name || "").toLowerCase().includes(query);
        const recordedMatch = (item.recordedBy || "").toLowerCase().includes(query);
        const amountMatch = String(item.amount || "").includes(query);
        if (!descMatch && !catMatch && !siteMatch && !recordedMatch && !amountMatch) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, siteFilter, categoryFilter, searchTerm]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalAmount = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const withReceipts = filteredExpenses.filter((item) => !!item.receiptUrl).length;
    return {
      totalAmount,
      count: filteredExpenses.length,
      withReceipts,
      withoutReceipts: filteredExpenses.length - withReceipts
    };
  }, [filteredExpenses]);

  return (
    <MainLayout>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.badgeRow}>
              <span style={styles.siteExpensePill}>Site Management</span>
              <span style={styles.liveIndicator}>
                <span style={styles.pulseDot} /> Real-time Sync
              </span>
            </div>
            <h1 style={styles.title}>Site Expenses & Bill Receipts</h1>
            <p style={styles.subtitle}>
              Monitor daily material purchases, petty cash vouchers, and bill photos submitted from both the mobile app and web portal.
            </p>
          </div>
          <button style={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Record Expense
          </button>
        </div>

        {/* Analytics Summary Cards */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={{ ...styles.metricIconWrap, background: "#fee2e2", color: "#e11d48" }}>
              <IndianRupee size={22} />
            </div>
            <div>
              <div style={styles.metricLabel}>Total Expenses (Filtered)</div>
              <div style={{ ...styles.metricValue, color: "#e11d48" }}>
                ₹{stats.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={{ ...styles.metricIconWrap, background: "#e0e7ff", color: "#4f46e5" }}>
              <Receipt size={22} />
            </div>
            <div>
              <div style={styles.metricLabel}>Total Entries</div>
              <div style={styles.metricValue}>{stats.count} Recorded</div>
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={{ ...styles.metricIconWrap, background: "#dcfce7", color: "#16a34a" }}>
              <Camera size={22} />
            </div>
            <div>
              <div style={styles.metricLabel}>Bills / Receipts Attached</div>
              <div style={{ ...styles.metricValue, color: "#16a34a" }}>
                {stats.withReceipts} Attached
                <span style={styles.metricSub}>
                  ({stats.count ? Math.round((stats.withReceipts / stats.count) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by description, site, category, amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                style={styles.clearSearchBtn}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={styles.filterControls}>
            {/* Site selector */}
            <div style={styles.filterGroup}>
              <MapPin size={15} color="#64748b" />
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="all">All Sites ({sites.length})</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category selector */}
            <div style={styles.filterGroup}>
              <Filter size={15} color="#64748b" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Expenses Table Card */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <p style={{ marginTop: "12px", color: "#64748b", fontWeight: "500" }}>Loading site expenses and receipt images...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div style={styles.emptyState}>
              <Receipt size={48} color="#cbd5e1" />
              <h3 style={styles.emptyTitle}>No Expenses Found</h3>
              <p style={styles.emptyDesc}>
                {searchTerm || siteFilter !== "all" || categoryFilter !== "all"
                  ? "Try resetting filters or search criteria."
                  : 'Click "Record Expense" or submit bill photos from the mobile app to get started.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Site / Project</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Description</th>
                    <th style={{ ...styles.th, textAlign: "center" }}>Bill / Receipt Image</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
                    <th style={styles.th}>Recorded By</th>
                    <th style={{ ...styles.th, textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((e) => {
                    const hasReceipt = Boolean(e.receiptUrl);
                    const formattedDate = e.date ? new Date(e.date).toLocaleDateString("en-GB") : "—";
                    const isDeleting = deletingId === e.id;

                    return (
                      <tr key={e.id} style={styles.tr}>
                        {/* Date */}
                        <td style={styles.td}>
                          <div style={styles.dateWrap}>
                            <Calendar size={14} color="#64748b" />
                            <span>{formattedDate}</span>
                          </div>
                        </td>

                        {/* Site */}
                        <td style={styles.td}>
                          <span style={styles.siteChip}>
                            <MapPin size={12} /> {e.site?.name || "Unassigned"}
                          </span>
                        </td>

                        {/* Category */}
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              background:
                                e.category === "Material"
                                  ? "#e0f2fe"
                                  : e.category === "Transport"
                                  ? "#f3e8ff"
                                  : e.category === "Petty Cash"
                                  ? "#fef3c7"
                                  : e.category === "Food"
                                  ? "#dcfce7"
                                  : "#f1f5f9",
                              color:
                                e.category === "Material"
                                  ? "#0284c7"
                                  : e.category === "Transport"
                                  ? "#9333ea"
                                  : e.category === "Petty Cash"
                                  ? "#b45309"
                                  : e.category === "Food"
                                  ? "#15803d"
                                  : "#475569"
                            }}
                          >
                            {e.category}
                          </span>
                        </td>

                        {/* Description */}
                        <td style={styles.td}>
                          <span style={styles.descText}>{e.description || "—"}</span>
                        </td>

                        {/* Bill / Receipt Image Column */}
                        <td style={{ ...styles.td, textAlign: "center" }}>
                          {hasReceipt ? (
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt(e)}
                              style={styles.viewBillBtn}
                              title="Click to view full receipt image"
                            >
                              <div style={styles.thumbWrapper}>
                                <img
                                  src={getFileUrl(e.receiptUrl)}
                                  alt="Bill preview"
                                  style={styles.thumbImg}
                                  onError={(ev) => {
                                    ev.target.style.display = "none";
                                  }}
                                />
                                <div style={styles.thumbOverlay}>
                                  <Eye size={13} color="#ffffff" />
                                </div>
                              </div>
                              <span style={styles.viewBillText}>View Bill</span>
                            </button>
                          ) : (
                            <span style={styles.noBillBadge}>
                              <ImageOff size={13} color="#94a3b8" />
                              <span>No Receipt</span>
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td style={{ ...styles.td, textAlign: "right", fontWeight: 800, color: "#e11d48", fontSize: "15px" }}>
                          ₹{parseFloat(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Recorded By */}
                        <td style={styles.td}>
                          <span style={styles.recordedByText}>
                            {e.recordedBy || "Admin"}
                          </span>
                        </td>

                        {/* Action (Delete) */}
                        <td style={{ ...styles.td, textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={(ev) => handleDeleteExpense(e.id, ev)}
                            disabled={isDeleting}
                            style={{
                              ...styles.deleteBtn,
                              opacity: isDeleting ? 0.5 : 1
                            }}
                            title="Delete this expense"
                          >
                            <Trash2 size={16} color="#ef4444" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Modal: Bill Receipt Full Screen Viewer ───────────────────────── */}
        {selectedReceipt && (
          <div
            style={styles.modalOverlay}
            onClick={() => setSelectedReceipt(null)}
          >
            <div
              style={styles.imageModalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.imageModalHeader}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={styles.imageModalBadge}>{selectedReceipt.category}</span>
                    <span style={styles.imageModalAmount}>
                      ₹{parseFloat(selectedReceipt.amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div style={styles.imageModalMeta}>
                    <span>📍 {selectedReceipt.site?.name || "Site"}</span>
                    <span>•</span>
                    <span>📅 {selectedReceipt.date ? new Date(selectedReceipt.date).toLocaleDateString("en-GB") : ""}</span>
                    <span>•</span>
                    <span>👤 Recorded by {selectedReceipt.recordedBy || "Staff"}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {/* Download / Open Full Button */}
                  <a
                    href={getFileUrl(selectedReceipt.receiptUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={`Receipt-${selectedReceipt.id}.jpg`}
                    style={styles.imageActionBtn}
                    title="Open full resolution in new tab"
                  >
                    <ExternalLink size={16} /> Open Full
                  </a>
                  <button
                    type="button"
                    style={styles.closeButton}
                    onClick={() => setSelectedReceipt(null)}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Receipt Image Display Container */}
              <div style={styles.imagePreviewArea}>
                <img
                  src={getFileUrl(selectedReceipt.receiptUrl)}
                  alt="Full bill receipt"
                  style={styles.fullBillImg}
                />
              </div>

              {selectedReceipt.description && (
                <div style={styles.imageModalFooter}>
                  <strong>Description: </strong> {selectedReceipt.description}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Modal: Record Expense (with Photo Upload) ─────────────────────── */}
        {isModalOpen && (
          <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={styles.modalTitle}>Record Site Expense</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Add expense entry with optional bill photo receipt
                  </p>
                </div>
                <button
                  type="button"
                  style={styles.closeButton}
                  onClick={() => setIsModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateExpense} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Site / Project *</label>
                    <select
                      required
                      style={styles.input}
                      value={formData.siteId}
                      onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                    >
                      <option value="" disabled>Select Site</option>
                      {sites.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Date *</label>
                    <input
                      type="date"
                      required
                      style={styles.input}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Category *</label>
                    <select
                      required
                      style={styles.input}
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      style={styles.input}
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Description / Items Purchased</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="e.g. 50 Cement bags, Sand tempo, Binding wire..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Bill Photo Upload / Attachment */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Bill / Receipt Photo (Optional)
                  </label>
                  {formData.receiptUrl ? (
                    <div style={styles.uploadPreviewBox}>
                      <img
                        src={formData.receiptUrl}
                        alt="Receipt preview"
                        style={styles.uploadPreviewImg}
                      />
                      <div style={styles.uploadPreviewInfo}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                          Bill Image Attached
                        </div>
                        <div style={{ fontSize: "12px", color: "#16a34a" }}>
                          ✓ Ready to save
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, receiptUrl: "" }))}
                          style={styles.removePhotoBtn}
                        >
                          <Trash2 size={14} /> Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label style={styles.fileDropArea}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        style={{ display: "none" }}
                      />
                      <Camera size={26} color="#0f766e" />
                      <div style={{ marginTop: "6px", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                        Click to upload or take bill photo
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        JPG, PNG, WebP up to 10MB
                      </div>
                    </label>
                  )}
                </div>

                <div style={styles.modalActions}>
                  <button
                    type="button"
                    style={styles.cancelButton}
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving Expense..." : "✓ Save Expense"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  container: { padding: "32px", maxWidth: "1300px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  badgeRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" },
  siteExpensePill: { background: "#ccfbf1", color: "#0f766e", fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" },
  liveIndicator: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#16a34a", fontWeight: "600" },
  pulseDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a", display: "inline-block" },
  title: { fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "14.5px", color: "#64748b", margin: 0, maxWidth: "700px", lineHeight: "1.5" },
  addBtn: { display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)", color: "#fff", border: "none", padding: "12px 22px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)", transition: "all 0.2s" },

  // Metrics Grid
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "24px" },
  metricCard: { background: "#ffffff", borderRadius: "16px", padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" },
  metricIconWrap: { width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  metricLabel: { fontSize: "12.5px", color: "#64748b", fontWeight: "600", marginBottom: "4px" },
  metricValue: { fontSize: "20px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "baseline", gap: "6px" },
  metricSub: { fontSize: "12px", color: "#64748b", fontWeight: "600" },

  // Filter Bar
  filterBar: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "16px", flexWrap: "wrap" },
  searchBox: { display: "flex", alignItems: "center", gap: "10px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "8px 14px", flex: 1, minWidth: "260px", maxWidth: "460px" },
  searchInput: { border: "none", outline: "none", width: "100%", fontSize: "14px", color: "#0f172a", background: "transparent" },
  clearSearchBtn: { border: "none", background: "#f1f5f9", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" },
  filterControls: { display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" },
  filterGroup: { display: "flex", alignItems: "center", gap: "8px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "6px 12px" },
  selectFilter: { border: "none", outline: "none", fontSize: "13.5px", color: "#1e293b", background: "transparent", fontWeight: "600", cursor: "pointer" },

  // Table Card
  tableCard: { background: "#ffffff", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  tableHead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "14px 20px", fontSize: "12.5px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.15s ease" },
  td: { padding: "14px 20px", verticalAlign: "middle", fontSize: "14px", color: "#334155" },

  dateWrap: { display: "inline-flex", alignItems: "center", gap: "6px", color: "#1e293b", fontWeight: "600", fontSize: "13px" },
  siteChip: { display: "inline-flex", alignItems: "center", gap: "5px", background: "#f1f5f9", color: "#334155", padding: "5px 10px", borderRadius: "8px", fontSize: "12.5px", fontWeight: "700" },
  statusBadge: { padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  descText: { maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", color: "#334155" },
  recordedByText: { fontSize: "12px", color: "#64748b", background: "#f8fafc", padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" },

  // Bill / Receipt Thumbnail Button
  viewBillBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#f0fdf4",
    border: "1.5px solid #86efac",
    color: "#15803d",
    padding: "4px 10px 4px 6px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "12.5px",
    fontWeight: "700",
    transition: "all 0.15s"
  },
  thumbWrapper: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    overflow: "hidden",
    position: "relative",
    background: "#0f172a",
    flexShrink: 0
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover" },
  thumbOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  viewBillText: { whiteSpace: "nowrap" },
  noBillBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11.5px",
    color: "#94a3b8",
    background: "#f8fafc",
    padding: "4px 8px",
    borderRadius: "6px"
  },

  deleteBtn: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "6px 8px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s"
  },

  // Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px"
  },
  modal: {
    background: "#ffffff",
    width: "100%",
    maxWidth: "540px",
    borderRadius: "20px",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    overflow: "hidden"
  },
  modalHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  modalTitle: { margin: 0, fontSize: "19px", fontWeight: "800", color: "#0f172a" },
  closeButton: {
    background: "#f1f5f9",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  form: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" },
  formRow: { display: "flex", gap: "14px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  label: { fontSize: "13px", fontWeight: "700", color: "#334155" },
  input: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    background: "#f8fafc",
    transition: "border 0.2s"
  },
  textarea: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    background: "#f8fafc",
    minHeight: "70px",
    resize: "vertical"
  },

  fileDropArea: {
    border: "2px dashed #0f766e",
    background: "#f0fdfa",
    borderRadius: "12px",
    padding: "18px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    textAlign: "center"
  },
  uploadPreviewBox: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    padding: "10px 14px"
  },
  uploadPreviewImg: {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "1px solid #cbd5e1"
  },
  uploadPreviewInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  removePhotoBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11.5px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "2px",
    width: "fit-content"
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "8px",
    paddingTop: "16px",
    borderTop: "1px solid #e2e8f0"
  },
  cancelButton: {
    padding: "9px 18px",
    borderRadius: "10px",
    fontSize: "13.5px",
    fontWeight: "600",
    color: "#64748b",
    background: "#f1f5f9",
    border: "none",
    cursor: "pointer"
  },
  submitButton: {
    padding: "9px 20px",
    borderRadius: "10px",
    fontSize: "13.5px",
    fontWeight: "700",
    color: "#ffffff",
    background: "#0f766e",
    border: "none",
    cursor: "pointer"
  },

  // Full Screen Image Viewer Modal Card
  imageModalCard: {
    background: "#ffffff",
    width: "100%",
    maxWidth: "800px",
    borderRadius: "20px",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    maxHeight: "92vh"
  },
  imageModalHeader: {
    padding: "18px 22px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f8fafc"
  },
  imageModalBadge: {
    background: "#0f766e",
    color: "#ffffff",
    padding: "3px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "700"
  },
  imageModalAmount: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#e11d48"
  },
  imageModalMeta: {
    fontSize: "12.5px",
    color: "#64748b",
    marginTop: "4px",
    display: "flex",
    gap: "8px",
    alignItems: "center"
  },
  imageActionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontWeight: "600",
    textDecoration: "none",
    cursor: "pointer"
  },
  imagePreviewArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "360px"
  },
  fullBillImg: {
    maxWidth: "100%",
    maxHeight: "68vh",
    objectFit: "contain",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
  },
  imageModalFooter: {
    padding: "12px 20px",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    fontSize: "13px",
    color: "#334155"
  },

  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #0f766e",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" },
  emptyTitle: { fontSize: "17px", fontWeight: "700", color: "#334155", margin: "16px 0 6px 0" },
  emptyDesc: { color: "#64748b", margin: 0, fontSize: "13.5px", textAlign: "center", maxWidth: "400px" }
};
