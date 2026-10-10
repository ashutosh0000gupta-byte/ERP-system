import { prisma } from "./src/lib/prisma";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const csvPath = "C:\\Users\\ashut\\.gemini\\antigravity-ide\\brain\\43db5430-e907-424b-abc6-30d28bec5a76\\.user_uploaded\\media_1791621380975.csv";
  
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found at:", csvPath);
    return;
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").map(l => l.trim()).filter(l => l);
  
  // Skip header
  const rows = lines.slice(1);

  let added = 0;
  for (const row of rows) {
    const cols = row.split(",").map(c => c.replace(/^"|"$/g, ''));
    if (cols.length < 6) continue;

    const workerId = cols[0];
    const name = cols[1];
    const siteName = cols[2];
    const dailyWage = parseFloat(cols[5]);

    // Find site by name
    const site = await prisma.site.findFirst({
      where: { name: siteName }
    });

    if (!site) {
      console.log(`Site not found for name: ${siteName}. Skipping worker ${name}.`);
      continue;
    }

    // Upsert worker
    await prisma.worker.upsert({
      where: { workerId },
      update: {
        fullName: name,
        dailyWage,
        siteId: site.id
      },
      create: {
        workerId,
        fullName: name,
        dailyWage,
        joiningDate: new Date(),
        siteId: site.id,
        status: "Active"
      }
    });
    console.log(`Imported worker: ${name} (${workerId})`);
    added++;
  }

  console.log(`Successfully imported ${added} workers from CSV!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
