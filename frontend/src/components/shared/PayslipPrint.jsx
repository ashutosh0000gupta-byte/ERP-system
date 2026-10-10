import React from "react";
import { Building2 } from "lucide-react";

export default function PayslipPrint({ salary }) {
  if (!salary) return null;

  const worker = salary.worker || {};

  const periodDisplay = salary.startDate && salary.endDate
    ? `${new Date(salary.startDate).toLocaleDateString('en-GB')} to ${new Date(salary.endDate).toLocaleDateString('en-GB')}`
    : (salary.month && salary.year 
        ? `${new Date(salary.year, salary.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}` 
        : "Current Period");

  const rateApplied = Number(salary.rateApplied || salary.dailyWage || 0);
  const paidAmount = Number(salary.paidAmount || 0);
  const balanceAmount = Number(salary.balanceAmount !== undefined ? salary.balanceAmount : Math.max(0, Number(salary.netAmount) - paidAmount));

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
          <h1 style={styles.docTitle}>WORKER WAGE SLIP</h1>
          <p style={styles.docMonth}>Pay Period: <strong>{periodDisplay}</strong> ({salary.periodType || "Monthly"})</p>
        </div>

        {/* Worker Info */}
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
                <td style={styles.label}>Trade / Designation:</td>
                <td style={styles.value}>{worker.skillTrade || "Labor"}</td>
                <td style={styles.label}>Site Name:</td>
                <td style={styles.value}>{worker.site?.name || "All Sites"}</td>
              </tr>
              <tr>
                <td style={styles.label}>Salary Type:</td>
                <td style={styles.value}>
                  <span style={styles.badge}>{salary.salaryType || worker.salaryType || "Daily"} Wage</span>
                </td>
                <td style={styles.label}>Pay Frequency:</td>
                <td style={styles.value}>{worker.paymentFrequency || salary.periodType || "Monthly"}</td>
              </tr>
              <tr>
                <td style={styles.label}>Wage Rate:</td>
                <td style={styles.value}>₹{rateApplied.toLocaleString()} / {salary.salaryType === 'Hourly' ? 'hr' : salary.salaryType === 'Weekly' ? 'wk' : salary.salaryType === 'Monthly' ? 'mo' : 'day'}</td>
                <td style={styles.label}>Attendance Days:</td>
                <td style={styles.value}><strong>{Number(salary.presentDays)}</strong> days (Total in period: {salary.totalDays})</td>
              </tr>
              <tr>
                <td style={styles.label}>Payment Method:</td>
                <td style={styles.value}>{salary.paymentMode || worker.paymentMethod || "Bank Transfer"}</td>
                <td style={styles.label}>Bank A/C / IFSC:</td>
                <td style={styles.value}>{worker.bankAccount ? `${worker.bankAccount} (${worker.ifsc || 'N/A'})` : "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Earnings & Deductions */}
        <div style={styles.salarySection}>
          <div style={styles.halfWidth}>
            <h3 style={styles.sectionTitle}>Earnings (Gross Breakdown)</h3>
            <table style={styles.calcTable}>
              <tbody>
                <tr>
                  <td style={styles.calcLabel}>
                    Base Attendance Pay
                    <div style={{fontSize: "11px", color: "#64748b"}}>
                      {salary.salaryType || "Daily"} ({Number(salary.presentDays)} days @ ₹{rateApplied})
                    </div>
                  </td>
                  <td style={styles.calcAmount}>₹{(Number(salary.grossAmount) - Number(salary.otAmount || 0)).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={styles.calcLabel}>
                    Overtime Pay
                    <div style={{fontSize: "11px", color: "#64748b"}}>
                      {Number(salary.otHours || 0)} OT Hours
                    </div>
                  </td>
                  <td style={styles.calcAmount}>₹{Number(salary.otAmount || 0).toLocaleString()}</td>
                </tr>
                <tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                  <td style={styles.calcLabel}>Total Gross Earnings</td>
                  <td style={styles.calcAmount}>₹{Number(salary.grossAmount).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={styles.halfWidth}>
            <h3 style={styles.sectionTitle}>Deductions & Advances</h3>
            <table style={styles.calcTable}>
              <tbody>
                <tr>
                  <td style={styles.calcLabel}>
                    Advance Deducted
                    <div style={{fontSize: "11px", color: "#64748b"}}>Recovered from active advances</div>
                  </td>
                  <td style={{ ...styles.calcAmount, color: "#e11d48" }}>-₹{Number(salary.advanceDeducted).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={styles.calcLabel}>Statutory Deductions (PF / ESIC)</td>
                  <td style={styles.calcAmount}>₹{(Number(salary.pfDeducted || 0) + Number(salary.esicDeducted || 0)).toLocaleString()}</td>
                </tr>
                <tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                  <td style={styles.calcLabel}>Total Deductions</td>
                  <td style={{ ...styles.calcAmount, color: "#e11d48" }}>-₹{(Number(salary.advanceDeducted) + Number(salary.pfDeducted || 0) + Number(salary.esicDeducted || 0)).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Net & Payment Settlement */}
        <div style={styles.netSection}>
          <div>
            <div style={styles.netLabel}>NET PAYABLE AMOUNT</div>
            <div style={styles.netAmount}>₹{Number(salary.netAmount).toLocaleString()}</div>
          </div>
          <div style={styles.settlementBox}>
            <div style={{ fontSize: "12px", color: "#d1fae5" }}>Amount Disbursed (Paid): <strong>₹{paidAmount.toLocaleString()}</strong></div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: balanceAmount > 0 ? "#fef08a" : "#fff", marginTop: "4px" }}>
              Pending Balance: ₹{balanceAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: "11px", color: "#ecfdf5", marginTop: "2px" }}>Status: {salary.status || "Pending"}</div>
          </div>
        </div>

        {/* Signatures */}
        <div style={styles.footer}>
          <div style={styles.signBox}>
            <div style={styles.signLine}>Authorized Signatory (Employer)</div>
          </div>
          <div style={styles.signBox}>
            <div style={styles.signLine}>Worker Signature / Thumb Impression</div>
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
  payslip: { width: "7.8in", border: "2px solid #334155", padding: "28px", background: "#fff", display: "flex", flexDirection: "column", gap: "18px" },
  header: { textAlign: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: "16px" },
  headerTop: { display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "12px" },
  logoCircle: { width: "46px", height: "46px", border: "2px solid #0f766e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  companyName: { fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "1px" },
  companySub: { fontSize: "11px", color: "#64748b", margin: 0, textTransform: "uppercase" },
  docTitle: { fontSize: "17px", fontWeight: "700", margin: "0 0 4px 0", letterSpacing: "2px", color: "#0f766e" },
  docMonth: { fontSize: "13px", margin: 0, color: "#334155" },
  
  infoSection: { border: "1px solid #cbd5e1", borderRadius: "8px", padding: "14px", background: "#fafafa" },
  infoTable: { width: "100%", borderCollapse: "collapse", fontSize: "12px" },
  label: { width: "18%", fontWeight: "600", color: "#475569", padding: "5px 4px" },
  value: { width: "32%", fontWeight: "700", color: "#0f172a", padding: "5px 4px" },
  badge: { background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 },
  
  salarySection: { display: "flex", gap: "16px" },
  halfWidth: { width: "50%", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden" },
  sectionTitle: { margin: 0, padding: "8px 12px", background: "#f1f5f9", fontSize: "13px", fontWeight: "700", borderBottom: "1px solid #cbd5e1", color: "#1e293b" },
  calcTable: { width: "100%", borderCollapse: "collapse", fontSize: "12px" },
  calcLabel: { padding: "8px 12px", fontWeight: "500", borderBottom: "1px solid #f1f5f9" },
  calcAmount: { padding: "8px 12px", textAlign: "right", fontWeight: "700", borderBottom: "1px solid #f1f5f9" },
  
  netSection: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f766e", color: "#fff", padding: "16px 20px", borderRadius: "8px" },
  netLabel: { fontSize: "12px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", opacity: 0.9 },
  netAmount: { fontSize: "24px", fontWeight: "800" },
  settlementBox: { textAlign: "right", borderLeft: "1px solid rgba(255,255,255,0.25)", paddingLeft: "18px" },
  
  footer: { display: "flex", justifyContent: "space-between", marginTop: "45px", padding: "0 20px" },
  signBox: { width: "220px", textAlign: "center" },
  signLine: { borderTop: "1.5px solid #000", paddingTop: "6px", fontSize: "11px", fontWeight: "600", color: "#334155" }
};
