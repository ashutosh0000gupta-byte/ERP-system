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
      worker: { select: { workerId: true, fullName: true, site: { select: { name: true } } } }
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

    // 1. Calculate present days
    const attendances = await prisma.workerAttendance.findMany({
      where: {
        workerId: worker.id,
        date: { gte: startDate, lte: endDate }
      }
    });

    let presentDays = 0;
    for (const a of attendances) {
      if (a.status === "Present") presentDays += 1;
      else if (a.status === "Half Day") presentDays += 0.5;
    }

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

    // 3. Calculate salary
    const grossAmount = presentDays * Number(worker.dailyWage);
    let netAmount = grossAmount - advanceDeducted;
    if (netAmount < 0) netAmount = 0; // Prevent negative salary, though technically advance carried over

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
        grossAmount,
        advanceDeducted,
        netAmount
      },
      create: {
        workerId: worker.id,
        month,
        year,
        totalDays: attendances.length,
        presentDays,
        dailyWage: worker.dailyWage,
        grossAmount,
        advanceDeducted,
        netAmount
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
  const [totalWorkers, activeSites, pendingAdvances, presentToday] = await Promise.all([
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
    })
  ]);

  return {
    totalWorkers,
    activeSites,
    totalAdvance: pendingAdvances._sum.amount || 0,
    presentToday
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
