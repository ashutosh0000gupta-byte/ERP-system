/// <reference types="node" />
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const secret = process.env.PII_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("PII_ENCRYPTION_KEY is not configured");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptPII(value: string): string {
  if (!value) return value;
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(".");
}

import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Permissions (mirrors frontend/src/context/AuthContext.jsx ROLE_PERMISSIONS) ──

const PERMISSIONS = [
  "dashboard:read",
  "employees:read", "employees:write", "employees:delete",
  "attendance:read", "attendance:write",
  "leave:read", "leave:write", "leave:approve",
  "payroll:read", "payroll:write", "payroll:approve",
  "recruitment:read", "recruitment:write",
  "performance:read", "performance:write",
  "reports:read", "reports:export",
  "security:read", "security:write",
  "orgmanagement:read", "orgmanagement:write",
  "compliance:read", "compliance:write",
  "onboarding:read", "onboarding:write",
  "lms:read", "lms:write",
  "assets:read", "assets:write",
  "tasks:read", "tasks:write",
  "expenses:read", "expenses:write", "expenses:approve", "expenses:manage",
  "travel:read", "travel:write", "travel:approve",
  "ess:read", "ess:write",
  "policies:read", "policies:write",
  "helpdesk:read", "helpdesk:write",
  // Separation Management
  "separation:read",
  "separation:write",

  "clearance:read",
  "clearance:write",
  "clearance:approve",

  "exitinterview:read",
  "exitinterview:write",

  "settlement:read",
  "settlement:write",
  "settlement:approve",

  "alumni:read",
  "alumni:write",

  "access:revoke",
  "workflows:read", "workflows:write", "workflows:approve",
  "notifications:read",
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    "dashboard:read",
    "employees:read", "employees:write", "employees:delete",
    "attendance:read", "attendance:write",
    "leave:read", "leave:write", "leave:approve",
    "payroll:read", "payroll:write", "payroll:approve",
    "recruitment:read", "recruitment:write",
    "performance:read", "performance:write",
    "reports:read", "reports:export",
    "security:read", "security:write",
    "orgmanagement:read", "orgmanagement:write",
    "compliance:read", "compliance:write",
    "onboarding:read", "onboarding:write",
    "lms:read", "lms:write",
    "assets:read", "assets:write",
    "tasks:read", "tasks:write",
    "expenses:read", "expenses:write", "expenses:approve", "expenses:manage",
    "travel:read", "travel:write", "travel:approve",
    "ess:read", "ess:write",
    "policies:read", "policies:write",
    "helpdesk:read", "helpdesk:write",

    // Separation
    "separation:read",
    "separation:write",
    "clearance:read",
    "clearance:write",
    "clearance:approve",
    "exitinterview:read",
    "exitinterview:write",
    "settlement:read",
    "settlement:write",
    "settlement:approve",
    "alumni:read",
    "alumni:write",
    "access:revoke",

    "workflows:read", "workflows:write", "workflows:approve",
    "notifications:read",
  ],
  HR: [
    "dashboard:read",
    "employees:read", "employees:write",
    "attendance:read", "attendance:write",
    "leave:read", "leave:write", "leave:approve",
    "payroll:read", "payroll:write", "payroll:approve",
    "recruitment:read", "recruitment:write",
    "onboarding:read", "onboarding:write",
    "performance:read", "performance:write",
    "reports:read", "reports:export",
    "compliance:read", "compliance:write",
    "policies:read", "policies:write",
    "helpdesk:read", "helpdesk:write",
    "tasks:read", "tasks:write",

    // Separation
    "separation:read",
    "separation:write",
    "clearance:read",
    "clearance:write",
    "clearance:approve",
    "exitinterview:read",
    "exitinterview:write",
    "settlement:read",
    "settlement:write",
    "settlement:approve",
    "alumni:read",
    "alumni:write",
    "access:revoke",

    "lms:read", "lms:write",
    "assets:read", "assets:write",

    "expenses:read", "expenses:write", "expenses:approve", "expenses:manage",
    "travel:read", "travel:write",
    "ess:read", "ess:write",

    "workflows:read", "workflows:write", "workflows:approve",
    "notifications:read",
  ],
  MANAGER: [
    "dashboard:read",
    "employees:read",
    "attendance:read", "attendance:write",
    "leave:read", "leave:write", "leave:approve",
    "payroll:read",
    "performance:read", "performance:write",
    "tasks:read", "tasks:write",
    "reports:read",
    "expenses:read", "expenses:write", "expenses:approve",
    "travel:read", "travel:write", "travel:approve",
    "recruitment:read",
    "lms:read", "lms:write",
    "assets:read", "assets:write",
    "helpdesk:read", "helpdesk:write",
    "policies:read",
    "ess:read", "ess:write",
    "separation:read",
    "separation:write",

    "clearance:read",
    "clearance:write",

    "exitinterview:read",
    "exitinterview:write",

    "settlement:read",
    "settlement:write",

    "alumni:read",
    "alumni:write",
    "notifications:read",
  ],
  FINANCE: [
    "dashboard:read",
    "employees:read",
    "expenses:read", "expenses:write", "expenses:approve", "expenses:manage",
    "travel:read", "travel:write", "travel:approve",
    "reports:read",
    "notifications:read",
  ],
  EMPLOYEE: [
    "dashboard:read",
    "attendance:read", "attendance:write",
    "leave:read", "leave:write",
    "payroll:read",
    "ess:read", "ess:write",
    "helpdesk:read", "helpdesk:write",
    "policies:read",
    "performance:read", "performance:write",
    "lms:read", "lms:write",
    "assets:read", "assets:write",
    "tasks:read", "tasks:write",
    "expenses:read", "expenses:write",
    "travel:read", "travel:write",
    "separation:read",
    "separation:write",

    "clearance:read",

    "exitinterview:read",
    "exitinterview:write",

    "settlement:read",

    "alumni:read",

    "workflows:read", "workflows:approve",
    "notifications:read",
  ],
};

