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
 * Validate user access for the requested version
 * Requires admin access for historical versions (not current version)
 * @param user Current user
 * @param requestedVersion Version requested by user (or undefined for current)
 * @param currentVersion Current version of the balise
 * @throws Error if user lacks required permissions
 */
export function validateVersionAccess(
  user: RataExtraUser,
  requestedVersion: number | undefined,
  currentVersion: number,
): void {
  // If requesting a historical version (not current), require admin access
  if (requestedVersion !== undefined && requestedVersion !== currentVersion) {
    validateBaliseAdminUser(user);
  }
}

/**
 * Get fileTypes array for a specific version
 * @param database Database client instance
 * @param baliseId Secondary ID of the balise
 * @param version Version number to retrieve
 * @param currentBalise Current balise object (used if version matches current)
 * @returns Object with fileTypes array and version number
 * @throws Error with 404 status if version not found
 */
export async function getVersionFileTypes(
  database: PrismaClient,
  baliseId: number,
  version: number,
  currentBalise: Balise,
): Promise<{ fileTypes: string[]; version: number }> {
  // If requesting current version, return current balise fileTypes
  if (version === currentBalise.version) {
    return {
      fileTypes: currentBalise.fileTypes,
      version: currentBalise.version,
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
