import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda';
import { Balise, PrismaClient } from '../generated/prisma/client';
import { validateBaliseAdminUser } from './userService';
import { RataExtraUser } from './userService';

/**
 * Parse version parameter from query string parameters
 * @param queryStringParameters Query string parameters from the request
 * @returns Parsed version number or undefined if not provided or invalid
 */
export function parseVersionParameter(
  queryStringParameters?: APIGatewayProxyEventQueryStringParameters | null,
): number | undefined {
  const versionStr = queryStringParameters?.version;
  if (!versionStr) {
    return undefined;
  }

  const parsed = parseInt(versionStr, 10);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Validate that only admin users can specify version parameters
 * Read users must always use the default (latest OFFICIAL) version
 * @param user Current user
 * @param requestedVersion Version requested by user (or undefined)
 * @throws Error if non-admin user attempts to specify a version
 */
export function validateVersionParameterAccess(user: RataExtraUser, requestedVersion: number | undefined): void {
  // If no version requested, all users can proceed
  if (requestedVersion === undefined) {
    return;
  }

  // Version parameter provided - only admins can do this
  validateBaliseAdminUser(user);
}

/**
 * Get fileTypes array for a specific version
 * @param database Database client instance
 * @param baliseId Secondary ID of the balise
 * @param version Version number to retrieve
 * @param currentBalise Current balise object (used if version matches current)
 * @returns Object with fileTypes array, version number, and versionStatus
 * @throws Error with 404 status if version not found
 */
export async function getVersionFileTypes(
  database: PrismaClient,
  baliseId: number,
  version: number,
  currentBalise: Balise,
): Promise<{ fileTypes: string[]; version: number; versionStatus: string }> {
  // If requesting current version, return current balise fileTypes
  if (version === currentBalise.version) {
    return {
      fileTypes: currentBalise.fileTypes,
      version: currentBalise.version,
      versionStatus: currentBalise.versionStatus,
    };
  }

  // Otherwise, query version history
  const versionHistory = await database.baliseVersion.findFirst({
    where: {
      secondaryId: baliseId,
      version: version,
    },
  });

  if (!versionHistory) {
    const error = new Error(`Versiota ${version} ei löydy`) as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return {
    fileTypes: versionHistory.fileTypes,
    version: versionHistory.version,
    versionStatus: versionHistory.versionStatus,
  };
}

/**
 * Validate that a file exists in the version's fileTypes array
 * @param fileTypes Array of file names for this version
 * @param fileName File name to validate
 * @param version Version number for error message (optional)
 * @throws Error with 404 status if file not found
 */
export function validateFileInVersion(fileTypes: string[], fileName: string, version?: number): void {
  if (!fileTypes.includes(fileName)) {
    const error = version
      ? (new Error(`Tiedostoa '${fileName}' ei löydy versiolle ${version}`) as Error & { statusCode: number })
      : (new Error(`Tiedostoa '${fileName}' ei löydy tälle balisille`) as Error & { statusCode: number });
    error.statusCode = 404;
    throw error;
  }
}

/**
 * Determine which version to use for download
 * If no version requested and current version is UNCONFIRMED, find newest OFFICIAL version
 * @param database Database client instance
 * @param baliseId Secondary ID of the balise
 * @param requestedVersion Version explicitly requested by user (or undefined)
 * @param currentBalise Current balise object
 * @returns Version number to use for download
 * @throws Error with 404 status if no OFFICIAL version found
 */
export async function resolveDownloadVersion(
  database: PrismaClient,
  baliseId: number,
  requestedVersion: number | undefined,
  currentBalise: Balise,
): Promise<number> {
  // If user explicitly requested a version, use it
  if (requestedVersion !== undefined) {
    return requestedVersion;
  }

  // If current version is OFFICIAL, use it
  if (currentBalise.versionStatus === 'OFFICIAL') {
    return currentBalise.version;
  }

  // Current version is UNCONFIRMED, find newest OFFICIAL version from history
  const newestOfficialVersion = await database.baliseVersion.findFirst({
    where: {
      secondaryId: baliseId,
      versionStatus: 'OFFICIAL',
    },
    orderBy: {
      version: 'desc',
    },
  });

  if (!newestOfficialVersion) {
    const error = new Error(`Baliisille ${baliseId} ei löydy vahvistettua versiota`) as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  return newestOfficialVersion.version;
}
