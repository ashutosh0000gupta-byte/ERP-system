import React from "react";
import { Building2 } from "lucide-react";

export default function PayslipPrint({ salary }) {
  if (!salary) return null;

  const worker = salary.worker || {};

  return (
    <div className="payslip-print-container" style={styles.container}>
      <div style={styles.payslip}>
        
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div style={styles.logoCircle}><Building2 size={32} color="#0f766e" /></div>
            <div style={styles.companyInfo}>
              <h2 style={styles.companyName}>SNMR FAB INDIA PVT LTD</h2>
              <p style={styles.companySub}>Construction & Civil Engineering Contractors</p>
            </div>
          </div>
          <h1 style={styles.docTitle}>SALARY SLIP</h1>
          <p style={styles.docMonth}>For the Month of {new Date(salary.year, salary.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Employee Info */}
        <div style={styles.infoSection}>
          <table style={styles.infoTable}>
            <tbody>
              <tr>
                <td style={styles.label}>Worker Name:</td>
                <td style={styles.value}>{worker.fullName?.toUpperCase()}</td>
                <td style={styles.label}>Worker ID:</td>
                <td style={styles.value}>{worker.workerId}</td>
              </tr>
              <tr>
                <td style={styles.label}>Trade / Role:</td>
                <td style={styles.value}>{worker.skillTrade || "N/A"}</td>
                <td style={styles.label}>Site Name:</td>
                <td style={styles.value}>{worker.site?.name || "Unassigned"}</td>
              </tr>
              <tr>
                <td style={styles.label}>Total Days in Month:</td>
                <td style={styles.value}>{salary.totalDays}</td>
                <td style={styles.label}>Present Days (incl. Half):</td>
                <td style={styles.value}>{Number(salary.presentDays)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Earnings & Deductions */}
        <div style={styles.salarySection}>
          <div style={styles.halfWidth}>
            <h3 style={styles.sectionTitle}>Earnings</h3>
            <table style={styles.calcTable}>
              <tbody>
                <tr>
                  <td style={styles.calcLabel}>Basic Daily Wage</td>
                  <td style={styles.calcAmount}>₹{Number(salary.dailyWage).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={styles.calcLabel}>Gross Earnings<br/><span style={{fontSize: "10px", color: "#64748b"}}>(Wage × Present Days)</span></td>
                  <td style={styles.calcAmount}>₹{Number(salary.grossAmount).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={styles.halfWidth}>
            <h3 style={styles.sectionTitle}>Deductions</h3>
            <table style={styles.calcTable}>
              <tbody>
                <tr>
                  <td style={styles.calcLabel}>Advance Deducted</td>
                  <td style={styles.calcAmount}>₹{Number(salary.advanceDeducted).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={styles.calcLabel}>Other Deductions</td>
                  <td style={styles.calcAmount}>₹0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Net */}
        <div style={styles.netSection}>
          <div style={styles.netText}>NET PAYABLE AMOUNT</div>
          <div style={styles.netAmount}>₹{Number(salary.netAmount).toLocaleString()}</div>
        </div>

        <div style={styles.footer}>
          <div style={styles.signBox}>
            <div style={styles.signLine}>Employer Signature</div>
          </div>
          <div style={styles.signBox}>
            <div style={styles.signLine}>Worker Signature</div>
          </div>
        </div>

      </div>

      <style>
        {`
          @media screen {
            .payslip-print-container { display: none !important; }
          }
          @media print {
            body * { visibility: hidden; }
            .payslip-print-container, .payslip-print-container * { visibility: visible; }
            .payslip-print-container {
              position: absolute; left: 0; top: 0; width: 100%; display: flex !important; justify-content: center; padding: 20px;
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: { fontFamily: "'Inter', sans-serif", zIndex: 9999, background: "#fff", color: "#000" },
  payslip: { width: "7.5in", border: "2px solid #334155", padding: "30px", background: "#fff", display: "flex", flexDirection: "column", gap: "20px" },
  header: { textAlign: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px" },
  headerTop: { display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "16px" },
  logoCircle: { width: "50px", height: "50px", border: "2px solid #0f766e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  companyName: { fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "1px" },
  companySub: { fontSize: "12px", color: "#64748b", margin: 0, textTransform: "uppercase" },
  docTitle: { fontSize: "18px", fontWeight: "700", margin: "0 0 4px 0", letterSpacing: "2px" },
  docMonth: { fontSize: "14px", margin: 0, fontWeight: "600" },
  
  infoSection: { border: "1px solid #cbd5e1", padding: "16px" },
  infoTable: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  label: { width: "20%", fontWeight: "600", color: "#475569", padding: "6px 0" },
  value: { width: "30%", fontWeight: "700", color: "#0f172a", padding: "6px 0" },
  
  salarySection: { display: "flex", gap: "20px" },
  halfWidth: { width: "50%", border: "1px solid #cbd5e1" },
  sectionTitle: { margin: 0, padding: "10px", background: "#f1f5f9", fontSize: "14px", fontWeight: "700", borderBottom: "1px solid #cbd5e1" },
  calcTable: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  calcLabel: { padding: "10px", fontWeight: "600" },
  calcAmount: { padding: "10px", textAlign: "right", fontWeight: "700" },
  
  netSection: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f766e", color: "#fff", padding: "16px", border: "1px solid #0f766e" },
  netText: { fontSize: "16px", fontWeight: "700" },
  netAmount: { fontSize: "24px", fontWeight: "800" },
  
  footer: { display: "flex", justifyContent: "space-between", marginTop: "60px", padding: "0 20px" },
  signBox: { width: "200px", textAlign: "center" },
  signLine: { borderTop: "1px solid #000", paddingTop: "8px", fontSize: "12px", fontWeight: "600" }
};
