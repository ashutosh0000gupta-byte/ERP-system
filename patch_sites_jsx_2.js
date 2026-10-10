const fs = require('fs');
let file = fs.readFileSync('frontend/src/pages/Sites/Sites.jsx', 'utf8');

// Require password for site deletion
if (file.includes('if (!window.confirm("Are you sure you want to delete this site')) {
  file = file.replace(
    'if (!window.confirm("Are you sure you want to delete this site? All related workers might be affected.")) return;',
    'if (!window.confirm("Are you sure you want to delete this site? All related workers might be affected.")) return;\n    const pwd = window.prompt("Enter Admin Password to confirm deletion:");\n    if (!pwd) return;'
  );
}

// Add function to update site status
if (!file.includes('const handleUpdateSiteStatus')) {
  file = file.replace(
    'const handleDeleteSite = async',
    `const handleUpdateSiteStatus = async (id, status) => {
    try {
      await api.put(\`/snmr/sites/\${id}\`, { status });
      setSites(sites.map(s => s.id === id ? { ...s, status } : s));
      if (viewSite && viewSite.id === id) {
        setViewSite({ ...viewSite, status });
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDeleteSite = async`
  );
}

// Update the View Modal to include status dropdown
if (file.includes('<p><strong>Status:</strong> {viewSite.status || "Active"}</p>')) {
  file = file.replace(
    '<p><strong>Status:</strong> {viewSite.status || "Active"}</p>',
    `<p style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <strong>Status:</strong>
                  <select 
                    value={viewSite.status || "Active"} 
                    onChange={e => handleUpdateSiteStatus(viewSite.id, e.target.value)}
                    style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Completed">Completed</option>
                  </select>
                </p>`
  );
}

fs.writeFileSync('frontend/src/pages/Sites/Sites.jsx', file);
