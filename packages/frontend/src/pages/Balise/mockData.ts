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
  'TV5 2020',
  'TV5 2021',
  'TV5 2022',
  'TV5 2023',
  'TV5 2024',
  'ATB System',
  'ETCS Level 1',
  'ETCS Level 2',
  'Balise Group A',
  'Balise Group B',
  'Signal Point',
  'Speed Control',
  'Track Circuit',
  'Level Crossing',
  'Station Platform',
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

export const mockData: IBalise[] = Array.from({ length: 100 }, (_, index) => {
  const version = Math.floor(Math.random() * 5);
  const isLocked = Math.random() > 0.7; // 30% chance of being locked
  const createdDate = new Date(
    2020 + Math.floor(Math.random() * 5),
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1,
  );
  const editedDate = new Date(createdDate.getTime() + Math.random() * (new Date().getTime() - createdDate.getTime()));

  return {
    id: `bal-${Math.random().toString(36).substr(2, 9)}`,
    secondaryId: 10000 + index,
    version: version,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    createdBy: users[Math.floor(Math.random() * users.length)],
    createdTime: generateRandomDate(createdDate, createdDate),
    editedBy: users[Math.floor(Math.random() * users.length)],
    editedTime: generateRandomDate(editedDate, editedDate),
    locked: isLocked,
    lockedTime: isLocked ? generateRandomDate(new Date(2025, 8, 1), new Date()) : '',
    lockedBy: isLocked ? users[Math.floor(Math.random() * users.length)] : '',
    versions: generateVersions(version),
  };
});
