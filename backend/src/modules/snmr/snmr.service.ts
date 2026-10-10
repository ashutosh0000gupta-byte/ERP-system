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
  let siteId = data.siteId;
  if (!siteId) {
    let count = await prisma.site.count();
    let candidate = `SITE-${String(count + 1).padStart(3, '0')}`;
    while (await prisma.site.findUnique({ where: { siteId: candidate } })) {
      count++;
      candidate = `SITE-${String(count + 1).padStart(3, '0')}`;
    }
    siteId = candidate;
  }

  return prisma.site.create({
    data: {
      siteId,
      name: data.name,
      location: data.location || null,
      client: data.client || null,
      status: data.status || "Active",
      ...(data.poNumber && { poNumber: data.poNumber }),
      ...(data.budget && { budget: data.budget }),
      ...(data.supervisorId && { supervisorId: data.supervisorId })
    }
  });
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

export const importWorkers = async (workers: any[]) => {
  if (!Array.isArray(workers)) {
    throw new Error("Invalid request: 'workers' array is required.");
  }

  const results: any[] = [];
  const errors: any[] = [];

  // Helper to clean and sanitize string fields
  const cleanStr = (val: any): string | null => {
    if (val === undefined || val === null) return null;
    const s = String(val).trim();
    if (!s || s.toUpperCase() === "NA" || s.toUpperCase() === "N/A" || s === "null" || s === "undefined") {
      return null;
    }
    return s;
  };

  // Cache existing sites in memory to avoid repetitive queries and race conditions
  const siteCache = new Map<string, string>();
  try {
    const allSites = await prisma.site.findMany();
    for (const s of allSites) {
      siteCache.set(s.name.trim().toLowerCase(), s.id);
    }
  } catch (err) {
    console.warn("Could not pre-fetch sites:", err);
  }

  for (let i = 0; i < workers.length; i++) {
    const w = workers[i];
    if (!w) continue;

    const workerId = cleanStr(w.workerId);
    const fullName = cleanStr(w.fullName);
    if (!workerId || !fullName) continue;

    try {
      let siteId: string | null = w.siteId || null;
      const rawSiteName = cleanStr(w.siteName);

      if (!siteId && rawSiteName && rawSiteName.toLowerCase() !== "unassigned") {
        const lowerName = rawSiteName.toLowerCase();
        if (siteCache.has(lowerName)) {
          siteId = siteCache.get(lowerName)!;
        } else {
          // Look up or create site safely
          let site = await prisma.site.findFirst({
            where: { name: { equals: rawSiteName, mode: 'insensitive' } }
          });
          if (!site) {
            const count = await prisma.site.count();
            let candidate = `SITE-${String(count + 1).padStart(3, '0')}`;
            while (await prisma.site.findUnique({ where: { siteId: candidate } })) {
              candidate = `SITE-${Math.floor(100 + Math.random() * 900)}`;
            }
            site = await prisma.site.create({
              data: {
                siteId: candidate,
                name: rawSiteName,
                location: rawSiteName,
                status: "Active"
              }
            });
          }
          siteCache.set(lowerName, site.id);
          siteId = site.id;
        }
      }

      const isStaff = /supervisor|incharge|in-charge|engineer|foreman/i.test(w.skillTrade || "");
      const category = w.category || (isStaff ? "Supervisor" : "Worker");

      // Parse joining date safely into Date object
      let joiningDate = new Date();
      if (w.joiningDate) {
        const parsed = new Date(w.joiningDate);
        if (!isNaN(parsed.getTime())) {
          joiningDate = parsed;
        }
      }

      // Parse numerical fields safely
      const rawDw = String(w.dailyWage !== undefined && w.dailyWage !== null ? w.dailyWage : 0).replace(/[^0-9.]/g, '');
      const parsedDw = parseFloat(rawDw);
      const dailyWage = isNaN(parsedDw) ? 0 : parsedDw;

      const rawWr = String(w.wageRate !== undefined && w.wageRate !== null ? w.wageRate : (w.dailyWage || 0)).replace(/[^0-9.]/g, '');
      const parsedWr = parseFloat(rawWr);
      const wageRate = isNaN(parsedWr) ? dailyWage : parsedWr;

      const rawOt = String(w.otRatePerHour !== undefined && w.otRatePerHour !== null ? w.otRatePerHour : 0).replace(/[^0-9.]/g, '');
      const parsedOt = parseFloat(rawOt);
      const otRatePerHour = isNaN(parsedOt) ? 0 : parsedOt;

      const dataToSave = {
        fullName,
        dailyWage,
        wageRate,
        salaryType: cleanStr(w.salaryType) || "Daily",
        paymentFrequency: cleanStr(w.paymentFrequency) || "Monthly",
        paymentMethod: cleanStr(w.paymentMethod) || "Bank Transfer",
        otRatePerHour,
        joiningDate,
        status: cleanStr(w.status) || "Active",
        category,
        siteId: siteId || null,
        bankAccount: cleanStr(w.bankAccount),
        bankName: cleanStr(w.bankName),
        ifsc: cleanStr(w.ifsc),
        pan: cleanStr(w.pan),
        mobileNumber: cleanStr(w.mobileNumber),
        aadhaar: cleanStr(w.aadhaar),
        skillTrade: cleanStr(w.skillTrade),
        fatherName: cleanStr(w.fatherName),
        currentAddress: cleanStr(w.currentAddress),
        permanentAddress: cleanStr(w.permanentAddress)
      };

      const workerRecord = await prisma.worker.upsert({
        where: { workerId },
        update: dataToSave,
        create: {
          workerId,
          ...dataToSave
        }
      });

      results.push(workerRecord);
    } catch (err: any) {
      console.error(`Error importing worker row ${i + 1} (${workerId}):`, err);
      errors.push({ workerId, row: i + 1, error: err.message });
    }
  }

  return {
    importedCount: results.length,
    errorCount: errors.length,
    results,
    errors
  };
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

export const getWorkerSalaries = async (params?: {
  month?: number;
  year?: number;
  periodType?: string;
  startDate?: string;
  endDate?: string;
  siteId?: string;
  status?: string;
}) => {
  const where: any = {};
  if (params?.month !== undefined && !isNaN(Number(params.month))) where.month = Number(params.month);
  if (params?.year !== undefined && !isNaN(Number(params.year))) where.year = Number(params.year);
  if (params?.periodType && params.periodType !== "all") where.periodType = params.periodType;
  if (params?.status && params.status !== "all") where.status = params.status;
  if (params?.siteId && params.siteId !== "all") {
    where.worker = { siteId: params.siteId };
  }
  if (params?.startDate && params?.endDate) {
    where.startDate = { gte: new Date(params.startDate) };
    where.endDate = { lte: new Date(params.endDate) };
  }

  return prisma.workerSalary.findMany({
    where,
    include: {
      worker: {
        select: {
          id: true,
          workerId: true,
          fullName: true,
          mobileNumber: true,
          bankAccount: true,
          bankName: true,
          ifsc: true,
          salaryType: true,
          wageRate: true,
          dailyWage: true,
          paymentFrequency: true,
          paymentMethod: true,
          paymentDay: true,
          site: { select: { id: true, name: true } }
        }
      },
      payments: {
        orderBy: { paymentDate: 'desc' }
      }
    },
    orderBy: [{ createdAt: 'desc' }]
  });
};

export const generateWorkerSalaries = async (options: {
  month?: number;
  year?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  periodType?: string; // Daily, Weekly, Biweekly, Monthly, Custom
  siteId?: string;
}) => {
  let start: Date;
  let end: Date;
  let month = options.month ? Number(options.month) : new Date().getMonth() + 1;
  let year = options.year ? Number(options.year) : new Date().getFullYear();
  let periodType = options.periodType || "Monthly";

  if (options.startDate && options.endDate) {
    start = new Date(options.startDate);
    start.setUTCHours(0, 0, 0, 0);
    end = new Date(options.endDate);
    end.setUTCHours(23, 59, 59, 999);
    month = start.getUTCMonth() + 1;
    year = start.getUTCFullYear();
    periodType = options.periodType || "Custom";
  } else if (periodType === "Daily") {
    const today = new Date();
    start = new Date(Date.UTC(year, month - 1, today.getUTCDate(), 0, 0, 0, 0));
    end = new Date(Date.UTC(year, month - 1, today.getUTCDate(), 23, 59, 59, 999));
  } else {
    // Standard Month range
    start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  }

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalDaysInPeriod = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const workerWhere: any = { status: "Active" };
  if (options.siteId && options.siteId !== "all") {
    workerWhere.siteId = options.siteId;
  }

  const workers = await prisma.worker.findMany({
    where: workerWhere
  });

  const salaries: any[] = [];

  for (const worker of workers) {
    const salaryType = worker.salaryType || "Daily";
    const baseWageRate = Number(worker.wageRate || worker.dailyWage || worker.monthlyWage || 0);

    // 1. Calculate present days and OT in the requested period
    const attendances = await prisma.workerAttendance.findMany({
      where: {
        workerId: worker.id,
        date: { gte: start, lte: end }
      }
    });

    let presentDays = 0;
    let otHoursTotal = 0;
    for (const a of attendances) {
      if (a.status === "Present") presentDays += 1;
      else if (a.status === "Half Day") presentDays += 0.5;
      otHoursTotal += Number(a.otHours || 0);
    }

    // 2. Determine rate and compute gross based on Salary Type
    let rateApplied = baseWageRate;
    let grossFromAttendance = 0;
    let otRate = Number(worker.otRatePerHour || 0);

    switch (salaryType) {
      case "Daily":
        rateApplied = baseWageRate > 0 ? baseWageRate : Number(worker.dailyWage || 0);
        grossFromAttendance = Math.round(presentDays * rateApplied * 100) / 100;
        if (otRate === 0 && rateApplied > 0) otRate = rateApplied / 8;
        break;

      case "Weekly":
        rateApplied = baseWageRate > 0 ? baseWageRate : Number(worker.dailyWage || 0) * 6;
        grossFromAttendance = Math.round((rateApplied / 6) * presentDays * 100) / 100;
        if (otRate === 0 && rateApplied > 0) otRate = rateApplied / 48;
        break;

      case "Monthly":
        rateApplied = baseWageRate > 0 ? baseWageRate : Number(worker.monthlyWage || (Number(worker.dailyWage || 0) * 26));
        const standardDays = totalDaysInPeriod >= 28 ? totalDaysInPeriod : 26;
        grossFromAttendance = Math.round((rateApplied / standardDays) * presentDays * 100) / 100;
        if (otRate === 0 && rateApplied > 0) otRate = rateApplied / 208;
        break;

      case "Hourly":
        rateApplied = baseWageRate > 0 ? baseWageRate : (Number(worker.dailyWage || 0) > 0 ? Number(worker.dailyWage) / 8 : 0);
        grossFromAttendance = Math.round(presentDays * 8 * rateApplied * 100) / 100;
        if (otRate === 0) otRate = rateApplied * 1.5;
        break;

      case "Contract":
        rateApplied = baseWageRate;
        grossFromAttendance = presentDays > 0 ? rateApplied : 0;
        break;

      default:
        rateApplied = baseWageRate > 0 ? baseWageRate : Number(worker.dailyWage || 0);
        grossFromAttendance = Math.round(presentDays * rateApplied * 100) / 100;
        if (otRate === 0 && rateApplied > 0) otRate = rateApplied / 8;
        break;
    }

    const otAmount = Math.round(otHoursTotal * otRate * 100) / 100;
    const grossAmount = Math.round((grossFromAttendance + otAmount) * 100) / 100;

    // 3. Sum up undeducted advances for this worker up to end of period
    const advances = await prisma.workerAdvance.findMany({
      where: {
        workerId: worker.id,
        isDeducted: false,
        date: { lte: end }
      }
    });

    let advanceDeducted = 0;
    for (const adv of advances) {
      advanceDeducted += Number(adv.amount);
    }

    // 4. Calculate Net Amount
    const pfDeducted = 0;
    const esicDeducted = 0;
    const otherDeductions = 0;

    let netAmount = grossAmount - advanceDeducted - pfDeducted - esicDeducted - otherDeductions;
    if (netAmount < 0) netAmount = 0;

    // Check if an existing salary record already exists for this period
    const existingSalary = await prisma.workerSalary.findFirst({
      where: {
        workerId: worker.id,
        OR: [
          {
            startDate: { equals: start },
            endDate: { equals: end }
          },
          {
            month,
            year,
            periodType
          }
        ]
      },
      include: { payments: true }
    });

    let salary;
    if (existingSalary) {
      // Preserve any payments already made
      const currentPaid = existingSalary.payments.reduce((acc, p) => acc + Number(p.amount), 0) + Number(existingSalary.paidAmount || 0);
      const balanceAmount = Math.max(0, netAmount - currentPaid);
      const status = balanceAmount <= 0 ? "Paid" : (currentPaid > 0 ? "Partial" : "Pending");

      salary = await prisma.workerSalary.update({
        where: { id: existingSalary.id },
        data: {
          totalDays: attendances.length,
          presentDays,
          dailyWage: worker.dailyWage || rateApplied,
          rateApplied,
          salaryType,
          periodType,
          startDate: start,
          endDate: end,
          otHours: otHoursTotal,
          otAmount,
          grossAmount,
          advanceDeducted,
          pfDeducted,
          esicDeducted,
          otherDeductions,
          netAmount,
          paidAmount: currentPaid,
          balanceAmount,
          status,
          paymentMode: worker.paymentMethod || "Bank Transfer"
        }
      });
    } else {
      salary = await prisma.workerSalary.create({
        data: {
          workerId: worker.id,
          month,
          year,
          startDate: start,
          endDate: end,
          periodType,
          salaryType,
          totalDays: attendances.length,
          presentDays,
          dailyWage: worker.dailyWage || rateApplied,
          rateApplied,
          otHours: otHoursTotal,
          otAmount,
          grossAmount,
          advanceDeducted,
          pfDeducted,
          esicDeducted,
          otherDeductions,
          netAmount,
          paidAmount: 0,
          balanceAmount: netAmount,
          status: "Pending",
          paymentMode: worker.paymentMethod || "Bank Transfer"
        }
      });
    }

    // 5. Mark advances as deducted (only if salary calculated and advances exist)
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

export const recordWorkerPayment = async (data: {
  salaryId?: string;
  workerId: string;
  amount: number;
  paymentMode: string;
  referenceNo?: string;
  notes?: string;
  paymentDate?: string | Date;
  recordedBy?: string;
}) => {
  const amount = Number(data.amount);
  if (!amount || amount <= 0) {
    throw new Error("Payment amount must be greater than 0");
  }

  // 1. Create WorkerPayment record
  const payment = await prisma.workerPayment.create({
    data: {
      salaryId: data.salaryId || null,
      workerId: data.workerId,
      amount,
      paymentMode: data.paymentMode || "Cash",
      referenceNo: data.referenceNo || null,
      notes: data.notes || null,
      recordedBy: data.recordedBy || "Admin",
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date()
    }
  });

  // 2. If tied to a specific salary record, update paidAmount, balanceAmount, status
  if (data.salaryId) {
    const salary = await prisma.workerSalary.findUnique({
      where: { id: data.salaryId },
      include: { payments: true }
    });

    if (salary) {
      const totalPaid = salary.payments.reduce((acc, p) => acc + Number(p.amount), 0);
      const net = Number(salary.netAmount);
      const balanceAmount = Math.max(0, net - totalPaid);
      const status = balanceAmount <= 0 ? "Paid" : (totalPaid > 0 ? "Partial" : "Pending");

      await prisma.workerSalary.update({
        where: { id: data.salaryId },
        data: {
          paidAmount: totalPaid,
          balanceAmount,
          status,
          paymentMode: data.paymentMode || salary.paymentMode,
          paidAt: balanceAmount <= 0 ? new Date() : salary.paidAt
        }
      });
    }
  }

  return payment;
};

export const payWorkerSalary = async (id: string, paymentMode?: string, recordedBy?: string) => {
  const salary = await prisma.workerSalary.findUnique({
    where: { id },
    include: { payments: true }
  });
  if (!salary) throw new Error("Salary record not found");

  const alreadyPaid = salary.payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const remaining = Math.max(0, Number(salary.netAmount) - alreadyPaid);

  if (remaining > 0) {
    await prisma.workerPayment.create({
      data: {
        salaryId: id,
        workerId: salary.workerId,
        amount: remaining,
        paymentMode: paymentMode || salary.paymentMode || "Bank Transfer",
        recordedBy: recordedBy || "Admin",
        paymentDate: new Date(),
        notes: "Full salary settlement"
      }
    });
  }

  return prisma.workerSalary.update({
    where: { id },
    data: {
      paidAmount: salary.netAmount,
      balanceAmount: 0,
      status: "Paid",
      paidAt: new Date(),
      paymentMode: paymentMode || salary.paymentMode || "Bank Transfer"
    }
  });
};

export const getWorkerLedger = async (workerId: string) => {
  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    include: {
      site: { select: { id: true, name: true } },
      advances: { orderBy: { date: 'asc' } },
      salaries: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { paymentDate: 'asc' } }
    }
  });

  if (!worker) throw new Error("Worker not found");

  const transactions: any[] = [];

  for (const adv of worker.advances) {
    transactions.push({
      id: `adv-${adv.id}`,
      date: adv.date,
      type: "ADVANCE",
      title: "Cash Advance",
      description: adv.reason || "Advance taken by worker",
      debit: Number(adv.amount),
      credit: 0,
      isDeducted: adv.isDeducted,
      refId: adv.id
    });
  }

  for (const sal of worker.salaries) {
    const periodLabel = sal.startDate && sal.endDate
      ? `${new Date(sal.startDate).toLocaleDateString('en-GB')} to ${new Date(sal.endDate).toLocaleDateString('en-GB')}`
      : `${sal.month}/${sal.year}`;

    transactions.push({
      id: `sal-${sal.id}`,
      date: sal.createdAt,
      type: "SALARY_CREDIT",
      title: `Salary Credit (${sal.periodType || "Monthly"})`,
      description: `Period: ${periodLabel} | Days: ${Number(sal.presentDays)} | Wage: ₹${Number(sal.rateApplied || sal.dailyWage)} | Adv Deducted: ₹${Number(sal.advanceDeducted)}`,
      debit: 0,
      credit: Number(sal.netAmount),
      grossAmount: Number(sal.grossAmount),
      advanceDeducted: Number(sal.advanceDeducted),
      netAmount: Number(sal.netAmount),
      paidAmount: Number(sal.paidAmount),
      balanceAmount: Number(sal.balanceAmount),
      status: sal.status,
      refId: sal.id
    });
  }

  for (const pay of worker.payments) {
    transactions.push({
      id: `pay-${pay.id}`,
      date: pay.paymentDate,
      type: "PAYMENT",
      title: `Wage Payout (${pay.paymentMode})`,
      description: `Paid via ${pay.paymentMode}${pay.referenceNo ? ` | Ref: ${pay.referenceNo}` : ""}${pay.notes ? ` | ${pay.notes}` : ""}`,
      debit: Number(pay.amount),
      credit: 0,
      paymentMode: pay.paymentMode,
      referenceNo: pay.referenceNo,
      notes: pay.notes,
      refId: pay.id
    });
  }

  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = 0;
  const ledgerEntries = transactions.map(t => {
    if (t.type === "SALARY_CREDIT") {
      runningBalance += t.credit;
    } else if (t.type === "PAYMENT") {
      runningBalance -= t.debit;
    }
    return {
      ...t,
      runningBalance: Math.round(runningBalance * 100) / 100
    };
  });

  const totalEarned = worker.salaries.reduce((sum, s) => sum + Number(s.netAmount), 0);
  const totalPaid = worker.payments.reduce((sum, p) => sum + Number(p.amount), 0) +
                    worker.salaries.filter(s => s.status === 'Paid' && worker.payments.length === 0).reduce((sum, s) => sum + Number(s.paidAmount), 0);
  const pendingSalaryBalance = worker.salaries.reduce((sum, s) => sum + Number(s.balanceAmount), 0);
  const pendingAdvances = worker.advances.filter(a => !a.isDeducted).reduce((sum, a) => sum + Number(a.amount), 0);

  return {
    worker: {
      id: worker.id,
      workerId: worker.workerId,
      fullName: worker.fullName,
      mobileNumber: worker.mobileNumber,
      category: worker.category,
      skillTrade: worker.skillTrade,
      salaryType: worker.salaryType,
      wageRate: worker.wageRate,
      dailyWage: worker.dailyWage,
      paymentFrequency: worker.paymentFrequency,
      paymentMethod: worker.paymentMethod,
      paymentDay: worker.paymentDay,
      site: worker.site
    },
    summary: {
      totalEarned,
      totalPaid,
      pendingSalaryBalance,
      pendingAdvances,
      netPayableBalance: pendingSalaryBalance
    },
    ledger: ledgerEntries
  };
};