// ── Organization master data (mirrors mock/employees.js) ──

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Analytics",
  "Human Resources", "Finance", "Marketing", "Executive",
];

const LOCATIONS = [
  { name: "Bengaluru", address: "Embassy TechVillage, Outer Ring Road, Bengaluru, Karnataka" },
  { name: "Hyderabad", address: "Mindspace Cyberabad, Madhapur, Hyderabad, Telangana" },
  { name: "Pune", address: "Cybercity Magarpatta, Hadapsar, Pune, Maharashtra" },
  { name: "Delhi NCR", address: "DLF Cyber City, Sector 24, Gurugram, Haryana" },
  { name: "Mumbai", address: "Bandra Kurla Complex (BKC), Mumbai, Maharashtra" },
  { name: "Chennai", address: "Tidel Park, Rajiv Gandhi Salai, Taramani, Chennai, Tamil Nadu" },
  { name: "New York", address: "Bengaluru HQ Annex" },
  { name: "Delhi", address: "DLF Cyber City, Sector 24, Gurugram, Haryana" },
  { name: "Austin", address: "Pune Campus" },
  { name: "Seattle", address: "Hyderabad Campus" },
  { name: "Chicago", address: "Pune Annex" },
  { name: "Boston", address: "Bengaluru Innovation Lab" },
  { name: "Miami", address: "Mumbai Gateway Office" },
  { name: "London", address: "London Overseas Client Desk" },
  { name: "Remote", address: null },
];

const DESIGNATIONS = [
  "Senior Software Engineer", "Product Manager", "UX Designer", "DevOps Engineer",
  "Engineering Manager", "Data Analyst", "VP of Product", "HR Specialist",
  "Head of Analytics", "CEO", "HR Manager", "Backend Engineer",
  "Marketing Manager", "Frontend Engineer", "Finance Analyst",
];

interface EmployeeSeed {
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  location: string;
  employmentType: string;
  status: string;
  joinDate: string;
  salary: number;
  managerId: string | null;
  gender: string;
  dob: string;
  role: string;
  isDepartmentHead: boolean;
}

