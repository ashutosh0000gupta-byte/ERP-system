const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/snmr/snmr.service.ts', 'utf8');

const toAdd = `
export const deleteDocument = async (id: string) => {
  return prisma.snmrDocument.delete({ where: { id } });
};
`;

if (!content.includes('export const deleteDocument')) {
  content += toAdd;
  fs.writeFileSync('backend/src/modules/snmr/snmr.service.ts', content);
}
