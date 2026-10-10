const fs = require('fs');
let lines = fs.readFileSync('backend/src/modules/snmr/snmr.controller.ts', 'utf8').split('\n');
// We want to replace lines 172 to 188 (0-indexed, so 172 is line 173) with the correct content.
lines.splice(172, 17, 
'export const getSystemUsers = async (req: Request, res: Response) => {',
'  try {',
'    const users = await snmrService.getSystemUsers();',
'    res.json(users);',
'  } catch (err: any) {',
'    res.status(500).json({ error: err.message });',
'  }',
'};',
'',
'export const deleteDocument = async (req: Request, res: Response) => {',
'  try {',
'    await snmrService.deleteDocument(req.params.id);',
'    res.json({ message: "Document deleted" });',
'  } catch (err: any) {',
'    res.status(500).json({ error: err.message });',
'  }',
'};'
);
fs.writeFileSync('backend/src/modules/snmr/snmr.controller.ts', lines.join('\n'));
