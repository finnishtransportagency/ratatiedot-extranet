import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateBaliseReadUser, isBaliseAdmin } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { resolveBalisesForUser } from '../../utils/balise/baliseVersionUtils';

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

    validateBaliseReadUser(user);

    // Check if user is admin
    const isAdmin = isBaliseAdmin(user);

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
    let whereClause;
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

    // Get total count for pagination info
    const totalCount = await database.balise.count({
      where: whereClause,
    });

    // Check if history should be included (optional query parameter, admin only)
    const includeHistory = isBaliseAdmin(user) && getQueryParam(event, 'include_history') === 'true';

    // Get balises with pagination
    const balises = await database.balise.findMany({
      where: whereClause,
      include: includeHistory
        ? {
            history: {
              orderBy: {
                version: 'asc' as const,
              },
            },
          }
        : undefined,
      orderBy: {
        secondaryId: 'asc',
      },
      skip: skip,
      take: effectiveLimit,
    });

    // Resolve balises to latest OFFICIAL versions efficiently (unless user is admin or lock owner)
    const resolvedBalises = await resolveBalisesForUser(database, balises, user.uid, isAdmin);

    const hasNextPage = skip + effectiveLimit < totalCount;
    const hasPreviousPage = page > 1;

    const response = {
      data: resolvedBalises,
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
