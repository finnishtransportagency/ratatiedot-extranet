export interface IBalise {
  id: string; // can change, maybe id of S3 object?
  secondaryId: number;
  locked: boolean;
  lockedTime: string;
  lockedBy: string;
  version: number;
  description: string;
  createdBy: string;
  createdTime: string;
  editedBy: string;
  editedTime: string;
  area: string; // Railway network area
  versions?: Revision[];
}

export interface Revision {
  id: string; // can change, maybe id of S3 object?
  version: number;
  description: string;
  createdBy: string;
  createdTime: string;
}

const descriptions = [
  'Raideopastin tarkistettu',
  'Nopeusvalvonta päivitetty',
  'Turvalaite huollettu',
  'Balise-ryhmä kalibroitu',
  'ETCS-järjestelmä päivitetty',
  'Tasoristeysopastin',
  'Junankulunvalvonta',
  'Liikennepaikan opastin',
  'Raidepuskurin turvalaite',
  'Sähköturvajärjestelmä',
  'Kulunvalvonta-anturi',
  'Automaattinen junanhallinta',
  'Vaihdetunnistin',
  'Radiotaajuusbalise',
  'Turvallinen jarrutusetäisyys',
  'Liikkuva lohko',
  'Pysähdysopastin',
  'Raiteen valvontajärjestelmä',
  'ETCS-tason 1 balise',
  'ETCS-tason 2 balise',
];

export const areas = [
  'Alue 1 Uusimaa',
  'Alue 2 Lounaisrannikko',
  'Alue 3 (Riihimäki)-Kokkola',
  'Alue 4 Rauma- (Pieksämäki)',
  'Alue 5 Haapamäen tähti',
  'Alue 6 Savon rata',
  'Alue 7 Karjalan rata',
  'Alue 8 Yläsavo',
  'Alue 9 Pohjanmaan rata',
  'Alue 10 Keski-Suomi',
  'Alue 11 Kainuu-Oulu',
  'Alue 12 Oulu-Lappi',
];

const users = [
  'LX000001',
  'LX000002',
  'LX000003',
  'LX000004',
  'LX000005',
  'LX000006',
  'LX000007',
  'LX000008',
  'LX000009',
  'LX000010',
  'LX000011',
  'LX000012',
  'LX000013',
  'LX000014',
  'LX000015',
];

const generateRandomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return (
    date.toLocaleDateString('fi-FI') + ' ' + date.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })
  );
};

const generateVersions = (maxVersion: number): Revision[] => {
  const versions: Revision[] = [];
  const versionCount = Math.floor(Math.random() * maxVersion) + 1;

  for (let i = 0; i < versionCount; i++) {
    versions.push({
      id: `rev-${Math.random().toString(36).substr(2, 9)}`,
      version: i,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      createdBy: users[Math.floor(Math.random() * users.length)],
      createdTime: generateRandomDate(new Date(2020, 0, 1), new Date(2024, 11, 31)),
    });
  }

  return versions;
};

// Area configuration with secondaryId ranges
// Each area gets approximately 8,300 items to stay within 99,999 total
export const areaConfig = {
  'Alue 1 Uusimaa': { startId: 10000, count: 8300 },
  'Alue 2 Lounaisrannikko': { startId: 18300, count: 8300 },
  'Alue 3 (Riihimäki)-Kokkola': { startId: 26600, count: 8300 },
  'Alue 4 Rauma- (Pieksämäki)': { startId: 34900, count: 8300 },
  'Alue 5 Haapamäen tähti': { startId: 43200, count: 8300 },
  'Alue 6 Savon rata': { startId: 51500, count: 8300 },
  'Alue 7 Karjalan rata': { startId: 59800, count: 8300 },
  'Alue 8 Yläsavo': { startId: 68100, count: 8300 },
  'Alue 9 Pohjanmaan rata': { startId: 76400, count: 8300 },
  'Alue 10 Keski-Suomi': { startId: 84700, count: 8300 },
  'Alue 11 Kainuu-Oulu': { startId: 93000, count: 6900 }, // Slightly fewer to stay under 100k
  'Alue 12 Oulu-Lappi': { startId: 99900, count: 99 }, // Fill the remainder to 99,999
} as const;

