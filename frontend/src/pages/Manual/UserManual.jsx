import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Users, CalendarCheck, IndianRupee, PieChart, ShieldCheck, Play, Printer, Check, X, Download } from "lucide-react";

export default function UserManual() {
  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>S</div>
          <div>
            <h1 style={styles.title}>System Help & User Manual</h1>
            <p style={styles.subtitle}>Complete guide to managing your construction labor and expenses</p>
          </div>
        </div>

        <div style={styles.main}>
          {/* Step 1 */}
          <section style={styles.section}>
            <div style={styles.sectionBody}>
              <h2 style={styles.sectionTitle}><span style={{color:"#0f766e"}}>1.</span> Adding & Managing Workers</h2>
              <p style={styles.text}>
                Start by going to the <strong>Workers</strong> page. Click on the "Add Worker" button. 
                Here you can enter their name, daily wage, trade (e.g., Mason, Helper), and assign them to a specific Site.
                You can also click the <strong>Print ID</strong> button to generate a physical ID card for them.
              </p>
              
              {/* Visual Mock: Worker Row */}
              <div style={styles.mockUI}>
                <div style={styles.mockRow}>
                  <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
                    <div style={{width:"36px", height:"36px", background:"#f0f9ff", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#0284c7", fontWeight:700}}>R</div>
                    <div>
                      <div style={{fontWeight:700, fontSize:"14px"}}>Ramesh Kumar</div>
                      <div style={{fontSize:"12px", color:"#64748b"}}>W-1001</div>
                    </div>
                  </div>
                  <div style={{fontSize:"14px"}}>Trade: Mason</div>
                  <div style={{fontSize:"14px", fontWeight:600}}>₹600 / day</div>
                  <div style={{display:"flex", gap:"8px"}}>
                    <button style={styles.mockBtnBlue}>Profile</button>
                    <button style={styles.mockBtnGray}><Printer size={14} /> Print ID</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section style={styles.section}>
            <div style={styles.sectionBody}>
              <h2 style={styles.sectionTitle}><span style={{color:"#0f766e"}}>2.</span> Daily Attendance</h2>
              <p style={styles.text}>
                Every morning, open the <strong>Worker Attendance</strong> page. Select your site and date.
                You will see a list of all assigned workers. Quickly mark them as <strong>Present</strong>, <strong>Half Day</strong>, or <strong>Absent</strong>.
                You can export this daily sheet to CSV using the Export button.
              </p>

              {/* Visual Mock: Attendance Row */}
              <div style={styles.mockUI}>
                <div style={{display:"flex", justifyContent:"flex-end", marginBottom:"12px"}}>
                  <button style={styles.mockBtnOutline}><Download size={14} /> Export CSV</button>
                </div>
                <div style={styles.mockRow}>
                  <div style={{fontWeight:600, fontSize:"14px"}}>Ramesh Kumar</div>
                  <div style={{display:"flex", gap:"8px"}}>
                    <button style={styles.mockBtnGreen}><Check size={14}/> Present</button>
                    <button style={styles.mockBtnYellow}>Half</button>
                    <button style={styles.mockBtnRed}><X size={14}/> Absent</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section style={styles.section}>
            <div style={styles.sectionBody}>
              <h2 style={styles.sectionTitle}><span style={{color:"#0f766e"}}>3.</span> Giving Advances & Generating Salary</h2>
              <p style={styles.text}>
                If a worker needs cash in the middle of the month, go to the <strong>Advance / Expense</strong> page and record the amount.
                At the end of the month, go to the <strong>Salary</strong> page. Click <strong>Generate Payroll</strong>.
                The system automatically calculates the <strong>Net Payable</strong> (Present Days × Daily Wage - Advance).
                Click Print to generate a physical Salary Slip.
              </p>

              {/* Visual Mock: Salary Row */}
              <div style={styles.mockUI}>
                <div style={{display:"flex", justifyContent:"flex-start", marginBottom:"16px"}}>
                  <button style={{...styles.mockBtnBlue, display:"flex", alignItems:"center", gap:"6px", background:"#0f766e"}}><Play size={14}/> Generate Payroll</button>
                </div>
                <div style={styles.mockRow}>
                  <div>
                    <div style={{fontWeight:600, fontSize:"14px"}}>Ramesh Kumar</div>
                    <div style={{fontSize:"12px", color:"#64748b"}}>Days: 28/30</div>
                  </div>
                  <div>
                    <div style={{fontSize:"12px", color:"#64748b"}}>Gross Amount</div>
                    <div style={{fontSize:"14px", fontWeight:600}}>₹16,800</div>
                  </div>
                  <div>
                    <div style={{fontSize:"12px", color:"#64748b"}}>Advance Ded.</div>
                    <div style={{fontSize:"14px", fontWeight:600, color:"#e11d48"}}>-₹2,000</div>
                  </div>
                  <div>
                    <div style={{fontSize:"12px", color:"#64748b"}}>Net Payable</div>
                    <div style={{fontSize:"16px", fontWeight:700, color:"#0f766e"}}>₹14,800</div>
                  </div>
                  <div style={{display:"flex", gap:"8px"}}>
                    <button style={styles.mockBtnBlue}>Mark Paid</button>
                    <button style={styles.mockBtnGray}><Printer size={14}/> Print</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 4 */}
          <section style={styles.section}>
            <div style={styles.sectionBody}>
              <h2 style={styles.sectionTitle}><span style={{color:"#0f766e"}}>4.</span> Tracking Expenses & Analytics</h2>
              <p style={styles.text}>
                Record daily material costs, transport, and petty cash in the <strong>Site Expenses</strong> module.
                Check the <strong>Dashboard</strong> to see live analytics like Total Active Workers, Outstanding Advances, and a graphical Worker Distribution.
              </p>

              {/* Visual Mock: Dashboard KPI */}
              <div style={styles.mockUI}>
                <div style={{display:"flex", gap:"16px"}}>
                  <div style={styles.mockKpi}>
                    <div style={{fontSize:"12px", color:"#64748b", fontWeight:600}}>Total Workers</div>
                    <div style={{fontSize:"24px", fontWeight:800, color:"#0f172a", marginTop:"4px"}}>45</div>
                  </div>
                  <div style={styles.mockKpi}>
                    <div style={{fontSize:"12px", color:"#64748b", fontWeight:600}}>Total Advance</div>
                    <div style={{fontSize:"24px", fontWeight:800, color:"#0f172a", marginTop:"4px"}}>₹12,500</div>
                  </div>
                  <div style={styles.mockKpi}>
                    <div style={{fontSize:"12px", color:"#64748b", fontWeight:600}}>Active Sites</div>
                    <div style={{fontSize:"24px", fontWeight:800, color:"#0f172a", marginTop:"4px"}}>3</div>
                  </div>
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
    padding: "32px",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    background: "#fff",
    padding: "32px",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    marginBottom: "32px"
  },
  logoCircle: {
    width: "64px",
    height: "64px",
    background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
    color: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "bold",
    boxShadow: "0 8px 24px rgba(15, 118, 110, 0.3)"
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px"
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  section: {
    background: "#fff",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    border: "1px solid #e2e8f0"
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 16px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  text: {
    fontSize: "15px",
    color: "#475569",
    lineHeight: 1.6,
    margin: "0 0 24px 0"
  },
  mockUI: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px"
  },
  mockRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
    border: "1px solid #e2e8f0"
  },
  mockBtnBlue: { background: "#2563eb", color: "#fff", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", border: "none" },
  mockBtnGray: { display:"flex", alignItems:"center", gap:"4px", background: "#f1f5f9", color: "#475569", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", border: "none" },
  mockBtnOutline: { display:"flex", alignItems:"center", gap:"4px", background: "#fff", color: "#334155", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600" },
  mockBtnGreen: { display:"flex", alignItems:"center", gap:"4px", background: "#dcfce7", color: "#166534", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", border: "none" },
  mockBtnYellow: { background: "#fef3c7", color: "#92400e", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", border: "none" },
  mockBtnRed: { display:"flex", alignItems:"center", gap:"4px", background: "#fee2e2", color: "#991b1b", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", border: "none" },
  mockKpi: { flex: 1, background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", border: "1px solid #e2e8f0" }
};
