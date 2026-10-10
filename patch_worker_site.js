const fs = require('fs');
let file = fs.readFileSync('frontend/src/pages/Workers/WorkerProfile.jsx', 'utf8');

if (!file.includes('const [sites, setSites] = useState([]);')) {
  file = file.replace(
    'const [documents, setDocuments] = useState([]);',
    'const [documents, setDocuments] = useState([]);\n  const [sites, setSites] = useState([]);'
  );
}

if (!file.includes('api.get("/snmr/sites")')) {
  file = file.replace(
    'api.get(`/snmr/documents?entityId=${id}&entityType=Worker`)',
    'api.get(`/snmr/documents?entityId=${id}&entityType=Worker`)\n      .then(res => setDocuments(res.data))\n      .catch(console.error);\n\n    api.get("/snmr/sites")\n      .then(res => setSites(res.data))'
  );
}

if (file.includes('fullName: worker.fullName || ""')) {
  file = file.replace(
    'fullName: worker.fullName || ""',
    'fullName: worker.fullName || "",\n      siteId: worker.siteId || ""'
  );
}

// Add site dropdown to the form
if (!file.includes('Select Site to Move')) {
  file = file.replace(
    '<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>\n                  <div>\n                    <label style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "6px" }}>Full Name</label>',
    `<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "6px" }}>Current Site (Move Worker)</label>
                    <select 
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} 
                      value={editData.siteId} 
                      onChange={e => setEditData({...editData, siteId: e.target.value})}
                    >
                      <option value="">No Site Assigned</option>
                      {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.location})</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "6px" }}>Full Name</label>`
  );
}

fs.writeFileSync('frontend/src/pages/Workers/WorkerProfile.jsx', file);
