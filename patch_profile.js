const fs = require('fs');

let profile = fs.readFileSync('frontend/src/pages/Workers/WorkerProfile.jsx', 'utf8');

// 1. Add states for edit modal
if (!profile.includes('const [isEditModalOpen, setIsEditModalOpen]')) {
  profile = profile.replace(
    'const [docType, setDocType] = useState("Aadhaar");',
    'const [docType, setDocType] = useState("Aadhaar");\n  const [isEditModalOpen, setIsEditModalOpen] = useState(false);\n  const [editData, setEditData] = useState({});\n  const [isSaving, setIsSaving] = useState(false);'
  );
}

// 2. Add handleEditSave
if (!profile.includes('const handleEditSave = async')) {
  profile = profile.replace(
    'const handleToggleStatus = async () => {',
    `const handleEditSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put(\`/snmr/workers/\${id}\`, editData);
      fetchWorker();
      setIsEditModalOpen(false);
    } catch (err) {
      alert("Failed to update details");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = () => {
    setEditData({
      mobileNumber: worker.mobileNumber || "",
      currentAddress: worker.currentAddress || "",
      bankAccount: worker.bankAccount || "",
      ifsc: worker.ifsc || "",
      pan: worker.pan || "",
      aadhaar: worker.aadhaar || "",
      dailyWage: worker.dailyWage || 0,
      fullName: worker.fullName || ""
    });
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async () => {`
  );
}

// 3. Fix joiningDate display & update phone/address fields
profile = profile.replace('worker.phone ||', 'worker.mobileNumber ||');
profile = profile.replace('worker.address ||', 'worker.currentAddress ||');
profile = profile.replace('worker.joinDate', 'worker.joiningDate');

// 4. Add Edit button to Header
if (!profile.includes('openEditModal')) {
  profile = profile.replace(
    'onClick={handleToggleStatus}',
    'onClick={handleToggleStatus}' // dummy replace, actually I will add the button before handleToggleStatus button
  );
  
  profile = profile.replace(
    '<div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>',
    '<div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>\n              <button style={{ background: "#2563eb", color: "#fff", border: "none", fontWeight: "600", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }} onClick={openEditModal}>Edit Details</button>'
  );
}

// 5. Add Modal JSX
if (!profile.includes('Edit Worker Details')) {
  profile = profile.replace(
    '{/* Three Columns: Attendance, Advances, Salaries */}',
    `{/* Edit Modal */}
        {isEditModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", padding: "32px", borderRadius: "20px", width: "90%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, fontSize: "20px", color: "#0f172a" }}>Edit Worker Details</h2>
                <button onClick={() => setIsEditModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}>&times;</button>
              </div>
              <form onSubmit={handleEditSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "6px" }}>Full Name</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} value={editData.fullName} onChange={e => setEditData({...editData, fullName: e.target.value})} required />
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "6px" }}>Daily Wage (₹)</label>
                    <input type="number" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} value={editData.dailyWage} onChange={e => setEditData({...editData, dailyWage: Number(e.target.value)})} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "6px" }}>Phone Number</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} value={editData.mobileNumber} onChange={e => setEditData({...editData, mobileNumber: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "6px" }}>Address</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} value={editData.currentAddress} onChange={e => setEditData({...editData, currentAddress: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "6px" }}>Bank A/C</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} value={editData.bankAccount} onChange={e => setEditData({...editData, bankAccount: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "6px" }}>IFSC Code</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} value={editData.ifsc} onChange={e => setEditData({...editData, ifsc: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "6px" }}>PAN Number</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} value={editData.pan} onChange={e => setEditData({...editData, pan: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "6px" }}>Aadhaar Number</label>
                    <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} value={editData.aadhaar} onChange={e => setEditData({...editData, aadhaar: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ background: "#f1f5f9", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
                  <button type="submit" style={{ background: "#2563eb", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600" }} disabled={isSaving}>{isSaving ? "Saving..." : "Save Details"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Three Columns: Attendance, Advances, Salaries */}`
  );
}

fs.writeFileSync('frontend/src/pages/Workers/WorkerProfile.jsx', profile);
