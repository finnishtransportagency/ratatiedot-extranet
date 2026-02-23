import { VersionStatus } from './enums';

export interface Section {
  id: string;
  name: string;
  key: string;
  description?: string;
  idRangeMin: number;
  idRangeMax: number;
  active: boolean;
  createdBy: string;
  createdTime: string | Date;
  updatedBy?: string;
  updatedTime?: string | Date;
}

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
  lockReason?: string | null;
  deletedAt?: string | Date | null;
  deletedBy?: string | null;
}

// Extended interface that includes history for frontend usage
export interface BaliseWithHistory extends Balise {
  history: BaliseVersion[];
}
