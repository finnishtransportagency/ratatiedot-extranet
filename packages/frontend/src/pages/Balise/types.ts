export interface Section {
  id: string;
  name: string;
  shortName: string;
  key: string;
  description?: string;
  idRangeMin: number;
  idRangeMax: number;
  color?: string;
  active: boolean;
  createdBy: string;
  createdTime: string | Date;
  updatedBy?: string;
  updatedTime?: string | Date;
}

export type VersionStatus = 'OFFICIAL' | 'UNCONFIRMED';

export interface BaliseVersion {
  id: string;
  baliseId: string;
  secondaryId: number;
  version: number;
  versionStatus: VersionStatus;
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
  versionStatus: VersionStatus;
  description: string;
  fileTypes: string[];
  history: BaliseVersion[];
  createdBy: string;
  createdTime: string | Date;
  locked: boolean;
  lockedBy?: string | null;
  lockedTime?: string | Date | null;
  lockedAtVersion?: number | null;
  deletedAt?: string | Date | null;
  deletedBy?: string | null;
}

// Extended interface that includes history for frontend usage
export interface BaliseWithHistory extends Balise {
  history: BaliseVersion[];
}
