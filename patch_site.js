const fs = require('fs');

// 1. Service
let service = fs.readFileSync('backend/src/modules/snmr/snmr.service.ts', 'utf8');
if (!service.includes('export const deleteSite =')) {
  service += `\nexport const deleteSite = async (id: string) => {\n  return prisma.site.delete({ where: { id } });\n};\n`;
  fs.writeFileSync('backend/src/modules/snmr/snmr.service.ts', service);
}

// 2. Controller
let controller = fs.readFileSync('backend/src/modules/snmr/snmr.controller.ts', 'utf8');
if (!controller.includes('export const deleteSite =')) {
  controller += `\nexport const deleteSite = async (req: Request, res: Response) => {\n  try {\n    await snmrService.deleteSite(req.params.id);\n    res.json({ message: "Site deleted" });\n  } catch (err: any) {\n    res.status(500).json({ error: err.message });\n  }\n};\n`;
  fs.writeFileSync('backend/src/modules/snmr/snmr.controller.ts', controller);
}

// 3. Routes
let routes = fs.readFileSync('backend/src/modules/snmr/snmr.routes.ts', 'utf8');
if (!routes.includes('deleteSite,')) {
  routes = routes.replace('createSite,', 'createSite,\n  deleteSite,');
}
if (!routes.includes('router.delete("/sites/:id"')) {
  routes = routes.replace('router.post("/sites", createSite);', 'router.post("/sites", createSite);\nrouter.delete("/sites/:id", deleteSite);');
}
fs.writeFileSync('backend/src/modules/snmr/snmr.routes.ts', routes);
