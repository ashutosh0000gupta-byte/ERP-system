const fs = require('fs');

let file = fs.readFileSync('frontend/src/pages/Sites/Sites.jsx', 'utf8');

if (!file.includes('const handleDeleteSite')) {
  file = file.replace(
    'const filteredSites = sites.filter(site =>',
    `const handleDeleteSite = async (id) => {
    if (!window.confirm("Are you sure you want to delete this site? All related workers might be affected.")) return;
    try {
      await api.delete(\`/snmr/sites/\${id}\`);
      setSites(sites.filter(s => s.id !== id));
    } catch (err) {
      alert("Failed to delete site");
    }
  };

  const filteredSites = sites.filter(site =>`
  );
}

if (!file.includes('const [viewSite, setViewSite]')) {
  file = file.replace(
    'const [isSubmitting, setIsSubmitting] = useState(false);',
    'const [isSubmitting, setIsSubmitting] = useState(false);\n  const [viewSite, setViewSite] = useState(null);'
  );
}

if (!file.includes('onClick={() => setViewSite(site)}')) {
  file = file.replace(
    '<button style={styles.viewButton}>View Details</button>',
    '<button style={styles.viewButton} onClick={() => setViewSite(site)}>View Details</button>\n                  <button style={{...styles.viewButton, background: "#fee2e2", color: "#991b1b", marginLeft: "10px"}} onClick={() => handleDeleteSite(site.id)}>Delete</button>'
  );
}

if (!file.includes('View Site Details')) {
  file = file.replace(
    '{/* Create Modal */}',
    `{/* View Modal */}
        {viewSite && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Site Details</h2>
                <button style={styles.closeButton} onClick={() => setViewSite(null)}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ padding: "24px" }}>
                <p><strong>Site ID:</strong> {viewSite.siteId}</p>
                <p><strong>Name:</strong> {viewSite.name}</p>
                <p><strong>Location:</strong> {viewSite.location}</p>
                <p><strong>Client:</strong> {viewSite.client || "Not Specified"}</p>
                <p><strong>Status:</strong> {viewSite.status || "Active"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}`
  );
}

fs.writeFileSync('frontend/src/pages/Sites/Sites.jsx', file);
