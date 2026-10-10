import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import WelcomeCard from "../../components/shared/Dashboardgreeting";
import { Users, CheckCircle, Clock, MapPin, IndianRupee, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../../services/api";

const COLORS = ['#0f766e', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

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
    totalSalaries: 0,
    totalExpenses: 0,
    presentToday: 0,
    chartData: []
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
          <KpiCard 
            title="Total Salaries Paid" 
            value={`₹${Number(stats.totalSalaries || 0).toLocaleString()}`} 
            subtitle="Cleared wage payments"
            icon={IndianRupee} 
            color="#10b981" 
          />
          <KpiCard 
            title="Total Site Expenses" 
            value={`₹${Number(stats.totalExpenses || 0).toLocaleString()}`} 
            subtitle="Material & operational costs"
            icon={TrendingUp} 
            color="#f59e0b" 
          />
        </div>

        {stats.chartData && stats.chartData.length > 0 && (
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            marginTop: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            height: "400px"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 20px 0", color: "#0f172a" }}>
              Worker Distribution by Site
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="workers"
                >
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </MainLayout>
  );
}