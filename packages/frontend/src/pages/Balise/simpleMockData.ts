export interface IBalise {
  id: string;
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
  area: string;
  versions?: Revision[];
}

export interface Revision {
  id: string;
  version: number;
  description: string;
  createdBy: string;
  createdTime: string;
}

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

const descriptions = [
  'Raideopastin tarkistettu',
  'Nopeusvalvonta päivitetty',
  'Turvalaite huollettu',
  'Balise-ryhmä kalibroitu',
  'ETCS-järjestelmä päivitetty',
  'Tasoristeysopastin huollettu',
  'Junankulunvalvonta kalibroitu',
  'Liikennepaikan opastin päivitetty',
  'Raidepuskurin turvalaite tarkistettu',
  'Sähköturvajärjestelmä huollettu',
  'Kulunvalvonta-anturi kalibroitu',
  'Automaattinen junanhallinta päivitetty',
  'Vaihdetunnistin tarkistettu',
  'Radiotaajuusbalise huollettu',
  'Turvallinen jarrutusetäisyys laskettu',
  'Liikkuva lohko määritetty',
  'Pysähdysopastin asennettu',
  'Raiteen valvontajärjestelmä päivitetty',
  'ETCS-tason 1 balise kalibroitu',
  'ETCS-tason 2 balise päivitetty',
  'ATP-järjestelmä tarkistettu',
  'Ratakohtainen nopeusvalvonta',
  'Balise-antenni huollettu',
  'LEU-yksikkö päivitetty',
  'RBC-yhteys tarkistettu',
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
  'LX000016',
  'LX000017',
  'LX000018',
  'LX000019',
  'LX000020',
];

// Function to generate version history for an item
const generateVersionHistory = (currentVersion: number, itemIndex: number): Revision[] => {
  const versions: Revision[] = [];

  for (let v = 0; v <= currentVersion; v++) {
    versions.push({
      id: `rev-${itemIndex}-${v}`,
      version: v,
      description: descriptions[(itemIndex + v) % descriptions.length],
      createdBy: users[(itemIndex + v) % users.length],
      createdTime: `${15 + v}.9.2024 ${10 + v}:${30 + ((v * 15) % 60)}`,
    });
  }

  return versions;
};

// Random date generator
const generateRandomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return (
    date.toLocaleDateString('fi-FI') + ' ' + date.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })
  );
};

// Simple function to create a single item with area-specific secondaryId
const createBaliseItem = (index: number, areaIndex?: number): IBalise => {
  const selectedAreaIndex = areaIndex !== undefined ? areaIndex : index % areas.length;
  const area = areas[selectedAreaIndex];

  // Calculate area-specific secondaryId ranges
  const areaConfig = {
    'Alue 1 Uusimaa': { startId: 10000, maxItems: 8333 },
    'Alue 2 Lounaisrannikko': { startId: 18333, maxItems: 8333 },
    'Alue 3 (Riihimäki)-Kokkola': { startId: 26666, maxItems: 8333 },
    'Alue 4 Rauma- (Pieksämäki)': { startId: 34999, maxItems: 8333 },
    'Alue 5 Haapamäen tähti': { startId: 43332, maxItems: 8333 },
    'Alue 6 Savon rata': { startId: 51665, maxItems: 8333 },
    'Alue 7 Karjalan rata': { startId: 59998, maxItems: 8333 },
    'Alue 8 Yläsavo': { startId: 68331, maxItems: 8333 },
    'Alue 9 Pohjanmaan rata': { startId: 76664, maxItems: 8333 },
    'Alue 10 Keski-Suomi': { startId: 84997, maxItems: 8333 },
    'Alue 11 Kainuu-Oulu': { startId: 93330, maxItems: 6669 },
    'Alue 12 Oulu-Lappi': { startId: 99999, maxItems: 1 },
  };

  const config = areaConfig[area as keyof typeof areaConfig] || { startId: 10000, maxItems: 1000 };
  const areaItemIndex =
    Math.floor(index / areas.length) +
    (index % areas.length === selectedAreaIndex ? Math.floor(index / areas.length) : 0);
  const secondaryId = config.startId + (areaItemIndex % config.maxItems);

  const version = Math.floor(Math.random() * 5); // 0-4 versions
  const createdDate = generateRandomDate(new Date(2020, 0, 1), new Date(2024, 8, 1));
  const editedDate = generateRandomDate(new Date(2024, 8, 1), new Date());
  const isLocked = Math.random() > 0.85; // 15% chance of being locked

  return {
    id: `bal-${index}`,
    secondaryId: secondaryId,
    version: version,
    description: descriptions[index % descriptions.length],
    createdBy: users[index % users.length],
    createdTime: createdDate,
    editedBy: users[(index + 1) % users.length],
    editedTime: editedDate,
    locked: isLocked,
    lockedTime: isLocked ? generateRandomDate(new Date(2024, 8, 15), new Date()) : '',
    lockedBy: isLocked ? users[index % users.length] : '',
    area: area,
    versions: generateVersionHistory(version, index),
  };
};

// Create initial data (first 1000 items for fast loading, more available via infinite scroll)
export const mockData: IBalise[] = Array.from({ length: 1000 }, (_, i) => createBaliseItem(i));

// Simple functions for compatibility
export const generateBaliseData = (startIndex: number, count: number): IBalise[] => {
  return Array.from({ length: count }, (_, i) => createBaliseItem(startIndex + i));
};

export const getAllAreaData = (area: string): IBalise[] => {
  // Generate all data for a specific area (up to area's max items)
  const areaIndex = areas.indexOf(area);
  if (areaIndex === -1) return [];

  const maxItemsPerArea = Math.floor(99999 / areas.length);
  const areaItems: IBalise[] = [];

  for (let i = 0; i < maxItemsPerArea; i++) {
    const globalIndex = i * areas.length + areaIndex;
    if (globalIndex < 99999) {
      areaItems.push(createBaliseItem(globalIndex, areaIndex));
    }
  }

  return areaItems;
};

export const areaConfig = {
  'Alue 1 Uusimaa': { startId: 10000, count: 8333 },
  'Alue 2 Lounaisrannikko': { startId: 18333, count: 8333 },
  'Alue 3 (Riihimäki)-Kokkola': { startId: 26666, count: 8333 },
  'Alue 4 Rauma- (Pieksämäki)': { startId: 34999, count: 8333 },
  'Alue 5 Haapamäen tähti': { startId: 43332, count: 8333 },
  'Alue 6 Savon rata': { startId: 51665, count: 8333 },
  'Alue 7 Karjalan rata': { startId: 59998, count: 8333 },
  'Alue 8 Yläsavo': { startId: 68331, count: 8333 },
  'Alue 9 Pohjanmaan rata': { startId: 76664, count: 8333 },
  'Alue 10 Keski-Suomi': { startId: 84997, count: 8333 },
  'Alue 11 Kainuu-Oulu': { startId: 93330, count: 6669 },
  'Alue 12 Oulu-Lappi': { startId: 99999, count: 1 },
};

export const TOTAL_ITEMS_COUNT = 99999;
