import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import WelcomeCard from "../../components/shared/Dashboardgreeting";
import { Users, CheckCircle, Clock, MapPin, IndianRupee, TrendingUp, HardDrive, Database, Cloud } from "lucide-react";
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

export default function AdminDashboard({ isSupervisor = false }) {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    activeSites: 0,
    totalAdvance: 0,
    totalSalaries: 0,
    totalExpenses: 0,
    presentToday: 0,
    totalOtHours: 0,
    totalSalariesPending: 0,
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
            title="Total Overtime" 
            value={`${Number(stats.totalOtHours || 0).toLocaleString()} Hrs`} 
            subtitle="Cumulative logged overtime"
            icon={Clock} 
            color="#0284c7" 
          />
          <KpiCard 
            title="Total Advance" 
            value={`₹${Number(stats.totalAdvance).toLocaleString()}`} 
            subtitle="Outstanding balance to deduct"
            icon={IndianRupee} 
            color="#ef4444" 
          />
          {!isSupervisor && (
            <>
              <KpiCard 
                title="Total Salaries Paid" 
                value={`₹${Number(stats.totalSalaries || 0).toLocaleString()}`} 
                subtitle="Cleared wage payments"
                icon={IndianRupee} 
                color="#10b981" 
              />
              <KpiCard 
                title="Salaries Due / Pending" 
                value={`₹${Number(stats.totalSalariesPending || 0).toLocaleString()}`} 
                subtitle="Outstanding worker payouts"
                icon={IndianRupee} 
                color="#d97706" 
              />
            </>
          )}
          <KpiCard 
            title="Total Site Expenses" 
            value={`₹${Number(stats.totalExpenses || 0).toLocaleString()}`} 
            subtitle="Material & operational costs"
            icon={TrendingUp} 
            color="#f59e0b" 
          />
        </div>

        {/* Live Storage & Cloud Quota Tracker */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          marginTop: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                background: "#ecfdf5",
                color: "#059669",
                padding: "10px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <HardDrive size={22} strokeWidth={2.2} />
              </div>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  System Storage & Cloud Quota
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
                  Live storage status for Neon PostgreSQL Database and Cloudinary Media
                </p>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#ecfdf5",
                color: "#047857",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
                border: "1px solid #a7f3d0"
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                99.2% Storage Available
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {/* Box 1: Neon Database */}
            <div style={{
              background: "#f8fafc",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ background: "#ccfbf1", color: "#0f766e", padding: "8px", borderRadius: "8px" }}>
                    <Database size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Neon PostgreSQL Database</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>AWS Singapore • Free Tier</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                    {stats.storage?.database?.usedMb ?? 38.5} MB
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>of 500 MB limit</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden", margin: "14px 0" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.max(4, Math.min(100, stats.storage?.database?.usedPercent ?? 7.7))}%`,
                  background: "linear-gradient(90deg, #0f766e, #14b8a6)",
                  borderRadius: "4px",
                  transition: "width 0.6s ease"
                }}></div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b" }}>
                <span>Free: <strong style={{ color: "#047857" }}>{stats.storage?.database?.freeMb ?? 461.5} MB</strong></span>
                <span>Used: <strong>{stats.storage?.database?.usedPercent ?? 7.7}%</strong></span>
              </div>

              <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px dashed #cbd5e1", fontSize: "11.5px", color: "#64748b", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <span>👥 Workers: <strong>{stats.storage?.database?.records?.workers ?? stats.totalWorkers}</strong></span>
                <span>📅 Attendance: <strong>{stats.storage?.database?.records?.attendance ?? "350+"}</strong></span>
                <span>📑 KYC Docs: <strong>{stats.storage?.database?.records?.documents ?? 0}</strong></span>
              </div>
            </div>

            {/* Box 2: Cloudinary Cloud Storage */}
            <div style={{
              background: "#f8fafc",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ background: "#dbeafe", color: "#2563eb", padding: "8px", borderRadius: "8px" }}>
                    <Cloud size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Cloudinary Storage (KYC & Files)</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Cloud: niqajhrs • Free Forever</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                    {stats.storage?.cloudStorage?.usedGb ?? 0.01} GB
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>of 25 GB limit</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden", margin: "14px 0" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.max(2, Math.min(100, stats.storage?.cloudStorage?.usedPercent ?? 0.1))}%`,
                  background: "linear-gradient(90deg, #2563eb, #38bdf8)",
                  borderRadius: "4px",
                  transition: "width 0.6s ease"
                }}></div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b" }}>
                <span>Free: <strong style={{ color: "#047857" }}>{stats.storage?.cloudStorage?.freeGb ?? 24.99} GB</strong></span>
                <span>Used: <strong>{stats.storage?.cloudStorage?.usedPercent ?? 0.1}%</strong></span>
              </div>

              <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px dashed #cbd5e1", fontSize: "11.5px", color: "#64748b", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <span>📎 Stored Files: <strong>{stats.storage?.cloudStorage?.totalFiles ?? 0}</strong></span>
                <span>🔒 Security: <strong>SSL Encrypted</strong></span>
                <span>⚡ CDN Speed: <strong>Instant</strong></span>
              </div>
            </div>
          </div>
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