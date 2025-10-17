import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://root:root@localhost:5432/test_db?schema=public',
    },
  },
});

async function seedBalises() {
  console.log('🌱 Seeding balises for testing...');

  const balises = [];

  for (let i = 10000; i < 99999; i += 50) {
    const user = `LX00000${Math.random() * 9}`;
    const isLocked = Math.random() > 0.8;
    balises.push({
      secondaryId: i,
      version: Math.floor(Math.random() * 3) + 1, // Random version 1-3
      bucketId: `${i}`,
      fileTypes: ['leu', 'il', 'bis'], // Example file types
      createdBy: user,
      createdTime: new Date(),
      locked: isLocked, // 20% chance of being locked
      lockedBy: isLocked ? user : null,
      lockedTime: isLocked ? new Date() : null,
    });
  }

  console.log(`Creating ${balises.length} test balises...`);

  // Insert in batches to avoid overwhelming the database
  const batchSize = 50;
  for (let i = 0; i < balises.length; i += batchSize) {
    const batch = balises.slice(i, i + batchSize);
    await prisma.balise.createMany({
      data: batch,
      skipDuplicates: true, // Skip if already exists
    });
    console.log(`✅ Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(balises.length / batchSize)}`);
  }

  const count = await prisma.balise.count();
  console.log(`🎉 Seeding complete! Total balises in database: ${count}`);
}

async function main() {
  try {
    await seedBalises();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
