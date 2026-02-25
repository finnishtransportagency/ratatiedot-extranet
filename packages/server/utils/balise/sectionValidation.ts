import { PrismaClient } from '../../generated/prisma/client';

export interface SectionData {
  name: string;
  idRangeMin: number;
  idRangeMax: number;
  description?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  statusCode?: number;
}

export function generateKeyFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9äöå]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function validateRequiredFields(data: Partial<SectionData>): ValidationResult {
  if (!data.name || data.idRangeMin === undefined || data.idRangeMax === undefined) {
    return {
      isValid: false,
      error: 'Name, idRangeMin, and idRangeMax are required',
      statusCode: 400,
    };
  }
  return { isValid: true };
}

export function validateIdRange(idRangeMin: number, idRangeMax: number): ValidationResult {
  if (idRangeMin < 0 || idRangeMax < 0) {
    return {
      isValid: false,
      error: 'ID ranges must be non-negative',
      statusCode: 400,
    };
  }
  if (idRangeMin >= idRangeMax) {
    return {
      isValid: false,
      error: 'idRangeMin must be less than idRangeMax',
      statusCode: 400,
    };
  }
  return { isValid: true };
}

export async function validateNameUniqueness(
  database: PrismaClient,
  name: string,
  excludeId?: string,
): Promise<ValidationResult> {
  const whereClause = excludeId ? { name, id: { not: excludeId } } : { name };

  const existingNameSection = await database.section.findFirst({
    where: whereClause,
  });

  if (existingNameSection) {
    return {
      isValid: false,
      error: 'Section name already exists',
      statusCode: 400,
    };
  }

  return { isValid: true };
}

export async function validateKeyUniqueness(
  database: PrismaClient,
  key: string,
  excludeId?: string,
): Promise<ValidationResult> {
  const whereClause = excludeId ? { key, id: { not: excludeId } } : { key };

  const existingKeySection = await database.section.findFirst({
    where: whereClause,
  });

  if (existingKeySection) {
    return {
      isValid: false,
      error: 'A section with this name (key) already exists',
      statusCode: 400,
    };
  }

  return { isValid: true };
}

export function createErrorResponse(error: string, statusCode: number = 400) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error }),
  };
}
