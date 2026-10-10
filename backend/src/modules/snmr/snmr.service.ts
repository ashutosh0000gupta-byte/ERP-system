import { prisma } from "../../lib/prisma";

export const getSites = async () => {
  return prisma.site.findMany({
    include: {
      supervisor: {
        select: { firstName: true, lastName: true }
      }
    }
  });
};

export const createSite = async (data: any) => {
  return prisma.site.create({ data });
};

export const getWorkers = async (siteId?: string) => {
  const where = siteId ? { siteId } : {};
  return prisma.worker.findMany({
    where,
    include: {
      site: {
        select: { name: true }
      }
    }
  });
};

export const createWorker = async (data: any) => {
  return prisma.worker.create({ data });
};

export const getWorkerAttendance = async (siteId: string, date: string) => {
  if (!siteId || !date) return [];
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  return prisma.workerAttendance.findMany({
    where: {
      siteId,
      date: startOfDay
    },
    include: {
      worker: {
        select: { workerId: true, fullName: true, skillTrade: true, dailyWage: true }
      }
    }
  });
};

export const markWorkerAttendance = async (
  workerId: string,
  siteId: string,
  date: Date,
  status: string,
  otHours: number,
  remarks?: string
) => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  return prisma.workerAttendance.upsert({
    where: {
      workerId_date: {
        workerId,
        date: startOfDay
      }
    },
    update: {
      status,
      otHours,
      remarks,
      siteId
    },
    create: {
      workerId,
      siteId,
      date: startOfDay,
      status,
      otHours,
      remarks
    }
  });
};

export const getWorkerAdvances = async (siteId?: string) => {
  const where = siteId ? { siteId } : {};
  return prisma.workerAdvance.findMany({
    where,
    include: {
      worker: { select: { workerId: true, fullName: true, dailyWage: true } },
      site: { select: { name: true } }
    },
    orderBy: { date: 'desc' }
  });
};

export const createWorkerAdvance = async (data: any) => {
  if (data.date) {
    const d = new Date(data.date);
    d.setUTCHours(0,0,0,0);
    data.date = d;
  }
  return prisma.workerAdvance.create({
    data,
    include: { worker: true }
  });
};