export const importWorkerSalaries = async (month: number, year: number, updates: any[]) => {
  const results: any[] = [];
  for (const update of updates) {
    if (!update.workerId) continue;
    const worker = await prisma.worker.findUnique({ where: { workerId: update.workerId } });
    if (!worker) continue;

    const salary = await prisma.workerSalary.findFirst({
      where: {
        workerId: worker.id,
        month,
        year
      }
    });
    if (!salary) continue;

    const updated = await prisma.workerSalary.update({
      where: { id: salary.id },
      data: {
        status: update.status || "Paid",
        paidAmount: update.status === "Paid" ? salary.netAmount : salary.paidAmount,
        balanceAmount: update.status === "Paid" ? 0 : salary.balanceAmount,
        paidAt: update.status === "Paid" ? new Date() : null,
      }
    });
    results.push(updated);
  }
  return results;
};

export const notifyWorkerSalaries = async (month: number, year: number) => {
  const salaries = await getWorkerSalaries({ month, year });
  let notifiedCount = 0;
  for (const s of salaries) {
    if (s.worker?.mobileNumber) {
      console.log(`[MOCK WHATSAPP] Sent to ${s.worker.mobileNumber}: Your salary for ${month}/${year} is Rs. ${s.netAmount}`);
      notifiedCount++;
    }
  }
  return { message: `Notified ${notifiedCount} workers via SMS/WhatsApp.` };
};

