/**
 * Balise file validation utilities for frontend
 * Mirrors validation constants and logic from packages/server/utils/baliseUtils.ts
 */

// Validation constants - must match backend
export const VALID_EXTENSIONS = ['.il', '.leu', '.bis'];
export const MIN_BALISE_ID = 10000;
export const MAX_BALISE_ID = 99999;

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
 * Valid range: 10000-99999
 */
export function isValidBaliseIdRange(baliseId: number): boolean {
  return baliseId >= MIN_BALISE_ID && baliseId <= MAX_BALISE_ID;
}

/**
 * Parse balise ID from filename
 * Only allows format: {ID}.ext or {ID}K.ext (K suffix only, case insensitive)
 * Examples:
 *   "10000.il" → 10000
 *   "10000.leu" → 10000
 *   "12345.bis" → 12345
 *   "10000K.il" → 10000
 *   "10000k.LEU" → 10000
 *   "10000X.il" → null (invalid - only K allowed)
 */
export function parseBaliseIdFromFilename(filename: string): number | null {
  // Match: digits, optionally followed by K/k, then a dot and extension
  // This ensures only K suffix is allowed after the ID
  const match = filename.match(/^(\d+)[Kk]?\.(il|leu|bis)$/i);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  return isNaN(id) ? null : id;
}

/**
 * Check if filename has valid format (ID with optional K suffix + valid extension)
 * Returns false if there are invalid characters between ID and extension
 */
export function isValidFilenameFormat(filename: string): boolean {
  // Valid format: {digits}{optional K/k}.{il|leu|bis} (case insensitive for extension)
  return /^(\d+)[Kk]?\.(il|leu|bis)$/i.test(filename);
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
      errors.push('Virheellinen tiedostonimi. Sallittu muoto: {ID}.pääte tai {ID}K.pääte');
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
