import React from "react";
import { Building2, User } from "lucide-react";

export default function WorkerIdCard({ worker }) {
  if (!worker) return null;

  return (
    <div className="id-card-print-container" style={styles.container}>
      {/* Front of ID Card */}
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <Building2 size={24} color="#0f766e" />
          </div>
          <div>
            <h2 style={styles.companyName}>SNMR FAB INDIA</h2>
            <p style={styles.companySub}>PRIVATE LIMITED</p>
          </div>
        </div>

        <div style={styles.body}>
          <div style={styles.photoContainer}>
            <User size={48} color="#cbd5e1" />
          </div>
          
          <div style={styles.details}>
            <h3 style={styles.workerName}>{worker.fullName?.toUpperCase()}</h3>
            <p style={styles.trade}>{worker.skillTrade?.toUpperCase() || "GENERAL WORKER"}</p>
            
            <div style={styles.infoGrid}>
              <div style={styles.infoLabel}>ID Number:</div>
              <div style={styles.infoValue}>{worker.workerId}</div>
              
              <div style={styles.infoLabel}>Blood Group:</div>
              <div style={styles.infoValue}>O+</div>

              <div style={styles.infoLabel}>Emergency:</div>
              <div style={styles.infoValue}>{worker.phone || "N/A"}</div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <p style={styles.siteName}>Site: {worker.site?.name || "Unassigned"}</p>
          <div style={styles.barcode}>||| | ||| |||| | ||| ||</div>
        </div>
      </div>
      
      {/* CSS for print mode */}
      <style>
        {`
          @media screen {
            .id-card-print-container {
              display: none !important;
            }
          }
          @media print {
            body * {
              visibility: hidden;
            }
            .id-card-print-container, .id-card-print-container * {
              visibility: visible;
            }
            .id-card-print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              display: flex !important;
              justify-content: center;
              padding: 20px;
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    zIndex: 9999,
    background: "#fff"
  },
  card: {
    width: "2.125in",
    height: "3.375in", // Standard CR80 ID Card dimensions
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    position: "relative"
  },
  header: {
    background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
    color: "#fff",
    padding: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: "4px solid #f59e0b" // Orange accent
  },
  logoCircle: {
    width: "36px",
    height: "36px",
    background: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  companyName: {
    fontSize: "10px",
    fontWeight: "800",
    margin: 0,
    letterSpacing: "0.5px"
  },
  companySub: {
    fontSize: "7px",
    margin: 0,
    opacity: 0.9
  },
  body: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 12px",
    gap: "12px"
  },
  photoContainer: {
    width: "70px",
    height: "85px",
    border: "2px solid #e2e8f0",
    borderRadius: "6px",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  details: {
    width: "100%",
    textAlign: "center"
  },
  workerName: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 2px 0"
  },
  trade: {
    fontSize: "9px",
    fontWeight: "700",
    color: "#0ea5e9",
    margin: "0 0 12px 0"
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4px",
    textAlign: "left",
    fontSize: "8px",
    background: "#f1f5f9",
    padding: "8px",
    borderRadius: "4px"
  },
  infoLabel: {
    color: "#64748b",
    fontWeight: "600"
  },
  infoValue: {
    color: "#0f172a",
    fontWeight: "700"
  },
  footer: {
    background: "#0f172a",
    padding: "8px",
    textAlign: "center",
    color: "#fff"
  },
  siteName: {
    fontSize: "9px",
    margin: "0 0 4px 0",
    fontWeight: "600"
  },
  barcode: {
    fontFamily: "monospace",
    fontSize: "16px",
    letterSpacing: "1px",
    color: "#fff",
    margin: 0
  }
};
