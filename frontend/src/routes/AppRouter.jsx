/**
 * AppRouter — All 23 HRMS module routes with React Router v7.
 * All module pages are lazily loaded for performance.
 * The layout route (MainLayout) wraps all authenticated pages.
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Spinner from "../components/shared/Spinner";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import RequireAuth from "../components/auth/RequireAuth";
import DashboardRouter from "./DashboardRouter";

// ── Eagerly loaded (critical path) ─────────────────────────────────────────
import Login from "../pages/Auth/Login";
import ChangePassword from "../pages/Auth/ChangePassword";
import UserManual from "../pages/Manual/UserManual";
import ComingSoon from "../pages/Shared/ComingSoon";

// ── Lazily loaded modules ────────────────────────────────────────────────────
const Employees = lazy(() => import("../pages/Employees/Employees"));
const EmployeeProfile = lazy(() => import("../pages/Employees/EmployeeProfile"));
const Workers = lazy(() => import("../pages/Workers/Workers"));
const Sites = lazy(() => import("../pages/Sites/Sites"));
const WorkerAttendance = lazy(() => import("../pages/Attendance/WorkerAttendance"));
const Advances = lazy(() => import("../pages/Advances/Advances"));
const Salary = lazy(() => import("../pages/Salary/Salary"));
const SiteExpenses = lazy(() => import("../pages/Expenses/SiteExpenses"));
const WorkerProfile = lazy(() => import("../pages/Workers/WorkerProfile"));
const Attendance = lazy(() => import("../pages/Attendance/Attendance"));
const Leave = lazy(() => import("../pages/Leave/Leave"));
const Payroll = lazy(() => import("../pages/Payroll/Payroll"));
const Recruitment         = lazy(() => import("../pages/Recruitment/Recruitment"));
const Onboarding          = lazy(() => import("../pages/Onboarding/Onboarding"));
const Performance         = lazy(() => import("../pages/Performance/Performance"));
const LMS                 = lazy(() => import("../pages/LMS/LMS"));
const CertificateVerificationPage = lazy(
  () => import("../pages/LMS/CertificateVerificationPage")
);
const Assets              = lazy(() => import("../pages/Assets/Assets"));
const Tasks               = lazy(() => import("../pages/Tasks/Tasks"));
const Expenses            = lazy(() => import("../pages/Expenses/Expenses"));
const Travel              = lazy(() => import("../pages/Travel/Travel"));
const ESS                 = lazy(() => import("../pages/ESS/ESS"));
const Helpdesk            = lazy(() => import("../pages/Helpdesk/Helpdesk"));
const Policies            = lazy(() => import("../pages/Policies/Policies"));
const Separation          = lazy(() => import("../pages/Separation/Separation"));
const OrgManagement       = lazy(() => import("../pages/OrgManagement/OrgManagement"));
const WorkflowEngine      = lazy(() => import("../pages/WorkflowEngine/WorkflowEngine"));
const Reports             = lazy(() => import("../pages/Reports/Reports"));
const Notifications       = lazy(() => import("../pages/Notifications/Notifications"));
const Compliance          = lazy(() => import("../pages/Compliance/Compliance"));
const SecurityAdmin       = lazy(() => import("../pages/SecurityAdmin/SecurityAdmin"));
const CandidatePortal     = lazy(() => import("../pages/CandidatePortal/CandidatePortal"));


function Loading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--background)" }}>
      <Spinner size={32} />
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
          <Route path="/careers" element={<CandidatePortal />} />
          <Route path="/candidate/offer/:token" element={<CandidatePortal />} />

          <Route
            path="/certificates/verify/:token"
            element={<CertificateVerificationPage />}
          />


          {/* Authenticated — dashboard chosen by the logged-in user's real role */}
          <Route path="/" element={<RequireAuth><DashboardRouter /></RequireAuth>} />

          {/* Core HR */}
          <Route path="/workers" element={<RequireAuth><Workers /></RequireAuth>} />
          <Route path="/workers/:id" element={<RequireAuth><WorkerProfile /></RequireAuth>} />
          <Route path="/sites" element={<RequireAuth><Sites /></RequireAuth>} />
          <Route path="/worker-attendance" element={<RequireAuth><WorkerAttendance /></RequireAuth>} />
          <Route path="/salary" element={<RequireAuth><Salary /></RequireAuth>} />
          <Route path="/advances" element={<RequireAuth><Advances /></RequireAuth>} />
          <Route path="/site-expenses" element={<RequireAuth><SiteExpenses /></RequireAuth>} />
          <Route path="/help" element={<RequireAuth><UserManual /></RequireAuth>} />
          <Route path="/employees" element={<RequireAuth><Employees /></RequireAuth>} />
          <Route path="/employees/:id" element={<RequireAuth><EmployeeProfile /></RequireAuth>} />
          <Route path="/attendance" element={<RequireAuth><Attendance /></RequireAuth>} />
          <Route path="/leave" element={<RequireAuth><Leave /></RequireAuth>} />
          <Route path="/payroll" element={<RequireAuth><Payroll /></RequireAuth>} />
          <Route path="/performance" element={<RequireAuth><Performance /></RequireAuth>} />
          
          {/* Missing Sidebar Sections mapped to Coming Soon */}
          <Route path="/reports" element={<RequireAuth><ComingSoon title="Reports & Analytics" /></RequireAuth>} />
          <Route path="/documents" element={<RequireAuth><ComingSoon title="Document Management" /></RequireAuth>} />
          <Route path="/users" element={<RequireAuth><ComingSoon title="Users & Roles" /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><ComingSoon title="System Settings" /></RequireAuth>} />

          {/* Talent */}
          <Route path="/recruitment" element={<RequireAuth permission="recruitment:read"><Recruitment /></RequireAuth>} />
          <Route path="/onboarding"  element={<RequireAuth permission="onboarding:read"><Onboarding /></RequireAuth>} />
          <Route path="/lms"         element={<RequireAuth permission="lms:read"><LMS /></RequireAuth>} />

          {/* Operations */}
          <Route path="/assets"   element={<RequireAuth permission="assets:read"><Assets /></RequireAuth>} />
          <Route path="/tasks"    element={<RequireAuth permission="tasks:read"><Tasks /></RequireAuth>} />
          <Route path="/expenses" element={<RequireAuth permission="expenses:read"><Expenses /></RequireAuth>} />
          <Route path="/travel"   element={<RequireAuth permission="travel:read"><Travel /></RequireAuth>} />

          {/* Employee */}
          <Route path="/ess"      element={<RequireAuth permission="ess:read"><ESS /></RequireAuth>} />
          <Route path="/helpdesk" element={<RequireAuth permission="helpdesk:read"><Helpdesk /></RequireAuth>} />
          <Route path="/policies" element={<RequireAuth permission="policies:read"><Policies /></RequireAuth>} />

          {/* Admin / Governance */}
          <Route path="/separation"     element={<RequireAuth permission="separation:read"><Separation /></RequireAuth>} />
          <Route path="/org-management" element={<RequireAuth permission="orgmanagement:read"><OrgManagement /></RequireAuth>} />
          <Route path="/workflows"      element={<RequireAuth permission="workflows:read"><WorkflowEngine /></RequireAuth>} />
          <Route path="/reports"        element={<RequireAuth permission="reports:read"><Reports /></RequireAuth>} />
          <Route path="/notifications"  element={<RequireAuth permission="notifications:read"><Notifications /></RequireAuth>} />
          <Route path="/compliance"     element={<RequireAuth permission="compliance:read"><Compliance /></RequireAuth>} />
          <Route path="/security"       element={<RequireAuth permission="security:read"><SecurityAdmin /></RequireAuth>} />

          {/* Fallback — redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  </BrowserRouter>
);
}