export const getDashboardStats = async () => {
  const [totalWorkers, activeSites, pendingAdvances, presentToday, siteWorkers, totalSalaries, totalExpenses] = await Promise.all([
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
    }),
    prisma.workerSalary.aggregate({
      where: { status: "Paid" },
      _sum: { netAmount: true }
    }),
    prisma.siteExpense.aggregate({
      _sum: { amount: true }
    })
  ]);

  const chartData = siteWorkers.map(s => ({
    name: s.name,
    workers: s._count.workers
  })).filter(s => s.workers > 0);

  return {
    totalWorkers,
    activeSites,
    totalAdvance: pendingAdvances._sum.amount || 0,
    presentToday,
    totalSalaries: totalSalaries._sum.netAmount || 0,
    totalExpenses: totalExpenses._sum.amount || 0,
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
      salaries: {
        include: { payments: true },
        orderBy: [{ createdAt: 'desc' }]
      },
      payments: { orderBy: { paymentDate: 'desc' } }
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
  // Delete associated documents first
  await prisma.snmrDocument.deleteMany({ where: { entityId: id, entityType: "Worker" } });
  
  return prisma.worker.delete({
    where: { id }
  });
};


export const deleteDocument = async (id: string) => {
  return prisma.snmrDocument.delete({ where: { id } });
};

export const updateWorker = async (id: string, data: any) => {
  return prisma.worker.update({
    where: { id },
    data
  });
};

export const deleteSite = async (id: string) => {
  return prisma.site.delete({ where: { id } });
};

export const updateSite = async (id: string, data: any) => {
  return prisma.site.update({ where: { id }, data });
};
