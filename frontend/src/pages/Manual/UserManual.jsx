import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { 
  Users, 
  CalendarCheck, 
  IndianRupee, 
  PieChart, 
  ShieldCheck, 
  Play, 
  Printer, 
  Check, 
  X, 
  Download, 
  UploadCloud, 
  FileSpreadsheet, 
  CreditCard, 
  Receipt, 
  BookOpen, 
  HelpCircle, 
  ArrowRight, 
  Clock, 
  Calculator, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Sparkles,
  Search,
  MessageSquare,
  FileText
} from "lucide-react";

export default function UserManual() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const guides = [
    {
      id: "salary",
      title: "Salary & Wage Payment (Payroll Processing Guide)",
      category: "salary",
      badge: "Core Workflow",
      badgeColor: "#059669",
      icon: <IndianRupee size={22} color="#059669" />,
      summary: "Complete guide to calculating wages, managing overtime, auto-reconciling advances, disbursing payments, and generating salary slips.",
      steps: [
        {
          title: "Step 1: Select Month, Year, and Site",
          desc: "Navigate to the Salary & Payment module. Use the top filter controls to select your target payroll month (e.g., October 2026), year, and optional site filter."
        },
        {
          title: "Step 2: Click 'Generate Wages & Payroll'",
          desc: "Click the green 'Generate Wages & Payroll' button. The system automatically scans attendance muster records, aggregating Present Days, Half Days, and Overtime Hours to calculate gross earnings."
        },
        {
          title: "Step 3: Automated Advance Reconciliation",
          desc: "If any worker took mid-month cash advances, the system automatically deducts them in the 'Advance Ded.' column, ensuring zero risk of double payment."
        },
        {
          title: "Step 4: Adjust Bonuses or Custom Deductions (Optional)",
          desc: "You can click on any worker record to add special performance incentives/bonuses or adjust manual deductions such as mess, uniform, or penalty charges."
        },
        {
          title: "Step 5: Record Payment Disbursal ('Mark Paid')",
          desc: "Once payment is issued, click 'Pay / Mark Paid'. Select the Payment Mode (Bank Transfer, Cash, or UPI), enter the payment date, and provide the Transaction/UTR Reference number."
        },
        {
          title: "Step 6: Print Salary Slips & Export Bank Excel Sheet",
          desc: "Click 'Slip' to print physical payslips with company branding. Click 'Export Excel' to download the bank transfer batch sheet containing worker names, account numbers, IFSC codes, and net payable amounts."
        },
        {
          title: "Step 7: Automated SMS & WhatsApp Notifications",
          desc: "Click 'Notify SMS/WhatsApp' to send automated payment confirmation alerts directly to the workers' registered mobile numbers."
        }
      ],
      formula: {
        title: "Salary Calculation Formula",
        formulaText: "Net Payable = (Present Days × Daily Wage) + (Half Days × Half Wage) + (OT Hours × OT Rate) + Bonus - Unpaid Advances - Other Deductions",
        example: "Example: Worker Ramesh Kumar (Daily Wage: ₹700, OT Rate: ₹150/hr). With 24 Present Days (₹16,800) and 10 OT Hours (₹1,500), Gross Pay is ₹18,300. He took a mid-month Advance of ₹2,000. Net Payable = ₹18,300 - ₹2,000 = ₹16,300."
      },
      salaryTypes: [
        { type: "Daily Wage", desc: "Calculated per working day based on daily attendance logs." },
        { type: "Weekly Wage", desc: "Fixed rate computed on a weekly basis." },
        { type: "Monthly Salary", desc: "Fixed monthly salary for supervisors, engineers, and site staff." },
        { type: "Hourly Wage", desc: "Calculated strictly by recorded working hours." },
        { type: "Contract-Based", desc: "Milestone-based or lump-sum payment tied to project completion." }
      ]
    },
    {
      id: "advance",
      title: "Worker Advance & Site Expenses Guide",
      category: "advance",
      badge: "Cash & Ledger",
      badgeColor: "#2563eb",
      icon: <CreditCard size={22} color="#2563eb" />,
      summary: "Instructions for issuing mid-month worker cash advances and managing operational site expenditures.",
      steps: [
        {
          title: "Step 1: Open the 'Advance / Expense' Page",
          desc: "Click 'Advance / Expense' in the sidebar to view total advances issued, pending deductions, and historical records."
        },
        {
          title: "Step 2: Click 'Record Advance Payment'",
          desc: "Click the primary button to open the advance issuance modal."
        },
        {
          title: "Step 3: Enter Worker, Amount, and Reason",
          desc: "Select the worker name, assigned site, advance amount (₹), payment date, reason (e.g., Medical Emergency, Family Support, Festival), and payment method (Cash, UPI, Bank)."
        },
        {
          title: "Step 4: Advance Status Lifecycle (Pending ➔ Deducted)",
          desc: "• PENDING: The worker has received the advance; amount is awaiting recovery.\n• DEDUCTED: When monthly salary payroll is generated, the advance is automatically deducted and marked as settled."
        },
        {
          title: "Step 5: Audit via Worker Ledger (Hisab-Kitab)",
          desc: "Open the worker's profile and click 'Ledger (Hisab-Kitab)' to review the timestamped chronological history of all earnings, advances, and payments."
        }
      ],
      siteExpensesInfo: {
        title: "Site Operational Expenses (Petty Cash & Materials)",
        desc: "Day-to-day site expenses (such as Diesel, Cement, Sand, Scaffolding, Transport, Worker Meals, Safety Gear, and Local Vendor Bills) are managed in the 'Site Expenses' module. This provides real-time budget tracking and project-level financial auditing."
      }
    },
    {
      id: "workers",
      title: "Worker Master & Bulk Excel Management",
      category: "workers",
      badge: "Excel Integration",
      badgeColor: "#0284c7",
      icon: <Users size={22} color="#0284c7" />,
      summary: "Importing workforce data via pre-formatted Excel sheets, registering workers, and exporting data.",
      steps: [
        {
          title: "1. Download the Sample Template",
          desc: "On the Workers page, click 'Download Template' to get a pre-formatted Excel file with all required headers."
        },
        {
          title: "2. Populate Excel Records",
          desc: "Fill in Worker ID (e.g., SNMR0057), Full Name, Site, Daily Wage, Trade (Fitter, Welder, Helper, etc.), and Bank Information. Unprovided fields can be marked as 'NA'."
        },
        {
          title: "3. Upload with 'Import Excel/CSV'",
          desc: "Click 'Import Excel/CSV' and upload your file. Hundreds of worker profiles are processed and saved in a single click."
        },
        {
          title: "4. Export Complete Workforce to Excel",
          desc: "Click 'Export Excel' anytime to download the full worker database (.xlsx format) to your computer."
        },
        {
          title: "5. Print Physical ID Cards",
          desc: "Click 'Print ID' on any worker card to generate a high-resolution, print-ready identification card with company branding."
        }
      ]
    },
    {
      id: "attendance",
      title: "Daily Attendance & Overtime Tracking",
      category: "attendance",
      badge: "Daily Routine",
      badgeColor: "#d97706",
      icon: <CalendarCheck size={22} color="#d97706" />,
      summary: "Daily tracking of workforce presence, half-days, absenteeism, and overtime hours across project sites.",
      steps: [
        {
          title: "1. Select Active Site and Date",
          desc: "Open the Worker Attendance module. Choose the project site and target date."
        },
        {
          title: "2. Single-Click Status Marking",
          desc: "Mark each worker as 'Present (P)', 'Half Day (HD)', or 'Absent (A)' with a single click. Records are saved instantly."
        },
        {
          title: "3. Record Overtime (OT) Hours",
          desc: "Enter extra overtime hours in the OT field (e.g., 2 hrs, 4 hrs). These hours are automatically factored into the month-end wage calculation."
        },
        {
          title: "4. Export Muster Roll",
          desc: "Click 'Export CSV / Excel' to download the daily site attendance sheet for auditing and labor compliance."
        }
      ]
    }
  ];

  const filteredGuides = guides.filter(g => {
    const matchesTab = activeTab === "all" || g.category === activeTab;
    const matchesSearch = !searchQuery || 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <MainLayout>
      <div style={styles.container}>
        {/* Header Hero Banner */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.logoCircle}>
              <BookOpen size={32} color="#fff" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={styles.title}>System Help & User Manual</h1>
                <span style={styles.versionBadge}>Enterprise ERP Active</span>
              </div>
              <p style={styles.subtitle}>
                Complete operational guide for <strong>Salary & Payment</strong>, <strong>Worker Advances</strong>, <strong>Attendance Tracking</strong>, and <strong>Excel Integration</strong>.
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search user manual (e.g., Salary, Advance, Overtime, Excel, Bank)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={styles.clearSearchBtn} title="Clear search">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Navigation */}
        <div style={styles.filterBar}>
          <button 
            style={activeTab === "all" ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab("all")}
          >
            All Modules
          </button>
          <button 
            style={activeTab === "salary" ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab("salary")}
          >
            <IndianRupee size={16} />
            <span>Salary & Payment</span>
          </button>
          <button 
            style={activeTab === "advance" ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab("advance")}
          >
            <CreditCard size={16} />
            <span>Advance & Expenses</span>
          </button>
          <button 
            style={activeTab === "workers" ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab("workers")}
          >
            <Users size={16} />
            <span>Worker Master & Excel</span>
          </button>
          <button 
            style={activeTab === "attendance" ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab("attendance")}
          >
            <CalendarCheck size={16} />
            <span>Worker Attendance</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div style={styles.main}>
          {filteredGuides.map((guide) => (
            <section key={guide.id} style={styles.sectionCard}>
              {/* Card Header */}
              <div style={styles.cardHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={styles.cardIconWrap}>
                    {guide.icon}
                  </div>
                  <div>
                    <h2 style={styles.cardTitle}>{guide.title}</h2>
                    <p style={styles.cardSummary}>{guide.summary}</p>
                  </div>
                </div>
                <span style={{ ...styles.cardBadge, background: guide.badgeColor + "15", color: guide.badgeColor, border: `1px solid ${guide.badgeColor}30` }}>
                  {guide.badge}
                </span>
              </div>

              {/* Step By Step Detailed Cards */}
              <div style={styles.stepsGrid}>
                {guide.steps.map((st, idx) => (
                  <div key={idx} style={styles.stepItem}>
                    <div style={styles.stepNumberBadge}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={styles.stepItemTitle}>{st.title}</h4>
                      <p style={styles.stepItemDesc}>{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mathematical Formula Box for Salary */}
              {guide.formula && (
                <div style={styles.formulaBox}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Calculator size={18} color="#059669" />
                    <strong style={{ fontSize: "15px", color: "#065f46" }}>{guide.formula.title}</strong>
                  </div>
                  <div style={styles.formulaCode}>
                    {guide.formula.formulaText}
                  </div>
                  <p style={{ margin: "10px 0 0 0", fontSize: "13px", color: "#047857", lineHeight: 1.5 }}>
                    💡 <strong>{guide.formula.example}</strong>
                  </p>
                </div>
              )}

              {/* Salary Types Breakdown */}
              {guide.salaryTypes && (
                <div style={{ marginTop: "18px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "10px" }}>
                    💼 5 Supported Salary Calculation Types:
                  </h4>
                  <div style={styles.typesGrid}>
                    {guide.salaryTypes.map((stype, sIdx) => (
                      <div key={sIdx} style={styles.typeBadgeCard}>
                        <strong style={{ color: "#0f766e", fontSize: "13px" }}>{stype.type}</strong>
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>{stype.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Site Expenses Special Note */}
              {guide.siteExpensesInfo && (
                <div style={styles.infoBoxTeal}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Building2 size={20} color="#0f766e" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong style={{ fontSize: "14px", color: "#0f766e" }}>{guide.siteExpensesInfo.title}</strong>
                      <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>
                        {guide.siteExpensesInfo.desc}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          ))}

          {/* Best Practices Section */}
          <section style={styles.faqSection}>
            <h3 style={styles.faqHeader}>
              <Sparkles size={20} color="#2563eb" />
              <span>Operational Tips & Best Practices</span>
            </h3>

            <div style={styles.faqGrid}>
              <div style={styles.faqCard}>
                <div style={styles.faqIcon}>⚠️</div>
                <div>
                  <h4 style={styles.faqTitle}>Preventing Overpayments & Discrepancies</h4>
                  <p style={styles.faqText}>
                    Always record mid-month payments in the <strong>Advance / Expense</strong> module. When you generate monthly payroll in the <strong>Salary & Payment</strong> section, the system automatically subtracts outstanding advances from gross earnings before calculating net payable amounts.
                  </p>
                </div>
              </div>

              <div style={styles.faqCard}>
                <div style={styles.faqIcon}>📑</div>
                <div>
                  <h4 style={styles.faqTitle}>Excel Import Column Integrity</h4>
                  <p style={styles.faqText}>
                    Always download the standard template before preparing bulk imports. Retain standard column titles (Worker ID, Name, Site, Daily Wage, Trade, Bank Name, Bank Account, IFSC) to ensure seamless validation.
                  </p>
                </div>
              </div>

              <div style={styles.faqCard}>
                <div style={styles.faqIcon}>📱</div>
                <div>
                  <h4 style={styles.faqTitle}>Responsive Screen Optimization</h4>
                  <p style={styles.faqText}>
                    All tables, forms, and dialog windows automatically resize across laptops, tablets, and mobile devices. Modals feature sticky headers and action footers with scrollable form bodies to ensure all buttons remain accessible.
                  </p>
                </div>
              </div>

              <div style={styles.faqCard}>
                <div style={styles.faqIcon}>🏦</div>
                <div>
                  <h4 style={styles.faqTitle}>Bank Batch Payment Export</h4>
                  <p style={styles.faqText}>
                    After finalizing salary calculations, use the <strong>Export Excel</strong> button to obtain a structured spreadsheet containing Worker Names, Bank Names, Account Numbers, IFSC Codes, and Net Amounts ready for corporate NEFT/RTGS batch processing.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}

const styles = {
  container: {
    padding: "28px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  header: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "36px",
    borderRadius: "24px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
    marginBottom: "24px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap"
  },
  logoCircle: {
    width: "60px",
    height: "60px",
    background: "linear-gradient(135deg, #2563eb 0%, #0284c7 100%)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.35)",
    flexShrink: 0
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    margin: 0,
    letterSpacing: "-0.5px",
    color: "#ffffff"
  },
  versionBadge: {
    background: "rgba(34, 197, 94, 0.2)",
    color: "#86efac",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "20px"
  },
  subtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: "6px 0 0 0",
    lineHeight: 1.5
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "14px",
    padding: "10px 18px",
    maxWidth: "600px",
    width: "100%",
    boxSizing: "border-box"
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: "14px",
    width: "100%"
  },
  clearSearchBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  },
  filterBar: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "28px"
  },
  tabActive: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
    transition: "all 0.2s ease"
  },
  tabInactive: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    background: "#fff",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: "28px"
  },
  sectionCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    border: "1px solid #e2e8f0"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
    paddingBottom: "20px",
    borderBottom: "1px solid #f1f5f9",
    marginBottom: "20px"
  },
  cardIconWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0
  },
  cardSummary: {
    fontSize: "13px",
    color: "#64748b",
    margin: "4px 0 0 0"
  },
  cardBadge: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px"
  },
  stepItem: {
    display: "flex",
    gap: "12px",
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0"
  },
  stepNumberBadge: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    background: "#0f172a",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  stepItemTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 4px 0"
  },
  stepItemDesc: {
    fontSize: "12.5px",
    color: "#64748b",
    margin: 0,
    lineHeight: 1.5,
    whiteSpace: "pre-line"
  },
  formulaBox: {
    marginTop: "20px",
    background: "#f0fdf4",
    border: "1.5px solid #86efac",
    padding: "18px",
    borderRadius: "14px"
  },
  formulaCode: {
    background: "#ffffff",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #bbf7d0",
    fontFamily: "monospace",
    fontSize: "13px",
    color: "#15803d",
    fontWeight: "600",
    overflowX: "auto"
  },
  typesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px"
  },
  typeBadgeCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "12px",
    borderRadius: "10px"
  },
  infoBoxTeal: {
    marginTop: "20px",
    background: "#f0fdfa",
    border: "1px solid #99f6e4",
    padding: "16px",
    borderRadius: "14px"
  },
  faqSection: {
    background: "#fff",
    borderRadius: "20px",
    padding: "28px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
  },
  faqHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 20px 0"
  },
  faqGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px"
  },
  faqCard: {
    display: "flex",
    gap: "14px",
    background: "#f8fafc",
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0"
  },
  faqIcon: {
    fontSize: "24px",
    flexShrink: 0
  },
  faqTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 6px 0"
  },
  faqText: {
    fontSize: "12.5px",
    color: "#475569",
    margin: 0,
    lineHeight: 1.5
  }
};