const EMPLOYEES: EmployeeSeed[] = [
  { code: "EMP001", firstName: "Sonu", lastName: "Gupta", email: "sonu@snmrfab.in", phone: "+91-9555260161", designation: "CEO", department: "Executive", location: "Bengaluru", employmentType: "Full-Time", status: "Active", joinDate: "2020-01-01", salary: 2400000, managerId: null, gender: "Male", dob: "1985-01-01", role: "ADMIN", isDepartmentHead: true },
  { code: "EMP002", firstName: "Bivek", lastName: "Kumar", email: "bivek@snmrfab.in", phone: "+91-7718783005", designation: "HR Manager", department: "Human Resources", location: "Bengaluru", employmentType: "Full-Time", status: "Active", joinDate: "2021-01-01", salary: 1200000, managerId: "EMP001", gender: "Male", dob: "1990-01-01", role: "HR", isDepartmentHead: true },
];

const LEAVE_TYPES = [
  { code: "LT01", name: "Earned Leave", maxDays: 18, carryForward: true },
  { code: "LT02", name: "Sick Leave", maxDays: 12, carryForward: false },
  { code: "LT03", name: "Casual Leave", maxDays: 6, carryForward: false },
  { code: "LT04", name: "Compensatory Off", maxDays: 10, carryForward: false },
  { code: "LT05", name: "Maternity Leave", maxDays: 180, carryForward: false },
  { code: "LT06", name: "Paternity Leave", maxDays: 15, carryForward: false },
];

