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
