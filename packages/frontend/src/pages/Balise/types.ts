import { Balise as PrismaBalise, BaliseVersion } from '@prisma/client';

export interface Area {
  id: string;
  name: string;
  shortName: string;
  key: string;
  idRangeMin: number;
  idRangeMax: number;
}

// We rename the imported Balise to avoid conflicts
// And we override the types for date fields to allow for string representation from JSON
export interface Balise extends Omit<PrismaBalise, 'createdTime' | 'lockedTime' | 'history'> {
  createdTime: string | Date;
  lockedTime?: string | Date | null;
}

// Extended interface that includes history for frontend usage
export interface BaliseWithHistory extends Balise {
  history: BaliseVersion[];
}

// Legacy interfaces for backward compatibility
export interface IBalise extends Balise {}
export interface IBaliseVersion extends BaliseVersion {}
