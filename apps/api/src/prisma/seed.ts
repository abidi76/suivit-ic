// prisma/seed.ts
import { PrismaClient, Role, EquipmentState } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // 1. CRE
  const cre = await prisma.cre.upsert({
    where: { code: 'CRE-TUNIS' },
    update: {},
    create: {
      code: 'CRE-TUNIS',
      designationFr: 'CRE Tunis',
      designationAr: 'CRE تونس',
      actif: true,
    },
  });
  console.log('✅ CRE:', cre.designationFr);

  // 2. Gouvernorat
  // ...

  // ... (reste du seed)
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });