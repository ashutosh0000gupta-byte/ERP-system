const fs = require('fs');

// 1. Update snmr.service.ts
let service = fs.readFileSync('backend/src/modules/snmr/snmr.service.ts', 'utf8');
if (!service.includes('export const updateWorker =')) {
  service += `\nexport const updateWorker = async (id: string, data: any) => {\n  return prisma.worker.update({\n    where: { id },\n    data\n  });\n};\n`;
  fs.writeFileSync('backend/src/modules/snmr/snmr.service.ts', service);
}

// 2. Update snmr.controller.ts
let controller = fs.readFileSync('backend/src/modules/snmr/snmr.controller.ts', 'utf8');
if (!controller.includes('export const updateWorker =')) {
  controller += `\nexport const updateWorker = async (req: Request, res: Response) => {\n  try {\n    const worker = await snmrService.updateWorker(req.params.id, req.body);\n    res.json(worker);\n  } catch (err: any) {\n    res.status(500).json({ error: err.message });\n  }\n};\n`;
  fs.writeFileSync('backend/src/modules/snmr/snmr.controller.ts', controller);
}

// 3. Update snmr.routes.ts
let routes = fs.readFileSync('backend/src/modules/snmr/snmr.routes.ts', 'utf8');
if (!routes.includes('updateWorker,')) {
  routes = routes.replace('updateWorkerStatus,', 'updateWorkerStatus,\n  updateWorker,');
}
if (!routes.includes('router.put("/workers/:id"')) {
  routes = routes.replace('router.put("/workers/:id/status", updateWorkerStatus);', 'router.put("/workers/:id/status", updateWorkerStatus);\nrouter.put("/workers/:id", updateWorker);');
}
fs.writeFileSync('backend/src/modules/snmr/snmr.routes.ts', routes);
