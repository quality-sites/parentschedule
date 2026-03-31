import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Parent Index Inversion Migration...');
  const schedules = await prisma.schedule.findMany();
  
  for (const s of schedules) {
    if (!s.data) continue;
    
    let config;
    try {
      config = JSON.parse(s.data);
    } catch(e) {
      console.error(`Failed to parse data for schedule ${s.id}`);
      continue;
    }
    
    console.log(`Migrating Schedule ID: ${s.id}`);
    
    // 1. Invert parents array so [1] becomes [0], and [0] becomes [1]
    if (config.parents && config.parents.length >= 2) {
      const parentB = config.parents[0]; // Historically Dad
      const parentA = config.parents[1]; // Historically Mum
      config.parents = [parentA, parentB]; 
    }

    // 2. Invert parentColors array
    if (config.parentColors && config.parentColors.length >= 2) {
      const colorB = config.parentColors[0];
      const colorA = config.parentColors[1];
      config.parentColors = [colorA, colorB];
    }
    
    // 3. Invert weekendStarterParent boolean
    if (config.weekendStarterParent !== undefined) {
      config.weekendStarterParent = config.weekendStarterParent === 0 ? 1 : 0;
    }
    
    // 4. Invert any manual overrides
    if (config.overrides && Array.isArray(config.overrides)) {
      config.overrides = config.overrides.map((ov: any) => ({
        ...ov,
        parent: ov.parent === 0 ? 1 : ov.parent === 1 ? 0 : ov.parent
      }));
    }
    
    // Save back to database
    await prisma.schedule.update({
      where: { id: s.id },
      data: { data: JSON.stringify(config) }
    });
    console.log(`Successfully inverted schedule ID: ${s.id}`);
  }
  
  console.log('Migration complete. The backend schema is now successfully synchronized with the new engine math.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
