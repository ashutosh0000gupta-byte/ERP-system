const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/Employees/EmployeeProfile.jsx', 'utf8');

if (!code.includes('const [isEditModalOpen, setIsEditModalOpen] = useState(false);')) {
  code = code.replace(
    'const [showPhotoModal, setShowPhotoModal] = useState(false);',
    'const [showPhotoModal, setShowPhotoModal] = useState(false);\n  const [isEditModalOpen, setIsEditModalOpen] = useState(false);\n  const [editData, setEditData] = useState({});\n  const [isUpdating, setIsUpdating] = useState(false);'
  );
  
  // Also import api and updateEmployee if updateEmployee is not imported
  if (!code.includes('updateEmployee,')) {
    code = code.replace(
      '  getEmployee,',
      '  getEmployee,\n  updateEmployee,'
    );
  }
}

// Add the handleEditSubmit function
if (!code.includes('const handleEditSubmit')) {
  const handlerCode = `
  const openEditModal = () => {
    setEditData({
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      phone: employee.personalMobile || "",
      currentAddress: employee.address || "",
      panNumber: employee.panNumber || "",
      bankAccountNumber: employee.bankAccountNumber || "",
      bankIfsc: employee.bankIfsc || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await updateEmployee(employee.id, editData);
      setEmployee(res.data || res);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile details");
    } finally {
      setIsUpdating(false);
    }
  };
`;
  code = code.replace(
    'const handleAvatarRemove = async () => {',
    handlerCode + '\n  const handleAvatarRemove = async () => {'
  );
}

// Add the "Edit Details" button next to employee name
if (!code.includes('Edit Profile</button>')) {
  code = code.replace(
    '<h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.5px" }}>',
    '<div style={{ display: "flex", gap: "12px", alignItems: "center" }}>\n<h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.5px" }}>'
  );
  
  code = code.replace(
    '{employee.lastName}</h1>',
    '{employee.lastName}</h1>\n<button onClick={openEditModal} style={{ padding: "6px 12px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Edit Profile</button>\n</div>'
  );
}

// Add the Modal itself
if (!code.includes('Edit Profile Details')) {
  const modalCode = `
        {/* Edit Profile Modal */}
        <Modal isOpen={isEditModalOpen} title="Edit Profile Details" onClose={() => setIsEditModalOpen(false)} maxWidth="500px">
          <form onSubmit={handleEditSubmit}>
            <div style={{ display: "grid", gap: "16px", padding: "16px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", color: "var(--subtext)", display: "block", marginBottom: "6px" }}>First Name</label>
                  <input required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "var(--subtext)", display: "block", marginBottom: "6px" }}>Last Name</label>
                  <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: "13px", color: "var(--subtext)", display: "block", marginBottom: "6px" }}>Phone Number</label>
                <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
              </div>
              
              <div>
                <label style={{ fontSize: "13px", color: "var(--subtext)", display: "block", marginBottom: "6px" }}>Address</label>
                <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} value={editData.currentAddress} onChange={e => setEditData({...editData, currentAddress: e.target.value})} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", color: "var(--subtext)", display: "block", marginBottom: "6px" }}>PAN Number</label>
                  <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} value={editData.panNumber} onChange={e => setEditData({...editData, panNumber: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "var(--subtext)", display: "block", marginBottom: "6px" }}>Bank Account</label>
                  <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} value={editData.bankAccountNumber} onChange={e => setEditData({...editData, bankAccountNumber: e.target.value})} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "13px", color: "var(--subtext)", display: "block", marginBottom: "6px" }}>IFSC Code</label>
                <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} value={editData.bankIfsc} onChange={e => setEditData({...editData, bankIfsc: e.target.value})} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
              <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: "10px 16px", background: "none", border: "none", color: "var(--subtext)", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={isUpdating} style={{ padding: "10px 16px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Profile Photo Modal */}
  `;
  code = code.replace('{/* Profile Photo Modal */}', modalCode);
}

fs.writeFileSync('frontend/src/pages/Employees/EmployeeProfile.jsx', code);