export const getWorkerSalaries = async (month?: number, year?: number) => {
  const where: any = {};
  if (month !== undefined) where.month = month;
  if (year !== undefined) where.year = year;

  return prisma.workerSalary.findMany({
    where,
    include: {
      worker: { select: { workerId: true, fullName: true, mobileNumber: true, bankAccount: true, ifsc: true, site: { select: { name: true } } } }
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  });
};

export const generateWorkerSalaries = async (month: number, year: number) => {
  // First day of month
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  // Last day of month
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const workers = await prisma.worker.findMany({
    where: { status: "Active" }
  });

  const salaries: any[] = [];

  for (const worker of workers) {
    if (!worker.dailyWage) continue;

    // 1. Calculate present days and OT
    const attendances = await prisma.workerAttendance.findMany({
      where: {
        workerId: worker.id,
        date: { gte: startDate, lte: endDate }
      }
    });

    let presentDays = 0;
    let otHoursTotal = 0;
    for (const a of attendances) {
      if (a.status === "Present") presentDays += 1;
      else if (a.status === "Half Day") presentDays += 0.5;
      otHoursTotal += Number(a.otHours || 0);
    }

    // Calculate OT rate dynamically from daily wage if not explicitly set (assuming 8 hrs/day)
    let otRate = Number(worker.otRatePerHour || 0);
    if (otRate === 0 && worker.dailyWage) {
      otRate = Number(worker.dailyWage) / 8;
    }
    const otAmount = Math.round(otHoursTotal * otRate * 100) / 100;

    // 2. Sum up undeducted advances for this worker
    const advances = await prisma.workerAdvance.findMany({
      where: {
        workerId: worker.id,
        isDeducted: false
      }
    });

    let advanceDeducted = 0;
    for (const adv of advances) {
      advanceDeducted += Number(adv.amount);
    }

    // 3. Calculate salary and deductions
    const pfDeducted = 0; // Configurable statutory deduction
    const esicDeducted = 0;

    const grossAmount = (presentDays * Number(worker.dailyWage)) + otAmount;
    let netAmount = grossAmount - advanceDeducted - pfDeducted - esicDeducted;
    if (netAmount < 0) netAmount = 0; // Prevent negative salary

    // 4. Create or update Salary record
    const salary = await prisma.workerSalary.upsert({
      where: {
        workerId_month_year: {
          workerId: worker.id,
          month,
          year
        }
      },
      update: {
        totalDays: attendances.length,
        presentDays,
        dailyWage: worker.dailyWage,
        otHours: otHoursTotal,
        otAmount,
        grossAmount,
        advanceDeducted,
        pfDeducted,
        esicDeducted,
        netAmount,
        paymentMode: "Bank Transfer"
      },
      create: {
        workerId: worker.id,
        month,
        year,
        totalDays: attendances.length,
        presentDays,
        dailyWage: worker.dailyWage,
        otHours: otHoursTotal,
        otAmount,
        grossAmount,
        advanceDeducted,
        pfDeducted,
        esicDeducted,
        netAmount,
        paymentMode: "Bank Transfer"
      }
    });

    // 5. Mark advances as deducted (only if salary generated successfully)
    if (advances.length > 0) {
      await prisma.workerAdvance.updateMany({
        where: { id: { in: advances.map(a => a.id) } },
        data: { isDeducted: true, deductedAt: new Date() }
      });
    }

    salaries.push(salary);
  }

  return salaries;
};

export const importWorkerSalaries = async (month: number, year: number, updates: any[]) => {
  const results: any[] = [];
  for (const update of updates) {
    if (!update.workerId) continue;
    const worker = await prisma.worker.findUnique({ where: { workerId: update.workerId } });
    if (!worker) continue;

    const salary = await prisma.workerSalary.update({
      where: {
        workerId_month_year: {
          workerId: worker.id,
          month,
          year
        }
      },
      data: {
        status: update.status || "Paid",
        paidAt: update.status === "Paid" ? new Date() : null,
      }
    });
    results.push(salary);
  }
  return results;
};

export const notifyWorkerSalaries = async (month: number, year: number) => {
  // Mock SMS/WhatsApp notification logic
  const salaries = await getWorkerSalaries(month, year);
  let notifiedCount = 0;
  for (const s of salaries) {
    if (s.worker?.mobileNumber) {
      console.log(`[MOCK WHATSAPP] Sent to ${s.worker.mobileNumber}: Your salary for ${month}/${year} is Rs. ${s.netAmount}`);
      notifiedCount++;
    }
  }
  return { message: `Notified ${notifiedCount} workers via SMS/WhatsApp.` };
};

export const payWorkerSalary = async (id: string) => {
  return prisma.workerSalary.update({
    where: { id },
    data: {
      status: "Paid",
      paidAt: new Date()
    }
  });
};

export const getDashboardStats = async () => {
  const [totalWorkers, activeSites, pendingAdvances, presentToday, siteWorkers] = await Promise.all([
    prisma.worker.count({ where: { status: "Active" } }),
    prisma.site.count({ where: { status: "Active" } }),
    prisma.workerAdvance.aggregate({
      where: { isDeducted: false },
      _sum: { amount: true }
    }),
    prisma.workerAttendance.count({
      where: {
        date: { gte: new Date(new Date().setUTCHours(0,0,0,0)) },
        status: "Present"
      }
    }),
    prisma.site.findMany({
      include: { _count: { select: { workers: true } } }
    })
  ]);

  const chartData = siteWorkers.map(s => ({
    name: s.name,
    workers: s._count.workers
  }));

  return {
    totalWorkers,
    activeSites,
    totalAdvance: pendingAdvances._sum.amount || 0,
    presentToday,
    chartData
  };
};

export const getWorkerById = async (id: string) => {
  return prisma.worker.findUnique({
    where: { id },
    include: {
      site: true,
      attendances: { orderBy: { date: 'desc' }, take: 30 },
      advances: { orderBy: { date: 'desc' } },
      salaries: { orderBy: [{ year: 'desc' }, { month: 'desc' }] }
    }
  });
};

export const getSiteExpenses = async (siteId?: string) => {
  const where = siteId ? { siteId } : {};
  return prisma.siteExpense.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { site: true }
  });
};

export const createSiteExpense = async (data: any) => {
  return prisma.siteExpense.create({
    data: {
      siteId: data.siteId,
      date: new Date(data.date),
      category: data.category,
      amount: data.amount,
      description: data.description,
      recordedBy: data.recordedBy,
    },
    include: { site: true }
  });
};

export const getDocuments = async (entityType?: string, entityId?: string) => {
  const where: any = {};
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  return prisma.snmrDocument.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
};

export const uploadDocument = async (data: any) => {
  return prisma.snmrDocument.create({
    data: {
      title: data.title,
      type: data.type,
      url: data.url,
      entityType: data.entityType,
      entityId: data.entityId,
      uploadedBy: data.uploadedBy
    }
  });
};

export const getSystemUsers = async () => {
  return prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: 'desc' }
  });
};

export const createSystemUser = async (data: any) => {
  const role = await prisma.role.findFirst({ where: { name: data.roleName || 'SUPERVISOR' } });
  if (!role) throw new Error('Role not found');
  
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash || 'placeholder_hash', // In a real scenario, use bcrypt
      roleId: role.id
    },
    include: { role: true }
  });
};


export const updateWorkerStatus = async (id: string, status: string, exitReason?: string) => {
  return prisma.worker.update({
    where: { id },
    data: {
      status,
      exitDate: status === 'Inactive' ? new Date() : null,
      exitReason: status === 'Inactive' ? exitReason : null
    }
  });
};


export const deleteWorker = async (id: string) => {
  return prisma.worker.delete({
    where: { id }
  });
};

