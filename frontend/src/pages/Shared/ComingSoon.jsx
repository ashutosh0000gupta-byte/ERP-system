import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Hammer } from "lucide-react";

export default function ComingSoon({ title = "Feature Coming Soon" }) {
  return (
    <MainLayout>
      <div style={{
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "70vh", 
        textAlign: "center",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          width: "80px", 
          height: "80px", 
          background: "#f8fafc", 
          borderRadius: "24px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          marginBottom: "24px",
          border: "2px dashed #cbd5e1"
        }}>
          <Hammer size={40} color="#94a3b8" />
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.5px" }}>
          {title}
        </h1>
        <p style={{ fontSize: "16px", color: "#64748b", maxWidth: "400px", lineHeight: "1.6" }}>
          We are currently working hard to bring you this feature. It will be available in a future update!
        </p>
      </div>
    </MainLayout>
  );
}
