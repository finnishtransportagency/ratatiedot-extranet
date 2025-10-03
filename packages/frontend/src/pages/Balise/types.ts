export interface Balise {
  id: string;
  secondaryId: number;
  version: number;
  description: string;
  bucketId: string;
  fileTypes: string[];
  createdBy: string;
  createdTime: Date | string;
  locked: boolean;
  lockedBy?: string | null;
  lockedTime?: Date | string | null;
  deletedAt?: Date | string | null;
  deletedBy?: string | null;
  history?: BaliseVersion[];
}

export interface BaliseVersion {
  id: string;
  baliseId: string;
  secondaryId: number;
  version: number;
  description: string;
  bucketId: string;
  fileTypes: string[];
  createdBy: string;
  createdTime: Date | string;
  locked: boolean;
  lockedBy?: string | null;
  lockedTime?: Date | string | null;
  versionCreatedTime: Date | string;
}

export interface Area {
  id: string;
  key: string;
  name: string;
  shortName: string;
  description?: string | null;
  idRangeMin: number;
  idRangeMax: number;
  color?: string | null;
  active: boolean;
  createdBy: string;
  createdTime: Date | string;
  updatedBy?: string | null;
  updatedTime?: Date | string | null;
}

export interface BaliseFilters {
  searchTerm: string;
  selectedArea: string | null;
}

export interface AreaConfig {
  key: string;
  name: string;
  shortName: string;
}

// Extended interface that includes history for frontend usage
export interface BaliseWithHistory extends Balise {
  history: BaliseVersion[];
}

// Legacy interfaces for backward compatibility
export interface IBalise extends Balise {}
export interface IBaliseVersion extends BaliseVersion {}
