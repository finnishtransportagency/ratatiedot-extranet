import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://root:root@localhost:5432/test_db?schema=public'
    }
  }
});

async function seedBalises() {
  console.log('🌱 Seeding balises for testing...');
  
  // Generate balises in the 24000-25000 range
  const balises = [];
  
  for (let i = 24000; i < 25000; i += 50) {
    balises.push({
      secondaryId: i,
      version: Math.floor(Math.random() * 3) + 1, // Random version 1-3
      bucketId: `test-bucket-${i}`,
      fileTypes: ['pdf', 'doc', 'xlsx'], // Example file types
      createdBy: 'test-seed-user',
      createdTime: new Date(),
      locked: Math.random() > 0.8, // 20% chance of being locked
      lockedBy: Math.random() > 0.8 ? 'admin-user' : null,
      lockedTime: Math.random() > 0.8 ? new Date() : null,
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });