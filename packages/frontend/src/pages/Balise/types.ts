export interface Area {
  id: string;
  name: string;
  shortName: string;
  key: string;
  idRangeMin: number;
  idRangeMax: number;
}

export interface BaliseVersion {
  id: string;
  baliseId: string;
  secondaryId: number;
  version: number;
  description: string;
  fileTypes: string[];
  createdBy: string;
  createdTime: string | Date;
  locked: boolean;
  lockedBy?: string | null;
  lockedTime?: string | Date | null;
  versionCreatedTime: string | Date;
}

export interface Balise {
  id: string;
  secondaryId: number;
  version: number;
  description: string;
  fileTypes: string[];
  history: BaliseVersion[];
  createdBy: string;
  createdTime: string | Date;
  locked: boolean;
  lockedBy?: string | null;
  lockedTime?: string | Date | null;
  deletedAt?: string | Date | null;
  deletedBy?: string | null;
}

// Extended interface that includes history for frontend usage
export interface BaliseWithHistory extends Balise {
  history: BaliseVersion[];
}

// Legacy interfaces for backward compatibility
export interface IBalise extends Balise {}
export interface IBaliseVersion extends BaliseVersion {}
