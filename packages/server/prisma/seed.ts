import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate random date within the last 2 years
function getRandomDate() {
  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
  const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
  return new Date(randomTime);
}

// Helper function to generate recent date (last 24 hours)
function getRecentDate() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
  const randomTime = yesterday.getTime() + Math.random() * (now.getTime() - yesterday.getTime());
  return new Date(randomTime);
}

// Helper function to generate random user
function getRandomUser() {
  const users = ['LX000001', 'LX000002', 'LX000003', 'LX000004', 'LX000005', 'LX000006', 'LX000007'];
  return users[Math.floor(Math.random() * users.length)];
}

// Helper function to generate random description with varied lengths
function getRandomDescription() {
  const descriptions = [
    `Baliisi sijaitsee pääradan varrella km ${Math.floor(Math.random() * 600)}.`,
    `Asennettu vuonna ${2015 + Math.floor(Math.random() * 10)}. Toimii osana ERTMS-järjestelmää.`,
    `Sijaitsee ${Math.floor(Math.random() * 500) + 100} metriä liikennepaikan jälkeen. Huollettu viimeksi ${new Date(
      Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000,
    ).toLocaleDateString('fi-FI')}.`,
    `Vaihtoalueen reunalla. Kriittinen osa junaliikenteen ohjausta.`,
    `Tunnelin suulla, erikoissijoitus turvallisuussyistä.`,
    `Sillan kohdalla km ${Math.floor(Math.random() * 400) + 50}. Integroitu JKV-järjestelmään.`,
    `Sivuradan päässä. Vaatii säännöllistä huoltoa talviolosuhteissa.`,
    `Aseman itäpäässä noin ${Math.floor(Math.random() * 800) + 200} metriä opastimesta.`,
    `Pitkän suoran keskivaiheilla. Varustettu kaksoislähetinyksikköllä.`,
    `Tasoristeyksessä km ${Math.floor(Math.random() * 300) + 50}. Asennettu ${2018 + Math.floor(Math.random() * 7)}.`,
  ];

  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

async function seedSections() {
  console.log('🌱 Seeding railway sections...');

  // Delete existing sections
  await prisma.section.deleteMany({});

  const sections = [];

  // Create 63 sections (section 10 through section 72)
  for (let sectionNum = 10; sectionNum <= 72; sectionNum++) {
    const idRangeMin = sectionNum * 1000;
    const idRangeMax = sectionNum * 1000 + 999;

    sections.push({
      name: `JKV-rataosa ${sectionNum}`,
      shortName: `JKV-rataosa ${sectionNum}`,
      key: `section_${sectionNum}`,
      idRangeMin,
      idRangeMax,
      description: `JKV-rataosa ${sectionNum}, baliisi ID:t ${idRangeMin}-${idRangeMax}`,
      color: `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`, // Random color
      createdBy: 'system',
    });
  }

  for (const section of sections) {
    await prisma.section.create({
      data: section,
    });
  }

  console.log(`✅ Created ${sections.length} railway sections (section 10 - section 72)`);
}

async function seedBalises() {
  console.log('🌱 Seeding balises for testing...');

  // Clear existing balise data
  await prisma.baliseVersion.deleteMany({});
  await prisma.balise.deleteMany({});

  const balises = [];
  const baliseVersions = [];

  // Generate IDs distributed across all 63 sections (10-72)
  // Each section gets between 100-600 balises randomly
  const sectionsConfig = [];
  for (let sectionNum = 10; sectionNum <= 72; sectionNum++) {
    const min = sectionNum * 1000;
    const max = sectionNum * 1000 + 999;
    const balisesInSection = Math.floor(Math.random() * 501) + 100; // Random between 100-600
    sectionsConfig.push({ min, max, count: balisesInSection });
  }

  const totalBalises = sectionsConfig.reduce((sum, section) => sum + section.count, 0);
  const recentBaliseCount = Math.floor(totalBalises * 0.1); // 10% recent
  let recentCreated = 0;

  console.log(`Creating ${totalBalises} balises across ${sectionsConfig.length} sections...`);

  const selectedIds: number[] = [];

  for (let sectionIndex = 0; sectionIndex < sectionsConfig.length; sectionIndex++) {
    const section = sectionsConfig[sectionIndex];
    const sectionRange = section.max - section.min + 1;
    const balisesForThisSection = section.count;

    // Generate random IDs within this section's range
    const sectionIds: number[] = [];
    while (sectionIds.length < Math.min(balisesForThisSection, sectionRange)) {
      const randomId = section.min + Math.floor(Math.random() * sectionRange);
      if (!sectionIds.includes(randomId)) {
        sectionIds.push(randomId);
      }
    }
    selectedIds.push(...sectionIds);
  }

  for (const i of selectedIds) {
    const user = getRandomUser();
    const isLocked = Math.random() > 0.85; // 15% chance of being locked
    const currentVersion = Math.floor(Math.random() * 4) + 1; // 1-4 versions

    // 10% should be created in last 24h, rest older
    const shouldBeRecent = recentCreated < recentBaliseCount && Math.random() < 0.1;
    const createdTime = shouldBeRecent ? getRecentDate() : getRandomDate();
    if (shouldBeRecent) recentCreated++;

    const description = getRandomDescription();

    // Create main balise record
    const baliseData = {
      secondaryId: i,
      version: currentVersion,
      description,
      fileTypes: [], // No dummy files - represents empty S3 state
      createdBy: user,
      createdTime,
      locked: isLocked,
      lockedBy: isLocked ? user : null,
      lockedTime: isLocked ? new Date(createdTime.getTime() + Math.random() * 86400000) : null, // Random lock time after creation
    };

    balises.push(baliseData);

    // Create version history for this balise (versions 1 to currentVersion-1)
    // The current version is NOT in the history - only older versions
    let versionCreatedTime = new Date(createdTime.getTime() - currentVersion * 30 * 24 * 60 * 60 * 1000); // Start from older date

    for (let version = 1; version < currentVersion; version++) {
      const versionUser = Math.random() > 0.7 ? getRandomUser() : user; // 30% chance of different user
      const isVersionLocked = false; // Old versions are never locked

      baliseVersions.push({
        secondaryId: i,
        version,
        description: getRandomDescription(),
        fileTypes: [], // No dummy files - represents empty S3 state
        createdBy: versionUser,
        createdTime: versionCreatedTime,
        locked: isVersionLocked,
        lockedBy: null,
        lockedTime: null,
        versionCreatedTime,
      });

      // Each subsequent version created some time after the previous one
      versionCreatedTime = new Date(versionCreatedTime.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // 0-30 days later
    }
  }

  console.log(`Creating ${balises.length} test balises with ${baliseVersions.length} version records...`);
  console.log(`Recent balises (last 24h): ${recentCreated} (${((recentCreated / balises.length) * 100).toFixed(1)}%)`);

  // Show distribution across sections
  const distribution = sectionsConfig.map((section, index) => {
    const count = selectedIds.filter((id) => id >= section.min && id <= section.max).length;
    return `Section ${index + 1}: ${count} balises (${section.min}-${section.max})`;
  });
  console.log('Distribution:', distribution.join(', '));

  // Insert balises in batches (larger batches for better performance)
  const batchSize = 100;
  for (let i = 0; i < balises.length; i += batchSize) {
    const batch = balises.slice(i, i + batchSize);
    await prisma.balise.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`✅ Created balise batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(balises.length / batchSize)}`);
  }

  // Get created balises to link versions
  const createdBalises = await prisma.balise.findMany({
    select: { id: true, secondaryId: true },
  });

  const baliseIdMap = new Map(createdBalises.map((b) => [b.secondaryId, b.id]));

  // Insert version history in batches
  const versionsWithBaliseIds = baliseVersions.map((version) => ({
    ...version,
    baliseId: baliseIdMap.get(version.secondaryId)!,
  }));

  const versionBatchSize = 500; // Larger batches for version history
  for (let i = 0; i < versionsWithBaliseIds.length; i += versionBatchSize) {
    const batch = versionsWithBaliseIds.slice(i, i + versionBatchSize);
    await prisma.baliseVersion.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(
      `✅ Created version batch ${Math.floor(i / versionBatchSize) + 1}/${Math.ceil(
        versionsWithBaliseIds.length / versionBatchSize,
      )}`,
    );
  }

  const baliseCount = await prisma.balise.count();
  const versionCount = await prisma.baliseVersion.count();
  console.log(`🎉 Balise seeding complete! Created ${baliseCount} balises with ${versionCount} version records`);
}

async function main() {
  // Seed railway sections first
  await seedSections();

  // Seed existing category data
  await prisma.categoryDataBase.upsert({
    where: { id: 'f0093c24-cece-11ed-afa1-0242ac120002' },
    update: {},
    create: {
      id: 'f0093c24-cece-11ed-afa1-0242ac120002',
      rataextraRequestPage: 'hallintaraportit',
      alfrescoFolder: '6a1200cb-5fc9-4364-b9bb-645c64c9e31e',
      writeRights: 'Ratatieto_kirjoitus_hallintaraportit',
      categoryDataContents: {
        create: {
          fields: [
            {
              type: 'notification_info',
              children: [
                {
                  type: 'paragraph-two',
                  children: [
                    { text: 'Hallintaraportit: vieraile virallisella ' },
                    { href: 'https://vayla.fi/', type: 'link', children: [{ text: 'sivulla', color: '#49C2F1' }] },
                    { text: '. Tervetuloa!' },
                  ],
                },
              ],
            },
          ],
        },
      },
      categoryComponents: {
        create: [
          {
            node: {
              create: {
                type: 'File',
                title: 'File List Component',
                alfrescoNodeId: '6bae6e4c-efd2-4d55-8560-cf2f2cc2ce8b',
              },
            },
          },
          {
            node: {
              create: {
                type: 'Folder',
                title: 'Folder List Component',
                alfrescoNodeId: '6a1200cb-5fc9-4364-b9bb-645c64c9e31e',
              },
            },
          },
          {
            node: {
              create: { type: 'Map', title: 'Map Component', alfrescoNodeId: '6bae6e4c-efd2-4d55-8560-cf2f2cc2ce8b' },
            },
          },
          {
            card: {
              create: {
                title: 'Basic Card Component',
                content: {
                  fields: [
                    {
                      type: 'paragraph-two',
                      children: [{ text: 'Text content' }],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
  });

  // Seed balise data
  await seedBalises();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
