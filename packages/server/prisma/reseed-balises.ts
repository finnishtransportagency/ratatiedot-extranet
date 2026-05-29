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
        key: 'section_9',
        name: 'Varareitti',
        sectionPrefix: 9,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Varareitti (9000-9999)',
      },
      {
        key: 'section_10',
        name: 'Helsinki-Riihimäki',
        sectionPrefix: 10,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Helsinki-Riihimäki railway section',
      },
      {
        key: 'section_15',
        name: 'Riihimäki-Tampere',
        sectionPrefix: 15,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Riihimäki-Tampere railway section',
      },
      {
        key: 'section_20',
        name: 'Tampere-Seinäjoki',
        sectionPrefix: 20,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Tampere-Seinäjoki railway section',
      },
      {
        key: 'section_25',
        name: 'Helsinki-Turku',
        sectionPrefix: 25,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Helsinki-Turku railway section',
      },
      {
        key: 'section_30',
        name: 'Lahti-Heinola',
        sectionPrefix: 30,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Lahti-Heinola railway section',
      },
      {
        key: 'section_35',
        name: 'Kouvola-Joensuu',
        sectionPrefix: 35,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Kouvola-Joensuu railway section',
      },
      {
        key: 'section_40',
        name: 'Pieksämäki-Kontiomäki',
        sectionPrefix: 40,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Pieksämäki-Kontiomäki railway section',
      },
      {
        key: 'section_45',
        name: 'Oulu-Kolari',
        sectionPrefix: 45,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Oulu-Kolari railway section',
      },
      {
        key: 'section_50',
        name: 'Tampere-Jyväskylä',
        sectionPrefix: 50,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Tampere-Jyväskylä railway section',
      },
      {
        key: 'section_55',
        name: 'Jyväskylä-Äänekoski',
        sectionPrefix: 55,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Jyväskylä-Äänekoski railway section',
      },
      {
        key: 'section_60',
        name: 'Turku-Toijala',
        sectionPrefix: 60,
        createdBy: 'seed.user',
        createdTime: new Date(),
        description: 'Turku-Toijala railway section',
      },
      {
        key: 'section_65',
        name: 'Vaasa-Seinäjoki',
        sectionPrefix: 65,
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
