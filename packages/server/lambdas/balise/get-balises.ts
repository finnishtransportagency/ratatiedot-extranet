import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser } from '../../utils/userService';
import { validateBaliseCapability, hasBaliseCapability } from '../../utils/balise/balisePermissions';
import { DatabaseClient } from '../database/client';
import { Prisma, VersionStatus } from '../../generated/prisma/client';
import { resolveBalisesForUser, getLatestOfficialEditTimes } from '../../utils/balise/baliseVersionUtils';

// Helper to safely get a string query parameter
const getQueryParam = (event: ALBEvent, key: string, defaultValue?: string): string | undefined =>
  event.queryStringParameters?.[key] ?? defaultValue;

// Helper to parse a single number query parameter with default
const getQueryParamAsInt = (event: ALBEvent, key: string, defaultValue?: number): number => {
  const value = getQueryParam(event, key);
  if (!value) return defaultValue ?? 0;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? (defaultValue ?? 0) : parsed;
};

// Helper to parse a single or comma-separated list of numbers
const getQueryParamAsIntArray = (event: ALBEvent, key: string): number[] => {
  const value = getQueryParam(event, key);
  if (!value) return [];
  return decodeURIComponent(value)
    .split(',')
    .map((v) => parseInt(v, 10))
    .filter((n) => !isNaN(n));
};

// Helper to get multiple ranges from query parameters
const getMultipleRangesFromParams = (event: ALBEvent) => {
  const mins = getQueryParamAsIntArray(event, 'id_min');
  const maxs = getQueryParamAsIntArray(event, 'id_max');

  return mins
    .map((min, i) => ({ min, max: maxs[i] }))
    .filter(({ min, max }) => min <= max && max !== undefined)
    .map(({ min, max }) => ({
      AND: [{ secondaryId: { gte: min } }, { secondaryId: { lte: max } }],
    }));
};

const database = await DatabaseClient.build();

// Mirrors resolveBalisesForUser: non-admins see the latest OFFICIAL version's description/createdBy
// for UNCONFIRMED balises they don't hold the lock on.
const buildSearchWhere = async (
  search: string,
  userId: string,
  canViewHistory = false,
): Promise<Prisma.BaliseWhereInput> => {
  const textMatch: Prisma.BaliseWhereInput[] = [
    { description: { contains: search, mode: 'insensitive' } },
    { createdBy: { contains: search, mode: 'insensitive' } },
  ];

  const conditions: Prisma.BaliseWhereInput[] = [{ lockedBy: { contains: search, mode: 'insensitive' } }];

  if (/^\d+$/.test(search)) {
    const idMatches = await database.$queryRaw<{ secondaryId: number }[]>`
      SELECT "secondaryId" FROM "Balise" WHERE CAST("secondaryId" AS TEXT) LIKE ${`%${search}%`}`;
    if (idMatches.length > 0) {
      conditions.push({ secondaryId: { in: idMatches.map((r) => r.secondaryId) } });
    }
  }

  if (canViewHistory) {
    conditions.push(...textMatch);
  } else {
    conditions.push(
      { versionStatus: VersionStatus.OFFICIAL, OR: textMatch },
      { locked: true, lockedBy: userId, OR: textMatch },
      {
        versionStatus: VersionStatus.UNCONFIRMED,
        history: {
          some: {
            versionStatus: VersionStatus.OFFICIAL,
            OR: [
              { description: { contains: search, mode: 'insensitive' } },
              { createdBy: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
    );
  }

  return { OR: conditions };
};

/**
 * Get an array of balises. Example request: /api/balises?id_min=14000,22000&id_max=14999,23999&page=1&limit=100
 * @param {ALBEvent} event
 * @param {{QueryRequest}} event.body JSON stringified
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    log.info(user, `Get all balises. params: ${JSON.stringify(event.queryStringParameters)}`);

    validateBaliseCapability(user, 'read');

    const canViewHistory = hasBaliseCapability(user, 'viewHistory');

    // Get pagination parameters
    const page = getQueryParamAsInt(event, 'page', 1) ?? 1;
    const limit = getQueryParamAsInt(event, 'limit', 1000) ?? 1000; // Default to 1000 items per page
    const skip = (page - 1) * limit;

    // Limit maximum page size to prevent memory issues
    const maxLimit = 5000;
    const effectiveLimit = Math.min(limit, maxLimit);

    // Handle specific IDs filter (for bulk upload preview)
    const specificIds = getQueryParamAsIntArray(event, 'ids');

    // Handle multiple ranges for secondaryId filtering
    const ranges = getMultipleRangesFromParams(event);

    // Build where clause based on query parameters
    let whereClause: Prisma.BaliseWhereInput;
    if (specificIds.length > 0) {
      // Filter by specific IDs
      whereClause = {
        secondaryId: { in: specificIds },
      };
    } else if (ranges.length > 0) {
      // Filter by ranges
      whereClause = {
        OR: ranges,
      };
    } else {
      // Default filter
      whereClause = {};
    }

    const rawSearch = (getQueryParam(event, 'search') ?? '').replace(/\+/g, ' ');
    let search: string;
    try {
      search = decodeURIComponent(rawSearch).trim();
    } catch {
      search = rawSearch.trim();
    }
    if (search) {
      whereClause = { AND: [whereClause, await buildSearchWhere(search, user.uid, canViewHistory)] };
    }

    // Get total count for pagination info
    const totalCount = await database.balise.count({
      where: whereClause,
    });

    const includeHistory = canViewHistory && getQueryParam(event, 'include_history') === 'true';

    // Sort: temporary balises (isTemporary=true, secondaryId starts with 9) appear at the end,
    // otherwise numeric ascending. Relies on the isTemporary generated column in the DB.
    const balises = await database.balise.findMany({
      where: whereClause,
      orderBy: [{ isTemporary: 'asc' }, { secondaryId: 'asc' }],
      skip,
      take: effectiveLimit,
      include: includeHistory
        ? {
            history: {
              orderBy: {
                version: 'asc' as const,
              },
            },
          }
        : undefined,
    });

    // Resolve balises to latest OFFICIAL versions efficiently (unless user can view history or is lock owner)
    const resolvedBalises = await resolveBalisesForUser(database, balises, user.uid, canViewHistory);

    // Attach latest official version edit time for all balises
    const balisesWithEditTime = await getLatestOfficialEditTimes(database, resolvedBalises);

    const hasNextPage = skip + effectiveLimit < totalCount;
    const hasPreviousPage = page > 1;

    const response = {
      data: balisesWithEditTime,
      pagination: {
        page: page,
        limit: effectiveLimit,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / effectiveLimit),
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
      },
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
