import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || 'postgresql://root:root@localhost:5432/test_db?schema=public',
});

const prisma = new PrismaClient({ adapter });

async function reseedBalises() {
  try {
    console.log('🔍 Starting targeted balise cleanup...');

    // Get current counts
    const beforeStats = {
      sections: await prisma.section.count(),
      balises: await prisma.balise.count(),
      versions: await prisma.baliseVersion.count(),
    };
    console.log('📊 Before cleanup:', beforeStats);

    // Delete only balise-related data (preserve other tables)
    console.log('🗑️ Deleting balise versions...');
    await prisma.baliseVersion.deleteMany({});

    console.log('🗑️ Deleting balises...');
    await prisma.balise.deleteMany({});

    console.log('🗑️ Deleting sections...');
    await prisma.section.deleteMany({});

    // Verify cleanup
    const afterCleanup = {
      sections: await prisma.section.count(),
      balises: await prisma.balise.count(),
      versions: await prisma.baliseVersion.count(),
    };
    console.log('📊 After cleanup:', afterCleanup);

    // Now create fresh test data
    console.log('🌱 Creating fresh balise data...');

    // Create sections with all required fields
    console.log('📍 Creating sections...');
    const sections = [
      {
        key: 'section_1',
        name: 'Helsinki-Riihimäki',
        shortName: 'HKI-RI',
        idRangeMin: 10000,
        idRangeMax: 14999,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Helsinki-Riihimäki railway section',
      },
      {
        key: 'section_2',
        name: 'Riihimäki-Tampere',
        shortName: 'RI-TRE',
        idRangeMin: 15000,
        idRangeMax: 19999,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Riihimäki-Tampere railway section',
      },
      {
        key: 'section_3',
        name: 'Tampere-Seinäjoki',
        shortName: 'TRE-SK',
        idRangeMin: 20000,
        idRangeMax: 24999,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Tampere-Seinäjoki railway section',
      },
      {
        key: 'section_4',
        name: 'Helsinki-Turku',
        shortName: 'HKI-TKU',
        idRangeMin: 25000,
        idRangeMax: 29999,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Helsinki-Turku railway section',
      },
      {
        key: 'section_5',
        name: 'Lahti-Heinola',
        shortName: 'LH-HN',
        idRangeMin: 30000,
        idRangeMax: 34999,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Lahti-Heinola railway section',
      },
      {
        key: 'section_6',
        name: 'Kouvola-Joensuu',
        shortName: 'KV-JNS',
        idRangeMin: 35000,
        idRangeMax: 39999,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Kouvola-Joensuu railway section',
      },
      {
        key: 'section_7',
        name: 'Pieksämäki-Kontiomäki',
        shortName: 'PM-KM',
        idRangeMin: 40000,
        idRangeMax: 44999,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Pieksämäki-Kontiomäki railway section',
      },
      {
        key: 'section_8',
        name: 'Oulu-Kolari',
        shortName: 'OL-KLR',
        idRangeMin: 45000,
        idRangeMax: 49999,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Oulu-Kolari railway section',
      },
      {
        key: 'section_9',
        name: 'Tampere-Jyväskylä',
        shortName: 'TRE-JY',
        idRangeMin: 50000,
        idRangeMax: 54999,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Tampere-Jyväskylä railway section',
      },
      {
        key: 'section_10',
        name: 'Jyväskylä-Äänekoski',
        shortName: 'JY-ÄS',
        idRangeMin: 55000,
        idRangeMax: 59999,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Jyväskylä-Äänekoski railway section',
      },
      {
        key: 'section_11',
        name: 'Turku-Toijala',
        shortName: 'TKU-TL',
        idRangeMin: 60000,
        idRangeMax: 64999,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Turku-Toijala railway section',
      },
      {
        key: 'section_12',
        name: 'Vaasa-Seinäjoki',
        shortName: 'VS-SK',
        idRangeMin: 65000,
        idRangeMax: 69999,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Vaasa-Seinäjoki railway section',
      },
    ];

    for (const sectionData of sections) {
      await prisma.section.create({ data: sectionData });
    }
    console.log(`✅ Created ${sections.length} sections`);

    // Create balises
    console.log('🎯 Creating balises...');
    const baliseCount = 50000;
    const batchSize = 1000;

    for (let i = 0; i < baliseCount; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, baliseCount);
      const batch = [];

      for (let j = i; j < batchEnd; j++) {
        const secondaryId = 10000 + j;
        const longDescription = Math.random() < 0.3; // 30% long descriptions

        batch.push({
          secondaryId,
          version: 1,
          description: longDescription
            ? `Detailed balise description for ${secondaryId}. This balise is located at a critical junction in the Finnish railway network, providing essential signaling information for train operations. The balise contains multiple data elements including speed restrictions, gradient information, and route-specific operational instructions that ensure safe and efficient train movements through this section of track.`
            : `Baliisi ${secondaryId}`,
          fileTypes: [], // No dummy files - represents empty S3 state
          locked: Math.random() < 0.1, // 10% locked
          lockedBy: Math.random() < 0.5 ? 'test.user' : 'admin.user',
          lockedTime: Math.random() < 0.8 ? new Date() : null,
          createdTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random within 30 days
          createdBy: 'seed.user',
        });
      }

      await prisma.balise.createMany({ data: batch });
      console.log(`✅ Created balises ${i + 1}-${batchEnd} of ${baliseCount}`);
    }

    // Create versions
    console.log('📝 Creating balise versions...');
    const allBalises = await prisma.balise.findMany();
    const versionBatch = [];

    for (const balise of allBalises) {
      // Create 1-5 versions per balise
      const versionCount = Math.floor(Math.random() * 5) + 1;

      for (let v = 1; v <= versionCount; v++) {
        versionBatch.push({
          baliseId: balise.id,
          secondaryId: balise.secondaryId,
          version: v,
          description: `${balise.description} - versio ${v}`,
          createdTime: new Date(balise.createdTime.getTime() + v * 24 * 60 * 60 * 1000),
          createdBy: v === versionCount ? balise.createdBy : 'previous.user',
          fileTypes: [], // No dummy files in version history either
          locked: balise.locked,
        });

        // Process in batches to avoid memory issues
        if (versionBatch.length >= 5000) {
          await prisma.baliseVersion.createMany({ data: versionBatch });
          console.log(`✅ Created ${versionBatch.length} versions`);
          versionBatch.length = 0; // Clear batch
        }
      }
    }

    // Create remaining versions
    if (versionBatch.length > 0) {
      await prisma.baliseVersion.createMany({ data: versionBatch });
      console.log(`✅ Created final ${versionBatch.length} versions`);
    }

    // Final stats
    const finalStats = {
      sections: await prisma.section.count(),
      balises: await prisma.balise.count(),
      versions: await prisma.baliseVersion.count(),
    };

    console.log('🎉 Reseeding completed!');
    console.log('📊 Final stats:', finalStats);
  } catch (error) {
    console.error('❌ Reseeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reseedBalises();
