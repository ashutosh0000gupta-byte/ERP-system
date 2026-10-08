import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import WelcomeCard from "../../components/shared/Dashboardgreeting";
import { Users, CheckCircle, Clock, MapPin, IndianRupee, TrendingUp } from "lucide-react";
import api from "../../services/api";

const KpiCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div style={{
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    position: "relative",
    overflow: "hidden"
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 600, margin: 0 }}>{title}</p>
        <h3 style={{ fontSize: "28px", fontWeight: 800, margin: "8px 0 0", color: "#0f172a" }}>{value}</h3>
      </div>
      <div style={{
        background: `${color}15`,
        padding: "12px",
        borderRadius: "12px",
        color: color
      }}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
    </div>
    <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0, fontWeight: 500 }}>
      {subtitle}
    </p>
    <div style={{
      position: "absolute",
      right: "-20px",
      bottom: "-20px",
      opacity: 0.03,
      transform: "scale(2.5)",
      color: color
    }}>
      <Icon size={64} />
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    activeSites: 0,
    totalAdvance: 0,
    presentToday: 0
  });

  useEffect(() => {
    api.get("/snmr/dashboard").then(res => setStats(res.data)).catch(console.error);
  }, []);

  return (
    <MainLayout>
      <div style={{ maxWidth: "1480px", margin: "0 auto", paddingBottom: "40px" }}>
        <WelcomeCard />

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          marginTop: "24px"
        }}>
          <KpiCard 
            title="Total Workers" 
            value={stats.totalWorkers} 
            subtitle="Active on all sites"
            icon={Users} 
            color="#3b82f6" 
          />
          <KpiCard 
            title="Present Today" 
            value={stats.presentToday} 
            subtitle="Current attendance"
            icon={CheckCircle} 
            color="#10b981" 
          />
          <KpiCard 
            title="Active Sites" 
            value={stats.activeSites} 
            subtitle="Ongoing construction projects"
            icon={MapPin} 
            color="#8b5cf6" 
          />
          <KpiCard 
            title="Total Advance" 
            value={`₹${Number(stats.totalAdvance).toLocaleString()}`} 
            subtitle="Outstanding balance to deduct"
            icon={IndianRupee} 
            color="#ef4444" 
          />
        </div>
      </div>
    </MainLayout>
  );
}