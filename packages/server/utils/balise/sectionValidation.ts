import { PrismaClient } from '../../generated/prisma/client';

export interface SectionData {
  name: string;
  sectionPrefix: number;
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
  if (!data.name || data.sectionPrefix === undefined) {
    return {
      isValid: false,
      error: 'Name and sectionPrefix are required',
      statusCode: 400,
    };
  }
  return { isValid: true };
}

export function validateSectionPrefix(sectionPrefix: number): ValidationResult {
  if (!Number.isInteger(sectionPrefix) || sectionPrefix < 1 || sectionPrefix > 99) {
    return {
      isValid: false,
      error: 'sectionPrefix must be an integer between 1 and 99',
      statusCode: 400,
    };
  }
  return { isValid: true };
}

export async function validateSectionPrefixUniqueness(
  database: PrismaClient,
  sectionPrefix: number,
  excludeId?: string,
): Promise<ValidationResult> {
  const whereClause = excludeId ? { sectionPrefix, id: { not: excludeId } } : { sectionPrefix };

  const existingSection = await database.section.findFirst({
    where: whereClause,
  });

  if (existingSection) {
    return {
      isValid: false,
      error: 'A section with this prefix already exists',
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
