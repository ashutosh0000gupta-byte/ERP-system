const fs = require('fs');

// 1. Service
let service = fs.readFileSync('backend/src/modules/snmr/snmr.service.ts', 'utf8');
if (!service.includes('export const updateSite =')) {
  service += `\nexport const updateSite = async (id: string, data: any) => {\n  return prisma.site.update({ where: { id }, data });\n};\n`;
  fs.writeFileSync('backend/src/modules/snmr/snmr.service.ts', service);
}

// 2. Controller
let controller = fs.readFileSync('backend/src/modules/snmr/snmr.controller.ts', 'utf8');
if (!controller.includes('export const updateSite =')) {
  controller += `\nexport const updateSite = async (req: Request, res: Response) => {\n  try {\n    const site = await snmrService.updateSite(req.params.id, req.body);\n    res.json(site);\n  } catch (err: any) {\n    res.status(500).json({ error: err.message });\n  }\n};\n`;
  fs.writeFileSync('backend/src/modules/snmr/snmr.controller.ts', controller);
}

// 3. Routes
let routes = fs.readFileSync('backend/src/modules/snmr/snmr.routes.ts', 'utf8');
if (!routes.includes('updateSite,')) {
  routes = routes.replace('deleteSite,', 'deleteSite,\n  updateSite,');
}
if (!routes.includes('router.put("/sites/:id"')) {
  routes = routes.replace('router.delete("/sites/:id", deleteSite);', 'router.delete("/sites/:id", deleteSite);\nrouter.put("/sites/:id", updateSite);');
}
fs.writeFileSync('backend/src/modules/snmr/snmr.routes.ts', routes);
