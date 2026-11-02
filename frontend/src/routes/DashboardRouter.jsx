import { useAuth } from "../context/AuthContext";
import EmployeeDashboard from "../pages/Dashboard/EmployeeDashboard";
import HRDashboard from "../pages/Dashboard/HRDashboard";
import ManagerDashboard from "../pages/Dashboard/ManagerDashboard";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import MobileApp from "../pages/Mobile/MobileApp";
import { useAppMode } from "../hooks/useAppMode";

/**
 * Picks which view to render:
 * 1. If running inside native Android APK or on mobile device (App Mode),
 *    renders the dedicated MobileApp interface directly.
 * 2. On desktop view, renders role-based dashboard (Manager, HR, Admin, Employee).
 */
export default function DashboardRouter() {
  const { user, role } = useAuth();
  const { isAppMode } = useAppMode();

  // Android APK or Mobile Device -> Instant Mobile App Experience!
  if (isAppMode) {
    return <MobileApp />;
  }

  switch (role?.toUpperCase()) {
    case "MANAGER":
      return <ManagerDashboard user={user} />;
    case "HR":
      return <HRDashboard user={user} />;
    case "ADMIN":
      return <AdminDashboard user={user} />;
    case "EMPLOYEE":
    default:
      return <EmployeeDashboard user={user} />;
  }
}