import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, CalendarCheck, IndianRupee, PieChart, ShieldCheck } from "lucide-react";

export default function UserManual() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Link to="/login" style={styles.backBtn}>
            <ArrowLeft size={18} /> Back to Login
          </Link>
          <div style={styles.logoCircle}>S</div>
          <h1 style={styles.title}>SNMR ERP User Manual</h1>
          <p style={styles.subtitle}>Complete guide to managing your construction labor and expenses</p>
        </div>
      </header>

      <main style={styles.main}>
        {/* Step 1 */}
        <section style={styles.section}>
          <div style={styles.sectionIcon}><Users size={32} color="#3b82f6" /></div>
          <div style={styles.sectionBody}>
            <h2 style={styles.sectionTitle}>1. Adding & Managing Workers</h2>
            <p style={styles.text}>
              Start by going to the <strong>Workers</strong> page. Click on the "Add Worker" button. 
              Here you can enter their name, daily wage, trade (e.g., Mason, Helper), and assign them to a specific Site.
              This acts as their digital ID. You can also click the <strong>Print ID</strong> button to generate a physical ID card for them.
            </p>
            <div style={styles.imagePlaceholder}>
              <Users size={64} color="#94a3b8" />
              <p>Image: Worker Add Modal & Print ID button</p>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section style={styles.section}>
          <div style={styles.sectionIcon}><CalendarCheck size={32} color="#10b981" /></div>
          <div style={styles.sectionBody}>
            <h2 style={styles.sectionTitle}>2. Daily Attendance</h2>
            <p style={styles.text}>
              Every morning, open the <strong>Worker Attendance</strong> page. Select your site and date.
              You will see a list of all assigned workers. Quickly mark them as <strong>Present</strong>, <strong>Half Day</strong>, or <strong>Absent</strong>.
              You can export this daily sheet to CSV using the Export button at the top right.
            </p>
            <div style={styles.imagePlaceholder}>
              <CalendarCheck size={64} color="#94a3b8" />
              <p>Image: Attendance marking table with Present/Absent buttons</p>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section style={styles.section}>
          <div style={styles.sectionIcon}><IndianRupee size={32} color="#f59e0b" /></div>
          <div style={styles.sectionBody}>
            <h2 style={styles.sectionTitle}>3. Giving Advances & Generating Salary</h2>
            <p style={styles.text}>
              If a worker needs cash in the middle of the month, go to the <strong>Advances</strong> page and record the amount.
              <br/><br/>
              At the end of the month, go to the <strong>Salary</strong> page. Click <strong>Generate Payroll</strong>.
              The system automatically counts the Present days, multiplies by the daily wage, and subtracts any unpaid advances to calculate the <strong>Net Payable</strong>.
              Click the Print icon to give them a physical Salary Slip.
            </p>
            <div style={styles.imagePlaceholder}>
              <IndianRupee size={64} color="#94a3b8" />
              <p>Image: Salary generation table showing gross, deduction, and net pay</p>
            </div>
          </div>
        </section>

        {/* Step 4 */}
        <section style={styles.section}>
          <div style={styles.sectionIcon}><PieChart size={32} color="#8b5cf6" /></div>
          <div style={styles.sectionBody}>
            <h2 style={styles.sectionTitle}>4. Tracking Expenses & Analytics</h2>
            <p style={styles.text}>
              Record daily material costs, transport, and petty cash in the <strong>Site Expenses</strong> module.
              Check the <strong>Admin Dashboard</strong> to see live analytics like Total Active Workers, Outstanding Advances, and a Pie Chart of worker distribution across your sites.
            </p>
            <div style={styles.imagePlaceholder}>
              <PieChart size={64} color="#94a3b8" />
              <p>Image: Admin Dashboard with live stats and graphs</p>
            </div>
          </div>
        </section>

        {/* Step 5 */}
        <section style={styles.section}>
          <div style={styles.sectionIcon}><ShieldCheck size={32} color="#ef4444" /></div>
          <div style={styles.sectionBody}>
            <h2 style={styles.sectionTitle}>5. Supervisor Access</h2>
            <p style={styles.text}>
              Need your site supervisor to mark attendance but hide financial data? Give them a Supervisor account (e.g., supervisor@snmrfab.in).
              They will only see the Dashboard, Workers, and Attendance pages. Salary and Advance data is strictly hidden.
            </p>
          </div>
        </section>
      </main>
      
      <footer style={styles.footer}>
        <p>© 2026 SNMR FAB INDIA PRIVATE LIMITED - All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Inter', sans-serif"
  },
  header: {
    background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
    padding: "60px 20px",
    textAlign: "center",
    color: "#fff"
  },
  headerContent: {
    maxWidth: "800px",
    margin: "0 auto",
    position: "relative"
  },
  backBtn: {
    position: "absolute",
    left: 0,
    top: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#cbd5e1",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    background: "rgba(255,255,255,0.1)",
    padding: "8px 16px",
    borderRadius: "20px"
  },
  logoCircle: {
    width: "64px",
    height: "64px",
    background: "#f59e0b",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0 auto 24px",
    boxShadow: "0 4px 20px rgba(245, 158, 11, 0.4)"
  },
  title: {
    fontSize: "36px",
    fontWeight: "800",
    margin: "0 0 12px 0",
    letterSpacing: "-0.5px"
  },
  subtitle: {
    fontSize: "16px",
    color: "#94a3b8",
    margin: 0
  },
  main: {
    maxWidth: "900px",
    margin: "-40px auto 40px",
    background: "#fff",
    borderRadius: "24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "40px"
  },
  section: {
    display: "flex",
    gap: "24px",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "40px"
  },
  sectionIcon: {
    width: "64px",
    height: "64px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  sectionBody: {
    flex: 1
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 16px 0"
  },
  text: {
    fontSize: "15px",
    color: "#475569",
    lineHeight: 1.6,
    margin: "0 0 24px 0"
  },
  imagePlaceholder: {
    width: "100%",
    height: "240px",
    background: "#f1f5f9",
    border: "2px dashed #cbd5e1",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    color: "#64748b",
    fontWeight: "600"
  },
  footer: {
    textAlign: "center",
    padding: "24px",
    color: "#94a3b8",
    fontSize: "14px"
  }
};
