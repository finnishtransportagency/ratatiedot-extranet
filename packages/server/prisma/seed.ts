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
function getRandomDescription(secondaryId: number) {
  const shortDescriptions = [
    `Baliisi ${secondaryId} - Pääradan varsilla`,
    `Baliisi ${secondaryId} - Sivuradan päässä`,
    `Baliisi ${secondaryId} - Liikennepaikan kohdalla`,
    `Baliisi ${secondaryId} - Vaihtoalueella`,
    `Baliisi ${secondaryId} - Tunnelin suulla`,
    `Baliisi ${secondaryId} - Sillan kohdalla`,
    `Baliisi ${secondaryId} - Tasoristeyksessä`,
  ];

  const longDescriptions = [
    `Baliisi ${secondaryId} - Sijaitsee Helsinki-Riihimäki pääradan varrella, noin 2 kilometriä Tikkurilan asemasta etelään. Baliisi on asennettu vuonna 2019 osana ERTMS-järjestelmän käyttöönottoa. Laite toimii normaalisti ja on integroitu JKV-järjestelmään.`,
    `Baliisi ${secondaryId} - Kerava-Lahti rataosuudella sijaitsevan balisien ryhmän ensimmäinen baliisi. Asennettu erikoissijoitukseen tunnelin sisäänkäynnin läheisyyteen turvallisuussyistä. Vaatii säännöllistä huoltoa ympäristöolosuhteiden vuoksi.`,
    `Baliisi ${secondaryId} - Tampereen liikennepaikan itäpäässä sijaitseva baliisi, joka välittää tietoja junien nopeudesta ja sijaintitiedoista. Baliisi on osa laajempaa automaatiojärjestelmää ja kommunikoi suoraan Tampere-keskuksen kanssa reaaliaikaisesti.`,
    `Baliisi ${secondaryId} - Turku-Toijala rataosalla sijaitsevan vaihtoalueen keskiössä. Baliisi on kriittinen osa junaliikenteen ohjausta alueella ja vaatii erityistä huomiota huoltotoimenpiteissä. Integroitu paikalliseen turvalaitekannan hallintajärjestelmään.`,
    `Baliisi ${secondaryId} - Kouvolaan johtavan sivuradan päässä, noin 500 metriä ennen asemarakennusta. Baliisi on varustettu erikoislähettimellä, joka mahdollistaa tiedonsiirron myös huonoissa sääolosuhteissa. Asennettu korkeaan betonipylvääseen näkyvyyden varmistamiseksi.`,
    `Baliisi ${secondaryId} - Oulu-Rovaniemi rataosalla sijaitsevan pitkän suoran keskivaiheilla. Baliisi toimii tärkeänä välityspisteenä pohjoiseen suuntautuvalle liikenteelle ja on varustettu kaksoislähetinyksikköllä varmuuden lisäämiseksi.`,
  ];

  // 70% chance of short description, 30% chance of long description
  const useShort = Math.random() < 0.7;
  const descriptions = useShort ? shortDescriptions : longDescriptions;
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Helper function to generate realistic fileTypes
function getRandomFileTypes(): string[] {
  // 70% chance of having both common types
  if (Math.random() < 0.7) {
    // 20% chance of also having 'bis' with the common types
    if (Math.random() < 0.2) {
      return ['leu', 'il', 'bis'];
    }
    return ['leu', 'il'];
  }

  // 20% chance of having only one common type
  if (Math.random() < 0.67) {
    // 20% of remaining 30%
    return Math.random() < 0.5 ? ['leu'] : ['il'];
  }

  // 10% chance of having 'bis' with one common type
  const singleCommon = Math.random() < 0.5 ? 'leu' : 'il';
  return [singleCommon, 'bis'];
}

async function seedAreas() {
  console.log('🌱 Seeding railway areas...');

  const areas = [
    {
      name: 'Helsinki-Riihimäki',
      shortName: 'Alue 1',
      key: 'area_1',
      idRangeMin: 10000,
      idRangeMax: 14999,
      description: 'Helsinki-Riihimäki väli sisältää pääkaupunkiseudun ja Riihimäen välisen radan',
      color: '#FF6B6B',
      createdBy: 'system',
    },
    {
      name: 'Riihimäki-Tampere',
      shortName: 'Alue 2',
      key: 'area_2',
      idRangeMin: 15000,
      idRangeMax: 19999,
      description: 'Riihimäki-Tampere väli',
      color: '#4ECDC4',
      createdBy: 'system',
    },
    {
      name: 'Tampere-Seinäjoki',
      shortName: 'Alue 3',
      key: 'area_3',
      idRangeMin: 20000,
      idRangeMax: 24999,
      description: 'Tampere-Seinäjoki väli',
      color: '#45B7D1',
      createdBy: 'system',
    },
    {
      name: 'Seinäjoki-Oulu',
      shortName: 'Alue 4',
      key: 'area_4',
      idRangeMin: 25000,
      idRangeMax: 29999,
      description: 'Seinäjoki-Oulu väli',
      color: '#96CEB4',
      createdBy: 'system',
    },
    {
      name: 'Oulu-Rovaniemi',
      shortName: 'Alue 5',
      key: 'area_5',
      idRangeMin: 30000,
      idRangeMax: 34999,
      description: 'Oulu-Rovaniemi väli',
      color: '#FFEAA7',
      createdBy: 'system',
    },
    {
      name: 'Rovaniemi-Kolari',
      shortName: 'Alue 6',
      key: 'area_6',
      idRangeMin: 35000,
      idRangeMax: 39999,
      description: 'Rovaniemi-Kolari väli',
      color: '#DDA0DD',
      createdBy: 'system',
    },
    {
      name: 'Lahti-Heinola',
      shortName: 'Alue 7',
      key: 'area_7',
      idRangeMin: 40000,
      idRangeMax: 44999,
      description: 'Lahti-Heinola sivurata',
      color: '#98D8C8',
      createdBy: 'system',
    },
    {
      name: 'Turku-Toijala',
      shortName: 'Alue 8',
      key: 'area_8',
      idRangeMin: 45000,
      idRangeMax: 49999,
      description: 'Turku-Toijala väli',
      color: '#F7DC6F',
      createdBy: 'system',
    },
    {
      name: 'Kouvola-Joensuu',
      shortName: 'Alue 9',
      key: 'area_9',
      idRangeMin: 50000,
      idRangeMax: 54999,
      description: 'Kouvola-Joensuu väli',
      color: '#BB8FCE',
      createdBy: 'system',
    },
    {
      name: 'Joensuu-Nurmes',
      shortName: 'Alue 10',
      key: 'area_10',
      idRangeMin: 55000,
      idRangeMax: 59999,
      description: 'Joensuu-Nurmes väli',
      color: '#85C1E9',
      createdBy: 'system',
    },
    {
      name: 'Pieksämäki-Joensuu',
      shortName: 'Alue 11',
      key: 'area_11',
      idRangeMin: 60000,
      idRangeMax: 64999,
      description: 'Pieksämäki-Joensuu yhdysrata',
      color: '#F8C471',
      createdBy: 'system',
    },
    {
      name: 'Muut alueet',
      shortName: 'Alue 12',
      key: 'area_12',
      idRangeMin: 65000,
      idRangeMax: 99999,
      description: 'Muut ja erikoisalueet',
      color: '#D5DBDB',
      createdBy: 'system',
    },
  ];

  for (const area of areas) {
    await prisma.area.upsert({
      where: { key: area.key },
      update: area,
      create: area,
    });
  }

  console.log(`✅ Created/updated ${areas.length} railway areas`);
}

async function seedBalises() {
  console.log('🌱 Seeding balises for testing...');

  // Clear existing balise data
  await prisma.baliseVersion.deleteMany({});
  await prisma.balise.deleteMany({});

  const balises = [];
  const baliseVersions = [];

  // Create approximately 50,000 balises (89,999 IDs with random selection)
  const totalBalises = 50000;
  const recentBaliseCount = Math.floor(totalBalises * 0.1); // 10% recent
  let recentCreated = 0;

  // Generate IDs distributed across all areas to ensure good coverage
  // Each area gets roughly equal number of balises
  const areasConfig = [
    { min: 10000, max: 14999 }, // area_1
    { min: 15000, max: 19999 }, // area_2
    { min: 20000, max: 24999 }, // area_3
    { min: 25000, max: 29999 }, // area_4
    { min: 30000, max: 34999 }, // area_5
    { min: 35000, max: 39999 }, // area_6
    { min: 40000, max: 44999 }, // area_7
    { min: 45000, max: 49999 }, // area_8
    { min: 50000, max: 54999 }, // area_9
    { min: 55000, max: 59999 }, // area_10
    { min: 60000, max: 64999 }, // area_11
    { min: 65000, max: 99999 }, // area_12 (larger range)
  ];

  const selectedIds: number[] = [];
  const balisesPerArea = Math.floor(totalBalises / areasConfig.length);
  const remainder = totalBalises % areasConfig.length;

  for (let areaIndex = 0; areaIndex < areasConfig.length; areaIndex++) {
    const area = areasConfig[areaIndex];
    const areaRange = area.max - area.min + 1;
    const balisesForThisArea = balisesPerArea + (areaIndex < remainder ? 1 : 0);

    // Generate random IDs within this area's range
    const areaIds: number[] = [];
    while (areaIds.length < Math.min(balisesForThisArea, areaRange)) {
      const randomId = area.min + Math.floor(Math.random() * areaRange);
      if (!areaIds.includes(randomId)) {
        areaIds.push(randomId);
      }
    }
    selectedIds.push(...areaIds);
  }

  for (const i of selectedIds) {
    const user = getRandomUser();
    const isLocked = Math.random() > 0.85; // 15% chance of being locked
    const currentVersion = Math.floor(Math.random() * 4) + 1; // 1-4 versions

    // 10% should be created in last 24h, rest older
    const shouldBeRecent = recentCreated < recentBaliseCount && Math.random() < 0.1;
    const createdTime = shouldBeRecent ? getRecentDate() : getRandomDate();
    if (shouldBeRecent) recentCreated++;

    const description = getRandomDescription(i);

    // Create main balise record
    const baliseData = {
      secondaryId: i,
      version: currentVersion,
      description,
      bucketId: `balise-${i}`,
      fileTypes: getRandomFileTypes(), // Realistic varied file types
      createdBy: user,
      createdTime,
      locked: isLocked,
      lockedBy: isLocked ? user : null,
      lockedTime: isLocked ? new Date(createdTime.getTime() + Math.random() * 86400000) : null, // Random lock time after creation
    };

    balises.push(baliseData);

    // Create version history for this balise
    let versionCreatedTime = createdTime;
    for (let version = 1; version <= currentVersion; version++) {
      const versionUser = Math.random() > 0.7 ? getRandomUser() : user; // 30% chance of different user
      const isVersionLocked = version === currentVersion ? isLocked : Math.random() > 0.9;

      // Each version created some time after the previous one
      if (version > 1) {
        versionCreatedTime = new Date(versionCreatedTime.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // 0-30 days later
      }

      baliseVersions.push({
        secondaryId: i,
        version,
        description: version === 1 ? description : `${description} (versio ${version})`,
        bucketId: `balise-${i}-v${version}`,
        fileTypes: getRandomFileTypes(), // Each version can have different file types
        createdBy: versionUser,
        createdTime: versionCreatedTime,
        locked: isVersionLocked,
        lockedBy: isVersionLocked ? versionUser : null,
        lockedTime: isVersionLocked ? new Date(versionCreatedTime.getTime() + Math.random() * 86400000) : null,
        versionCreatedTime,
      });
    }
  }

  console.log(`Creating ${balises.length} test balises with ${baliseVersions.length} version records...`);
  console.log(`Recent balises (last 24h): ${recentCreated} (${((recentCreated / balises.length) * 100).toFixed(1)}%)`);

  // Show distribution across areas
  const distribution = areasConfig.map((area, index) => {
    const count = selectedIds.filter((id) => id >= area.min && id <= area.max).length;
    return `Area ${index + 1}: ${count} balises (${area.min}-${area.max})`;
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
  // Seed railway areas first
  await seedAreas();

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
