import type { ALBEventQueryStringParameters } from 'aws-lambda';
import { Balise, BaliseVersion, PrismaClient, VersionStatus } from '../../generated/prisma/client';
import { RataExtraUser } from '../userService';
import { RataExtraLambdaError } from '../errors';
import { log } from '../logger';

/**
 * Filter history array based on user permissions
 * Admins and the lock owner see full history. Others see the OFFICIAL baseline as the current version,
 * so their history stops below it.
 * @param history Full history array
 * @param balise Current balise (version and lockedAtVersion define the OFFICIAL baseline)
 * @param isLockOwner Whether the current user is the lock owner
 * @param canViewUnconfirmed Whether the current user has the viewUnconfirmed capability
 * @returns Filtered history array
 */
export function filterHistoryForUser(
  history: BaliseVersion[],
  balise: Pick<Balise, 'version' | 'lockedAtVersion'>,
  isLockOwner: boolean,
  canViewUnconfirmed: boolean,
): BaliseVersion[] {
  if (canViewUnconfirmed || isLockOwner) return history;
  const baseline = balise.lockedAtVersion ?? balise.version;
  return history.filter((v) => v.version < baseline);
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
 * Validate that only users with viewHistory can specify version parameters
 * Read-only users must always use the default (latest OFFICIAL) version
 * @param user Current user
 * @param requestedVersion Version requested by user (or undefined)
 * @param canViewHistory Whether the current user has the viewHistory capability
 * @throws Error if unauthorized user attempts to specify a version
 */
export function validateVersionParameterAccess(
  user: RataExtraUser,
  requestedVersion: number | undefined,
  canViewHistory: boolean,
): void {
  if (requestedVersion === undefined || canViewHistory) {
    return;
  }

  log.warn({ userId: user.uid, requestedVersion }, 'Version access denied: user cannot view history');
  throw new RataExtraLambdaError(
    'Vain käyttäjät joilla on oikeus versiohistoriaan voivat ladata tiettyjä versioita',
    403,
  );
}

/**
 * Validate access to a resolved version: UNCONFIRMED versions are only available to
 * users with viewUnconfirmed and to the lock owner.
 * @param user Current user
 * @param balise Current balise object (needed to check lock ownership)
 * @param version Version number being accessed
 * @param versionStatus Status of the version being accessed
 * @param canViewUnconfirmed Whether the current user has the viewUnconfirmed capability
 * @throws Error with 403 status if access is denied
 */
export function validateVersionStatusAccess(
  user: RataExtraUser,
  balise: Balise,
  version: number,
  versionStatus: string,
  canViewUnconfirmed: boolean,
): void {
  if (versionStatus !== VersionStatus.UNCONFIRMED || canViewUnconfirmed) {
    return;
  }

  const isLockOwner = balise.locked && balise.lockedBy === user.uid;
  if (!isLockOwner) {
    log.warn(
      { userId: user.uid, baliseId: balise.secondaryId, version },
      'Version access denied: unconfirmed version requires admin or lock owner',
    );
    throw new RataExtraLambdaError(
      'Vain järjestelmän ylläpitäjät ja lukituksen tehneet käyttäjät voivat ladata luonnosversioita',
      403,
    );
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
    log.warn({ baliseId, version }, 'Requested balise version not found');
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
 * Users with viewUnconfirmed and lock owners see UNCONFIRMED versions as-is
 * Other users see latest OFFICIAL version data from history
 * This function is optimized to fetch all OFFICIAL versions in a single query
 * @param database Database client instance
 * @param balises Array of balise objects
 * @param currentUserId Current user's UID (to check lock ownership)
 * @param canViewUnconfirmed Whether the current user has the viewUnconfirmed capability
 * @returns Array of balise objects (either original or resolved to latest OFFICIAL)
 */
export async function resolveBalisesForUser(
  database: PrismaClient,
  balises: Balise[],
  currentUserId?: string,
  canViewUnconfirmed: boolean = false,
): Promise<Balise[]> {
  if (canViewUnconfirmed) {
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

/**
 * Compute the latest official version edit time for balises.
 * - OFFICIAL balises: latestOfficialEditTime = createdTime (current version IS the official one)
 * - UNCONFIRMED balises: use lockedAtVersion to look up the exact official version's createdTime
 * @param database Prisma client
 * @param balises Array of balise objects (already resolved or raw)
 * @returns The same balises with `latestOfficialEditTime` attached
 */
export async function getLatestOfficialEditTimes(
  database: PrismaClient,
  balises: Balise[],
): Promise<(Balise & { latestOfficialEditTime: Date })[]> {
  const unconfirmedBalises = balises.filter(
    (b) => b.versionStatus !== VersionStatus.OFFICIAL && b.lockedAtVersion != null,
  );

  // Use lockedAtVersion to query the exact official version for each
  const officialEditTimeMap = new Map<number, Date>();
  if (unconfirmedBalises.length > 0) {
    const officialVersions = await database.baliseVersion.findMany({
      where: {
        OR: unconfirmedBalises.map((b) => ({
          secondaryId: b.secondaryId,
          version: b.lockedAtVersion!,
        })),
      },
    });

    for (const version of officialVersions) {
      officialEditTimeMap.set(version.secondaryId, version.createdTime);
    }
  }

  // For each balise: if OFFICIAL, use its createdTime; otherwise use the looked-up time
  return balises.map((b) => ({
    ...b,
    latestOfficialEditTime:
      b.versionStatus === VersionStatus.OFFICIAL
        ? b.createdTime
        : (officialEditTimeMap.get(b.secondaryId) ?? b.createdTime),
  }));
}
