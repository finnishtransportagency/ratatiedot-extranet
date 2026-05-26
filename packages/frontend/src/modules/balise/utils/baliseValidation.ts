/**
 * Balise file validation utilities for frontend
 * Mirrors validation constants and logic from packages/server/utils/baliseUtils.ts
 */

import type { Section } from '../types/baliseTypes';

// Validation constants - must match backend
export const VALID_EXTENSIONS = ['.il', '.leu', '.bis'];
export const MIN_BALISE_ID = 9000;
export const MAX_BALISE_ID = 99999;

/**
 * Find the section that a balise ID belongs to based on ID ranges
 * @param baliseId The balise's secondary ID
 * @param sections Array of sections to search
 * @returns The matching section or undefined if not found
 */
export function getSectionForBaliseId(baliseId: number, sections: Section[]): Section | undefined {
  if (!baliseId || !sections || sections.length === 0) return undefined;
  return sections.find((section) => baliseId >= section.idRangeMin && baliseId <= section.idRangeMax);
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate file extension
 * Valid extensions: .il, .leu, .bis
 * Case insensitive because Windows and macOS filesystems are case insensitive
 */
export function isValidExtension(filename: string): boolean {
  const lowerFilename = filename.toLowerCase();
  return VALID_EXTENSIONS.some((ext) => lowerFilename.endsWith(ext));
}

/**
 * Validate balise ID range
 * Valid range: 9000-99999
 */
export function isValidBaliseIdRange(baliseId: number): boolean {
  return baliseId >= MIN_BALISE_ID && baliseId <= MAX_BALISE_ID;
}

/**
 * Parse balise ID from filename
 * Supports both 5-digit and 4-digit (9000-9999) balise IDs.
 * - 5-digit IDs: suffix can be K/k or a single digit 0-9
 * - 4-digit IDs: suffix can only be K/k (digit suffix would be ambiguous with 5-digit IDs)
 *
 * 5-digit match is attempted first to avoid ambiguity (e.g. "90001.il" → 90001, not 9000).
 *
 * Examples:
 *   "10000.il" → 10000
 *   "12345.bis" → 12345
 *   "10000K.il" → 10000
 *   "100034.il" → 10003
 *   "9000.il" → 9000
 *   "9001K.leu" → 9001
 *   "90001.il" → 90001 (5-digit takes priority)
 *   "10000X.il" → null (invalid suffix)
 */
export function parseBaliseIdFromFilename(filename: string): number | null {
  // Try 5-digit match first: exactly 5 digits, optionally followed by K/k or a single digit
  const match5 = filename.match(/^(\d{5})[Kk\d]?\.(il|leu|bis)$/i);
  if (match5) {
    const id = parseInt(match5[1], 10);
    return isNaN(id) ? null : id;
  }
  // Fall back to 4-digit match: exactly 4 digits, optionally followed by K/k only (no digit suffix)
  const match4 = filename.match(/^(\d{4})[Kk]?\.(il|leu|bis)$/i);
  if (match4) {
    const id = parseInt(match4[1], 10);
    return isNaN(id) ? null : id;
  }
  return null;
}

/**
 * Check if filename has valid format:
 * - 5-digit ID with optional K/digit suffix + valid extension
 * - 4-digit ID (9000-9999) with optional K suffix only + valid extension
 * Returns false if there are invalid characters between ID and extension
 */
export function isValidFilenameFormat(filename: string): boolean {
  // Valid formats: {5 digits}{optional K/k or digit} OR {4 digits}{optional K/k} followed by .{il|leu|bis}
  return /^(\d{5}[Kk\d]?|\d{4}[Kk]?)\.(il|leu|bis)$/i.test(filename);
}

/**
 * Get human-readable extension list for error messages
 */
export function getValidExtensionsList(): string {
  return VALID_EXTENSIONS.join(', ');
}

/**
 * Validate a balise file for single upload
 * Checks:
 * 1. File has valid filename format ({ID} or {ID}K followed by valid extension)
 * 2. File has valid extension (.il, .leu, .bis)
 * 3. Balise ID in filename matches target balise ID
 *
 * @param filename - The filename to validate
 * @param targetBaliseId - The balise ID the file should belong to
 * @returns ValidationResult with valid flag and error messages
 */
export function validateBaliseFile(filename: string, targetBaliseId: number): ValidationResult {
  const errors: string[] = [];

  // Check filename format first (includes extension and K-only suffix validation)
  if (!isValidFilenameFormat(filename)) {
    // Determine specific error
    if (!isValidExtension(filename)) {
      errors.push(`Virheellinen tiedostopääte. Sallitut päätteet: ${getValidExtensionsList()}`);
    } else {
      // Extension is valid but format is wrong (invalid characters between ID and extension)
      errors.push('Virheellinen tiedostonimi. Sallittu muoto: {ID}.pääte, {ID}K.pääte tai {ID}N.pääte (N=0-9)');
    }
    return { valid: false, errors };
  }

  // Format is valid, now check balise ID match
  const fileBaliseId = parseBaliseIdFromFilename(filename);
  if (fileBaliseId === null) {
    errors.push('Tiedostonimestä ei löydy baliisi-ID:tä');
  } else if (fileBaliseId !== targetBaliseId) {
    errors.push(`Tiedoston baliisi-ID (${fileBaliseId}) ei vastaa kohteen ID:tä (${targetBaliseId})`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate multiple files for single balise upload
 * Returns valid files and error details for invalid files
 */
export function validateBaliseFiles(
  files: File[],
  targetBaliseId: number,
): {
  validFiles: File[];
  invalidFiles: { file: File; errors: string[] }[];
} {
  const validFiles: File[] = [];
  const invalidFiles: { file: File; errors: string[] }[] = [];

  for (const file of files) {
    const result = validateBaliseFile(file.name, targetBaliseId);
    if (result.valid) {
      validFiles.push(file);
    } else {
      invalidFiles.push({ file, errors: result.errors });
    }
  }

  return { validFiles, invalidFiles };
}
