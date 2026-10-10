import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { formatDate, hashStringToRange } from "../../serializers/helpers";

export interface SearchResultEntry {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  meta: string;
  avatar: string | null;
  href: string;
  keywords: string[];
}

export async function globalSearch(query: string): Promise<SearchResultEntry[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const contains = { contains: q, mode: "insensitive" } as const;

  const whereEmployee: Prisma.EmployeeWhereInput = {
    OR: [
      { firstName: contains },
      { lastName: contains },
      { employeeCode: contains },
      { personalEmail: contains },
      { designation: { title: contains } },
      { department: { name: contains } },
    ],
  };

  const whereWorker: Prisma.WorkerWhereInput = {
    OR: [
      { workerId: contains },
      { fullName: contains },
      { fatherName: contains },
      { mobileNumber: contains },
      { skillTrade: contains },
      { site: { name: contains } },
    ],
  };

  const whereSite: Prisma.SiteWhereInput = {
    OR: [
      { name: contains },
      { siteId: contains },
      { location: contains },
      { client: contains },
    ],
  };

  const [workers, sites, employees, leaveRequests, payrollRuns] = await Promise.all([
    prisma.worker.findMany({
      where: whereWorker,
      take: 10,
      include: { site: true },
      orderBy: { workerId: "asc" },
    }),
    prisma.site.findMany({
      where: whereSite,
      take: 5,
      orderBy: { name: "asc" },
    }),
    prisma.employee.findMany({
      where: whereEmployee,
      take: 10,
      include: { designation: true, department: true },
      orderBy: { employeeCode: "asc" },
    }),
    prisma.leaveRequest.findMany({
      where: {
        OR: [
          { employee: { firstName: contains } },
          { employee: { lastName: contains } },
          { employee: { employeeCode: contains } },
          { leaveType: { name: contains } },
          { status: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      include: {
        employee: { select: { employeeCode: true, firstName: true, lastName: true } },
        leaveType: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payrollRun.findMany({
      where: {
        OR: [
          { period: contains },
          { status: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
  ]);

  const entries: SearchResultEntry[] = [];

  // 1. Workers (First-class citizens in SNMR HRMS)
  for (const w of workers) {
    const siteStr = w.site?.name ? ` · ${w.site.name}` : "";
    const tradeStr = w.skillTrade || "Worker";
    entries.push({
      id: w.workerId,
      type: "Worker",
      title: `${w.fullName} (${w.workerId})`,
      subtitle: `${tradeStr}${siteStr}`,
      meta: w.status || "Active",
      avatar: w.photoUrl || null,
      href: `/workers/${w.id}`,
      keywords: [
        w.fullName.toLowerCase(),
        w.workerId.toLowerCase(),
        (w.skillTrade || "").toLowerCase(),
        (w.site?.name || "").toLowerCase(),
        (w.mobileNumber || "").toLowerCase(),
      ],
    });
  }

  // 2. Sites
  for (const s of sites) {
    entries.push({
      id: s.siteId,
      type: "Site",
      title: s.name,
      subtitle: `${s.siteId}${s.location ? ` · ${s.location}` : ""}`,
      meta: s.status || "Active",
      avatar: null,
      href: `/sites`,
      keywords: [
        s.name.toLowerCase(),
        s.siteId.toLowerCase(),
        (s.location || "").toLowerCase(),
        (s.client || "").toLowerCase(),
      ],
    });
  }

  // 3. Employees
  for (const emp of employees) {
    const name = `${emp.firstName} ${emp.lastName}`;
    const genderPath = emp.gender?.toLowerCase() === "female" ? "women" : "men";
    const avatarId = hashStringToRange(emp.employeeCode, 1, 99);

    entries.push({
      id: emp.employeeCode,
      type: "Employee",
      title: name,
      subtitle: `${emp.designation?.title ?? ""} · ${emp.department?.name ?? ""}`,
      meta: emp.personalEmail ?? "",
      avatar: `https://randomuser.me/api/portraits/${genderPath}/${avatarId}.jpg`,
      href: `/employees/${emp.employeeCode}`,
      keywords: [name.toLowerCase(), emp.employeeCode.toLowerCase(), (emp.personalEmail ?? "").toLowerCase()],
    });
  }

  // 4. Leave Requests
  for (const req of leaveRequests) {
    const employeeName = req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : "";
    entries.push({
      id: req.id,
      type: "Leave Request",
      title: `${employeeName} - ${req.leaveType?.name ?? ""}`,
      subtitle: `${formatDate(req.startDate) ?? ""} to ${formatDate(req.endDate) ?? ""}`,
      meta: req.status,
      avatar: null,
      href: "/leave",
      keywords: [employeeName.toLowerCase(), (req.leaveType?.name ?? "").toLowerCase(), req.status.toLowerCase()],
    });
  }

  // 5. Payroll Runs
  for (const run of payrollRuns) {
    const period = `${run.period}`;
    entries.push({
      id: `PR-${run.year}-${String(run.month).padStart(2, "0")}`,
      type: "Payroll Run",
      title: period,
      subtitle: `${run.totalEmployees} employees`,
      meta: run.status,
      avatar: null,
      href: "/payroll",
      keywords: [period.toLowerCase(), run.status.toLowerCase(), String(run.year)],
    });
  }

  // Relevance sort: exact workerId / title starts-with first, then general contains
  const startsWith = entries.filter((e) => e.keywords.some((k) => k.startsWith(q)));
  const containsMatches = entries.filter((e) => !startsWith.includes(e) && e.keywords.some((k) => k.includes(q)));
  return [...startsWith, ...containsMatches].slice(0, 20);
}