// Calculate total items across all areas
export const TOTAL_ITEMS_COUNT = Object.values(areaConfig).reduce((sum, config) => sum + config.count, 0);

// Global tracking for area-specific counters
const areaCounters: { [key: string]: number } = {};
areas.forEach((area) => {
  areaCounters[area] = 0;
});

// Function to generate a single balise item with area-specific secondaryId
const generateBaliseItem = (index: number, forceArea?: string): IBalise => {
  const version = Math.floor(Math.random() * 5);
  const isLocked = Math.random() > 0.9; // 10% chance of being locked
  const createdDate = new Date(
    2020 + Math.floor(Math.random() * 5),
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1,
  );
  const editedDate = new Date(createdDate.getTime() + Math.random() * (new Date().getTime() - createdDate.getTime()));

  // Determine area - either forced or random
  let selectedArea = forceArea;
  if (!selectedArea) {
    // When generating random data, pick area based on availability
    const availableAreas = areas.filter((area) => {
      const config = areaConfig[area as keyof typeof areaConfig];
      return areaCounters[area] < config.count;
    });

    if (availableAreas.length === 0) {
      // Fallback to first area if all are full (shouldn't happen in normal usage)
      selectedArea = areas[0];
    } else {
      selectedArea = availableAreas[Math.floor(Math.random() * availableAreas.length)];
    }
  }

  // Get area configuration and calculate secondaryId
  const config = areaConfig[selectedArea as keyof typeof areaConfig];
  const areaIndex = areaCounters[selectedArea];
  const secondaryId = config.startId + areaIndex;

  // Increment counter for this area
  areaCounters[selectedArea]++;

  return {
    id: `bal-${selectedArea.replace(/[^a-zA-Z0-9]/g, '')}-${areaIndex}-${Math.random().toString(36).substr(2, 6)}`,
    secondaryId: secondaryId,
    version: version,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    createdBy: users[Math.floor(Math.random() * users.length)],
    createdTime: generateRandomDate(createdDate, createdDate),
    editedBy: users[Math.floor(Math.random() * users.length)],
    editedTime: generateRandomDate(editedDate, editedDate),
    locked: isLocked,
    lockedTime: isLocked ? generateRandomDate(new Date(2025, 8, 1), new Date()) : '',
    lockedBy: isLocked ? users[Math.floor(Math.random() * users.length)] : '',
    area: selectedArea,
    versions: generateVersions(version),
  };
};

// Function to generate data for a specific area
export const generateAreaData = (area: string, count: number): IBalise[] => {
  const config = areaConfig[area as keyof typeof areaConfig];
  if (!config) {
    throw new Error(`Invalid area: ${area}`);
  }

  // Reset counter for this area to ensure consistent secondaryIds
  const currentCounter = areaCounters[area];
  const items: IBalise[] = [];

  for (let i = 0; i < Math.min(count, config.count - currentCounter); i++) {
    items.push(generateBaliseItem(i, area));
  }

  return items;
};

// Function to generate batch of data (mixed areas)
export const generateBaliseData = (startIndex: number, count: number): IBalise[] => {
  return Array.from({ length: count }, (_, i) => generateBaliseItem(startIndex + i));
};

// Function to get all data for a specific area (useful for area filtering)
export const getAllAreaData = (area: string): IBalise[] => {
  const config = areaConfig[area as keyof typeof areaConfig];
  if (!config) {
    return [];
  }

  // Reset counter for this area
  areaCounters[area] = 0;
  return generateAreaData(area, config.count);
};

// Initial mock data - load some items from each area proportionally
const generateInitialData = (): IBalise[] => {
  const itemsPerArea = Math.floor(1000 / areas.length); // ~83 items per area initially
  const items: IBalise[] = [];

  areas.forEach((area) => {
    items.push(...generateAreaData(area, itemsPerArea));
  });

  return items;
};

export const mockData: IBalise[] = generateInitialData();
