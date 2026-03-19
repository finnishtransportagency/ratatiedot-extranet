import type { ALBEventQueryStringParameters } from 'aws-lambda';
import { Balise, BaliseVersion, PrismaClient, VersionStatus } from '../../generated/prisma/client';
import { RataExtraUser } from '../userService';
import { RataExtraLambdaError } from '../errors';

/**
 * Filter history array based on user permissions
 * Admins see full history, lock owners see lockedAtVersion and above, others see nothing
 * @param history Full history array
 * @param lockedAtVersion Version number when balise was locked
 * @param isLockOwner Whether the current user is the lock owner
 * @param isAdmin Whether the current user is an admin
 * @returns Filtered history array
 */
export function filterHistoryForUser(
  history: BaliseVersion[],
  lockedAtVersion: number | null,
  isLockOwner: boolean,
  isAdmin: boolean,
): BaliseVersion[] {
  if (isAdmin) return history;
  if (!isLockOwner) return [];
  if (lockedAtVersion === null) return [];
  return history.filter((v) => v.version >= lockedAtVersion);
}

/**
 * Parse version parameter from query string parameters
 * @param queryStringParameters Query string parameters from the request
 * @returns Parsed version number or undefined if not provided or invalid
 */
export function parseVersionParameter(queryStringParameters?: ALBEventQueryStringParameters): number | undefined {
  const versionStr = queryStringParameters?.version;
  if (!versionStr) {
    return undefined;
  }

  const parsed = parseInt(versionStr, 10);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Validate that only admin users and lock owners can specify version parameters
 * Read users must always use the default (latest OFFICIAL) version
 * @param user Current user
 * @param requestedVersion Version requested by user (or undefined)
 * @param balise Balise object (needed to check lock ownership)
 * @param isAdmin Whether the current user is an admin
 * @throws Error if unauthorized user attempts to specify a version
 */
export function validateVersionParameterAccess(
  user: RataExtraUser,
  requestedVersion: number | undefined,
  balise: Balise,
  isAdmin: boolean,
): void {
  // If no version requested, all users can proceed
  if (requestedVersion === undefined) {
    return;
  }

  // Admins can access any version
  if (isAdmin) {
    return;
  }

  // Check if user is the lock owner
  const isLockOwner = balise.locked && balise.lockedBy === user.uid;
  if (!isLockOwner) {
    throw new RataExtraLambdaError(
      'Vain järjestelmän ylläpitäjät ja lukituksen tehneet käyttäjät voivat ladata tiettyjä versioita',
      403,
    );
  }
}

/**
 * Validate that lock owner is only accessing versions from their lock session
 * Lock owners can access any version from when they locked the balise onwards
 * @param requestedVersion Version requested by lock owner
 * @param balise Current balise object
 * @throws Error if lock owner tries to access versions before their lock or versions that don't exist
 */
export function validateLockOwnerVersionAccess(requestedVersion: number, balise: Balise): void {
  // Lock owner can access any version from when they locked onwards (version >= lockedAtVersion)
  if (balise.lockedAtVersion === null || requestedVersion < balise.lockedAtVersion) {
    throw new RataExtraLambdaError('Voit ladata vain lukituksesi aikana lisättyjä versioita', 403);
  }
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
    throw new RataExtraLambdaError(`Versiota ${version} ei löydy`, 404);
  }

  return {
    fileTypes: versionHistory.fileTypes,
    version: versionHistory.version,
    versionStatus: versionHistory.versionStatus,
  };
}

/**
 * Resolve multiple balises to show latest OFFICIAL versions (optimized for bulk operations)
 * Admins and lock owners see UNCONFIRMED versions as-is
 * Other users see latest OFFICIAL version data from history
 * This function is optimized to fetch all OFFICIAL versions in a single query
 * @param database Database client instance
 * @param balises Array of balise objects
 * @param currentUserId Current user's UID (to check lock ownership)
 * @param isAdmin Whether the current user is an admin
 * @returns Array of balise objects (either original or resolved to latest OFFICIAL)
 */
export async function resolveBalisesForUser(
  database: PrismaClient,
  balises: Balise[],
  currentUserId?: string,
  isAdmin: boolean = false,
): Promise<Balise[]> {
  // Admins always see actual current versions (including UNCONFIRMED)
  if (isAdmin) {
    return balises;
  }

  // Separate OFFICIAL from UNCONFIRMED balises
  const officialBalises = balises.filter((b) => b.versionStatus === VersionStatus.OFFICIAL);
  const unconfirmedBalises = balises.filter((b) => b.versionStatus === VersionStatus.UNCONFIRMED);

  // Lock owners see their UNCONFIRMED versions as-is
  const lockOwnerBalises = unconfirmedBalises.filter((b) => b.locked && b.lockedBy === currentUserId);
  const otherUnconfirmedBalises = unconfirmedBalises.filter((b) => !b.locked || b.lockedBy !== currentUserId);

  // If no UNCONFIRMED balises (excluding lock owner's), return as-is
  if (otherUnconfirmedBalises.length === 0) {
    return balises;
  }

  // Fetch all OFFICIAL versions for UNCONFIRMED balises (excluding lock owner's) in one query
  const unconfirmedIds = otherUnconfirmedBalises.map((b) => b.secondaryId);
  const officialVersions = await database.baliseVersion.findMany({
    where: {
      secondaryId: { in: unconfirmedIds },
      versionStatus: VersionStatus.OFFICIAL,
    },
    orderBy: {
      version: 'desc',
    },
  });

  // Group by secondaryId and take the highest version (first due to desc order)
  const officialVersionsMap = new Map<number, (typeof officialVersions)[0]>();
  for (const version of officialVersions) {
    if (!officialVersionsMap.has(version.secondaryId)) {
      officialVersionsMap.set(version.secondaryId, version);
    }
  }

  // Resolve each UNCONFIRMED balise (non-lock-owner) to its OFFICIAL version
  const resolvedUnconfirmed = otherUnconfirmedBalises.map((balise) => {
    const officialVersion = officialVersionsMap.get(balise.secondaryId);
    if (!officialVersion) {
      // If no OFFICIAL version found, throw error (non-admins should never see UNCONFIRMED)
      const error = new Error(`Baliisille ${balise.secondaryId} ei löydy vahvistettua versiota`) as Error & {
        statusCode: number;
      };
      error.statusCode = 404;
      throw error;
    }

    // Return the official version data
    return {
      ...balise,
      version: officialVersion.version,
      versionStatus: officialVersion.versionStatus,
      description: officialVersion.description,
      fileTypes: officialVersion.fileTypes,
      createdBy: officialVersion.createdBy,
      createdTime: officialVersion.createdTime,
    };
  });

  // Combine all: OFFICIAL balises, lock owner's UNCONFIRMED balises, and resolved OFFICIAL versions
  const result = [...officialBalises, ...lockOwnerBalises, ...resolvedUnconfirmed];
  result.sort((a, b) => a.secondaryId - b.secondaryId);

  return result;
}
