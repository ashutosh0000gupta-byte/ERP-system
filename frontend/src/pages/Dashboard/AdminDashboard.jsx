import MainLayout from "../../components/layout/MainLayout";
import WelcomeCard from "../../components/shared/Dashboardgreeting";
import { Users, CheckCircle, Clock, MapPin, IndianRupee, TrendingUp } from "lucide-react";

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
            value="156" 
            subtitle="+12 new this month"
            icon={Users} 
            color="#3b82f6" 
          />
          <KpiCard 
            title="Present Today" 
            value="142" 
            subtitle="91% Attendance Rate"
            icon={CheckCircle} 
            color="#10b981" 
          />
          <KpiCard 
            title="Total Overtime (Month)" 
            value="420 hrs" 
            subtitle="Across 3 active sites"
            icon={Clock} 
            color="#f59e0b" 
          />
          <KpiCard 
            title="Active Sites" 
            value="3" 
            subtitle="HCCB Khurda, Jalpaiguri, Siliguri"
            icon={MapPin} 
            color="#8b5cf6" 
          />
          <KpiCard 
            title="Total Advance" 
            value="₹45,000" 
            subtitle="Outstanding balance"
            icon={IndianRupee} 
            color="#ef4444" 
          />
          <KpiCard 
            title="This Month Labour Cost" 
            value="₹8.4L" 
            subtitle="Estimated running cost"
            icon={TrendingUp} 
            color="#0ea5e9" 
          />
        </div>

        {/* Future expansion for charts/tables */}
        <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "16px", color: "#1e293b" }}>Recent Worker Activity</h3>
            <p style={{ color: "#94a3b8", fontSize: "14px", fontStyle: "italic" }}>Attendance trends chart will be displayed here...</p>
          </div>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "16px", color: "#1e293b" }}>Site Status</h3>
            <p style={{ color: "#94a3b8", fontSize: "14px", fontStyle: "italic" }}>Site-wise distribution will be displayed here...</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}