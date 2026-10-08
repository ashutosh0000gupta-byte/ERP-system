import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { Building2, MapPin, Users } from "lucide-react";

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await api.get("/snmr/sites");
      setSites(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", margin: 0, color: "#1e293b" }}>Sites / Projects</h1>
          <button style={{ background: "#0f766e", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
            + Create Site
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading sites...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
            {sites.map(site => (
              <div key={site.id} style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>{site.name}</h3>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={14} /> {site.location}
                    </p>
                  </div>
                  <span style={{ background: site.status === "Active" ? "#dcfce7" : "#f1f5f9", color: site.status === "Active" ? "#166534" : "#475569", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
                    {site.status}
                  </span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "#64748b" }}>Client</span>
                    <span style={{ fontWeight: 500, color: "#334155" }}>{site.client}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "#64748b" }}>Supervisor</span>
                    <span style={{ fontWeight: 500, color: "#334155" }}>{site.supervisor ? `${site.supervisor.firstName} ${site.supervisor.lastName}` : "Not Assigned"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