async function main() {
  console.log("🌱 Seeding database…");

  // Wipe in FK-safe order
  await prisma.workerAttendance.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.site.deleteMany();
  await prisma.onboardingChecklistItem.deleteMany();
  await prisma.onboarding.deleteMany();
  await prisma.candidateDocument.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.interviewScorecard.deleteMany();
  await prisma.interviewPanel.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.jobRequisition.deleteMany();
  await prisma.courseCertificate.deleteMany();
  await prisma.courseContentProgress.deleteMany();
  await prisma.courseQuizAttemptAnswer.deleteMany();
  await prisma.courseQuizAttempt.deleteMany();
  await prisma.courseQuizOption.deleteMany();
  await prisma.courseQuizQuestion.deleteMany();
  await prisma.courseContent.deleteMany();
  await prisma.courseEnrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.policyVersion.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.helpdeskComment.deleteMany();
  await prisma.helpdeskTicket.deleteMany();
  await prisma.assetHistory.deleteMany();
  await prisma.assetRequest.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.taskTimeEntry.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.taskHistory.deleteMany();
  await prisma.task.deleteMany();
  await prisma.taskMilestone.deleteMany();
  await prisma.taskProjectMember.deleteMany();
  await prisma.taskProject.deleteMany();
  await prisma.separationSettlement.deleteMany();
  await prisma.separationClearance.deleteMany();
  await prisma.exitInterview.deleteMany();
  await prisma.alumni.deleteMany();
  await prisma.separation.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.workflowEvent.deleteMany();
  await prisma.workflowInstanceStep.deleteMany();
  await prisma.workflowInstance.deleteMany();
  await prisma.workflowDefinitionStep.deleteMany();
  await prisma.workflowDefinition.deleteMany();
  await prisma.performanceReviewItem.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.performanceKeyResult.deleteMany();
  await prisma.performanceGoal.deleteMany();
  await prisma.performanceFeedback.deleteMany();
  await prisma.performanceOneOnOneAgenda.deleteMany();
  await prisma.performanceOneOnOneAction.deleteMany();
  await prisma.performanceOneOnOne.deleteMany();
  await prisma.performanceRatingHistory.deleteMany();
  await prisma.performanceReviewCycle.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.payrollRun.deleteMany();
  await prisma.salaryStructure.deleteMany();
  await prisma.attendancePunch.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.leaveType.deleteMany();
  await prisma.expenseClaim.deleteMany();
  await prisma.travelRequest.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.attendanceShift.deleteMany();
  await prisma.designation.deleteMany();
  await prisma.location.deleteMany();
  await prisma.department.deleteMany();
  await prisma.businessUnit.deleteMany();
  await prisma.company.deleteMany();

  // Company
  const company = await prisma.company.create({
    data: { name: "SNMR FAB INDIA PRIVATE LIMITED", registrationNumber: "SNMR12345", country: "India", currency: "INR" },
  });

  // Business Unit
  const bu = await prisma.businessUnit.create({
    data: { companyId: company.id, name: "Core Business" },
  });

  // Departments / Locations / Designations
  const deptByName = new Map<string, string>();
  for (const name of DEPARTMENTS) {
    const d = await prisma.department.create({ data: { companyId: company.id, businessUnitId: bu.id, name } });
    deptByName.set(name, d.id);
  }

  const locByName = new Map<string, string>();
  for (const l of LOCATIONS) {
    const loc = await prisma.location.create({ data: { companyId: company.id, name: l.name, address: l.address } });
    locByName.set(l.name, loc.id);
  }

  const desigByTitle = new Map<string, string>();
  for (const title of DESIGNATIONS) {
    const d = await prisma.designation.create({ data: { title, grade: title === "CEO" ? "L1" : "L2" } });
    desigByTitle.set(title, d.id);
  }

  // Roles + Permissions
  const roles: Record<string, string> = {};
  for (const name of ["ADMIN", "HR", "MANAGER", "FINANCE", "EMPLOYEE"]) {
    const role = await prisma.role.create({ data: { name, description: `${name} role` } });
    roles[name] = role.id;
  }

  const permByCode = new Map<string, string>();
  for (const code of PERMISSIONS) {
    const p = await prisma.permission.create({ data: { code, description: code } });
    permByCode.set(code, p.id);
  }

  for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
    for (const code of perms) {
      const permId = permByCode.get(code);
      if (permId) {
        await prisma.rolePermission.create({ data: { roleId: roles[roleName], permissionId: permId } });
      }
    }
  }

  // Leave types
  const leaveTypeByCode = new Map<string, string>();
  for (const lt of LEAVE_TYPES) {
    const t = await prisma.leaveType.create({
      data: { name: lt.name, code: lt.code, defaultAnnualDays: lt.maxDays, carryForward: lt.carryForward },
    });
    leaveTypeByCode.set(lt.code, t.id);
  }

  // Attendance shift
  const shift = await prisma.attendanceShift.create({
    data: { name: "General Shift", startTime: new Date("1970-01-01T09:00:00"), endTime: new Date("1970-01-01T18:00:00") },
  });
  void shift;

  // Users + Employees
  const empByCode = new Map<string, string>(); // code -> employee PK
  const passwordHash = await bcrypt.hash("Password@123", 12);

  for (const e of EMPLOYEES) {
    const user = await prisma.user.create({
      data: { email: e.email.toLowerCase(), passwordHash, roleId: roles[e.role] },
    });
    const emp = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeCode: e.code,
        firstName: e.firstName,
        lastName: e.lastName,
        dateOfBirth: new Date(`${e.dob}T00:00:00Z`),
        gender: e.gender,
        personalEmail: e.email.toLowerCase(),
        personalMobile: e.phone,
        address: `${e.location}, ${e.department}`,
        departmentId: deptByName.get(e.department),
        designationId: desigByTitle.get(e.designation),
        locationId: locByName.get(e.location),
        dateOfJoining: new Date(`${e.joinDate}T00:00:00Z`),
        employmentType: e.employmentType,
        status: e.status,
        isDepartmentHead: e.isDepartmentHead,
      },
    });
    empByCode.set(e.code, emp.id);

  }

  // Assign managers (self-referencing FK)
  for (const e of EMPLOYEES) {
    if (e.managerId) {
      const managerId = empByCode.get(e.managerId);
      if (managerId) {
        await prisma.employee.update({
          where: { id: empByCode.get(e.code)! },
          data: { reportingManagerId: managerId },
        });
      }
    }
  }

  console.log("Seed completed for SNMR FAB INDIA PVT LTD.");
  console.log("Login credentials (Password@123): sonu@snmrfab.in, bivek@snmrfab.in");
}

main()
  .catch((e) => {
    console.error("? Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
