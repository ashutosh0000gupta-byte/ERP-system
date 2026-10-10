const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/snmr/snmr.service.ts', 'utf8');

const replacement = `export const getDashboardStats = async () => {
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
};`;

code = code.replace(/export const getDashboardStats = async \(\) => \{[\s\S]*?return \{[\s\S]*?\};\n\};/, replacement);

fs.writeFileSync('backend/src/modules/snmr/snmr.service.ts', code);
