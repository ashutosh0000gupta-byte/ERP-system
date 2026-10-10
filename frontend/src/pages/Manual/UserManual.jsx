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
      title: "Salary & Wage Payment (वेतन और भुगतान कैसे करें)",
      category: "salary",
      badge: "Crucial Module",
      badgeColor: "#059669",
      icon: <IndianRupee size={22} color="#059669" />,
      summary: "Workers ki daily wage, overtime, bonus, aur advances deduct karke net salary calculate aur pay karne ka pura tarika.",
      steps: [
        {
          title: "Step 1: Month, Year aur Site Select Karein",
          desc: "Salary & Payment page par jaakar sabse pehle upar diye gaye dropdown se Month (jaise October 2026) aur Site select karein jiska payroll nikalna hai."
        },
        {
          title: "Step 2: 'Generate Wages & Payroll' par click karein",
          desc: "Green button 'Generate Wages & Payroll' dabayein. System attendance module se workers ke Present Days, Half Days, aur Overtime Hours scan karke automatically gross earnings calculate kar lega."
        },
        {
          title: "Step 3: Auto Advance Deduction Check Karein",
          desc: "Agar kisi worker ne us mahine koi advance liya tha, toh system usko 'Advance Ded.' column me automatically minus kar dega taaki extra payment na ho."
        },
        {
          title: "Step 4: Bonus ya Other Deductions Add Karein (Optional)",
          desc: "Aap kisi bhi worker ke row me click karke extra incentive/bonus add kar sakte hain, ya mess/khana/penalty ka deduction manually adjust kar sakte hain."
        },
        {
          title: "Step 5: 'Mark Paid' par click karein aur Payment Record Karein",
          desc: "Jab worker ko payment ho jaye, 'Pay / Mark Paid' button dabayein. Payment Mode (Bank Transfer, Cash, UPI), Payment Date aur Transaction/UTR No. enter karein."
        },
        {
          title: "Step 6: Print Payslip & Excel Export",
          desc: "'Print' button se worker ka official Salary Voucher/Slip print karein, ya 'Export Excel' se bank transfer ke liye puri sheet download karein."
        },
        {
          title: "Step 7: Worker SMS Notification",
          desc: "'Send SMS' button par click karke worker ke registered mobile number par salary payment ka automated confirmation SMS/WhatsApp bhej sakte hain."
        }
      ],
      formula: {
        title: "📐 Salary Calculation Formula (वेतन गणना सूत्र)",
        formulaText: "Net Payable = (Present Days × Daily Wage) + (Half Days × Half Wage) + (OT Hours × OT Rate) + Bonus - Unpaid Advances - Other Deductions",
        example: "Example: Ramesh (Daily Wage ₹700, OT Rate ₹150/hr). 24 Days Present = ₹16,800 + 10 OT Hours = ₹1,500. Total Gross = ₹18,300. Usne ₹2,000 Advance liya tha. Toh Net Payable = ₹18,300 - ₹2,000 = ₹16,300."
      },
      salaryTypes: [
        { type: "Daily Wage", desc: "Har working day ke hisab se payment (Sabse common)." },
        { type: "Weekly Wage", desc: "Hafte ke hisab se fixed rate (Weekly payroll frequency)." },
        { type: "Monthly Salary", desc: "Fixed monthly salary (Supervisors aur Staff ke liye)." },
        { type: "Hourly Wage", desc: "Har ghante ke hisab se calculation." },
        { type: "Contract-Based", desc: "Theka ya project completion par lumpsum amount." }
      ]
    },
    {
      id: "advance",
      title: "Advance & Expenses (एडवांस और साइट खर्च कैसे मैनेज करें)",
      category: "advance",
      badge: "Cash & Ledger",
      badgeColor: "#2563eb",
      icon: <CreditCard size={22} color="#2563eb" />,
      summary: "Workers ko beech mahine me diye gaye advance paise aur site ke daily kharchon ko record aur adjust karne ka tarika.",
      steps: [
        {
          title: "Step 1: 'Advance / Expense' Page Kholein",
          desc: "Sidebar me 'Advance / Expense' par click karein. Yaha aapko Total Advances Given, Pending Deductions, aur Settled history dikhegi."
        },
        {
          title: "Step 2: 'Record Advance Payment' Button Dabayein",
          desc: "Naya advance dene ke liye button par click karein. Modal open hoga."
        },
        {
          title: "Step 3: Worker, Amount aur Reason Bharein",
          desc: "Worker ka naam select karein, Site chunein, Amount (₹) dalein, Date select karein, aur Reason dalein (jaise: Medical Emergency, Festival, Ghar jana, etc.). Payment Mode (Cash, UPI, Bank) select karein."
        },
        {
          title: "Step 4: Status Lifecycle (Pending ➔ Deducted)",
          desc: "• PENDING: Advance diya gaya hai, par abhi salary se kata nahi hai.\n• DEDUCTED: Jab monthly salary banegi, ye advance automatically salary se deduct ho jayega aur status 'Deducted' ho jayega."
        },
        {
          title: "Step 5: Worker Ledger (Hisab-Kitab) Me Track Karein",
          desc: "Worker ke profile me jakar 'Ledger / Hisab-Kitab' button dabayein. Waha har advance ka exact date, amount aur status transparent dikhega."
        }
      ],
      siteExpensesInfo: {
        title: "🏗️ Site Expenses (साइट के अन्य खर्चे)",
        desc: "Site par hone wale daily kharche (jaise Diesel, Cement, Reti, Transport, Khana, Safety Tools, Local Vendor Payment) ko 'Site Expenses' module me record kiya jata hai. Isse har site ka real-time profit & loss aur expense budget track hota hai."
      }
    },
    {
      id: "workers",
      title: "Worker Master & Excel Import / Export (मजदूरों का रिकॉर्ड और एक्सेल)",
      category: "workers",
      badge: "Excel Integration",
      badgeColor: "#0284c7",
      icon: <Users size={22} color="#0284c7" />,
      summary: "Bulk workers ko Excel sheet se import karna, naya worker add karna, aur puri list Excel me export karna.",
      steps: [
        {
          title: "1. Download Template",
          desc: "'Workers' page par 'Download Template' button dabayein. Ek ready-made sample Excel sheet download ho jayegi jisme sabhi columns pre-formatted hain."
        },
        {
          title: "2. Fill Excel Data",
          desc: "Excel sheet me Worker ID (e.g. SNMR0057), Name, Site, Daily Wage, Trade (Fitter, Welder, Helper, etc.), aur Bank details bharein. Agar father name ya bank details nahi hain toh 'NA' likh sakte hain."
        },
        {
          title: "3. Click 'Import Excel/CSV'",
          desc: "'Import Excel/CSV' par click karke apni file upload karein. 1 click me 100+ workers system me bina kisi error ke add ho jayenge."
        },
        {
          title: "4. Export Excel Anytime",
          desc: "'Export Excel' button par click karke sabhi existing workers ka updated data (.xlsx format) apne computer/mobile par download karein."
        },
        {
          title: "5. Print Physical ID Cards",
          desc: "Kisi bhi worker ke card/row par 'Print ID' click karein aur SNMR branded photo ID card direct printer se nikal lein."
        }
      ]
    },
    {
      id: "attendance",
      title: "Daily Attendance Marking (दैनिक हाजिरी कैसे लगाएं)",
      category: "attendance",
      badge: "Daily Routine",
      badgeColor: "#d97706",
      icon: <CalendarCheck size={22} color="#d97706" />,
      summary: "Har din subah/shaam site par workers ki Present, Half Day, Absent aur Overtime hours mark karna.",
      steps: [
        {
          title: "1. Site aur Date Select Karein",
          desc: "'Worker Attendance' page kholein. Apni active Site aur aaj ki date select karein."
        },
        {
          title: "2. Quick Single-Click Marking",
          desc: "Har worker ke aage 'Present (P)', 'Half Day (HD)', ya 'Absent (A)' button par tap karein. Ek click me status save ho jata hai."
        },
        {
          title: "3. Overtime (OT) Hours Bharein",
          desc: "Agar kisi worker ne extra time kaam kiya hai, toh OT column me hours dalein (jaise 2 hrs, 4 hrs). Ye salary calculation me automatically add hoga."
        },
        {
          title: "4. Export Daily Sheet",
          desc: "'Export CSV / Excel' dabakar us din ka attendance muster roll download karein."
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
                <span style={styles.versionBadge}>ERP v2.4 Active</span>
              </div>
              <p style={styles.subtitle}>
                Complete operational guide for <strong>Salary & Payment</strong>, <strong>Worker Advances</strong>, <strong>Attendance</strong>, and <strong>Excel Integration</strong>.
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search help guide (e.g. Salary, Advance, Overtime, Excel)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={styles.clearSearchBtn}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Quick Category Filter Pills */}
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
            <span>Advance / Expense</span>
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

              {/* Special Mathematical Formula Box for Salary */}
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
                    💼 5 Supported Salary Calculation Types (वेतन प्रकार):
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

          {/* Quick FAQ & Best Practices Section */}
          <section style={styles.faqSection}>
            <h3 style={styles.faqHeader}>
              <Sparkles size={20} color="#2563eb" />
              <span>Important Tips & Best Practices (जरूरी सावधानियां)</span>
            </h3>

            <div style={styles.faqGrid}>
              <div style={styles.faqCard}>
                <div style={styles.faqIcon}>⚠️</div>
                <div>
                  <h4 style={styles.faqTitle}>Double Payment Se Bachne Ka Tarika</h4>
                  <p style={styles.faqText}>
                    Hamesha worker ko advance dete waqt <strong>Advance / Expense</strong> page me record karein. Jab mahine ke aakhiri me aap <strong>Salary & Payment</strong> me "Generate Payroll" dabayenge, toh system automatically un advances ko kaat kar hi Net Amount banayega.
                  </p>
                </div>
              </div>

              <div style={styles.faqCard}>
                <div style={styles.faqIcon}>📑</div>
                <div>
                  <h4 style={styles.faqTitle}>Excel Import Karte Samay Columns</h4>
                  <p style={styles.faqText}>
                    Excel sheet upload karne se pehle hamesha <strong>"Download Template"</strong> button se sample template lein. Usme diye gaye columns (Worker ID, Name, Site, Daily Wage, Trade, Bank Name, Account No, IFSC) me data bharkar upload karein.
                  </p>
                </div>
              </div>

              <div style={styles.faqCard}>
                <div style={styles.faqIcon}>📱</div>
                <div>
                  <h4 style={styles.faqTitle}>Mobile & Screen Responsive Design</h4>
                  <p style={styles.faqText}>
                    ERP system har device (Laptop, Tablet, Mobile phone) par bina cut hue kaam karta hai. Modals aur forms me scroll aur sticky buttons hain taaki choti screen par bhi koi button gayab na ho.
                  </p>
                </div>
              </div>

              <div style={styles.faqCard}>
                <div style={styles.faqIcon}>🏦</div>
                <div>
                  <h4 style={styles.faqTitle}>Direct Bank Transfer Sheet</h4>
                  <p style={styles.faqText}>
                    Salary generate hone ke baad <strong>"Export Excel"</strong> button se ek aisi sheet milti hai jisme Worker Name, Bank Name, Account Number, IFSC Code aur Net Salary hoti hai, jise aap direct bank portal par NEFT/RTGS batch upload ke liye de sakte hain.
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
