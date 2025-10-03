import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';

// Helper function to safely get query parameters
function getQueryParam(event: ALBEvent, key: string, defaultValue?: string): string | undefined {
  return event.queryStringParameters?.[key] ?? defaultValue;
}

function getQueryParamAsInt(event: ALBEvent, key: string, defaultValue?: number): number | undefined {
  const value = getQueryParam(event, key);
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

const hasMinAndMaxParams = (event: ALBEvent) => {
  if (event.queryStringParameters) {
    const queryParams = Object.keys(event.queryStringParameters);
    return queryParams.includes('id_min') && queryParams.includes('id_max');
  }
};

const getMinMaxParamsAsPrismaQuery = (event: ALBEvent) => {
  return {
    gte: getQueryParamAsInt(event, 'id_min'),
    lte: getQueryParamAsInt(event, 'id_max'),
  };
};

const database = await DatabaseClient.build();

/**
 * Get an array of balises. Example request: /api/balises?id_min=22000&id_max=23000&page=1&limit=100
 * @param {ALBEvent} event
 * @param {{QueryRequest}} event.body JSON stringified
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    log.info(user, `Get all balises. params: ${JSON.stringify(event.queryStringParameters)}`);

    validateReadUser(user);

    // Get pagination parameters
    const page = getQueryParamAsInt(event, 'page', 1) ?? 1;
    const limit = getQueryParamAsInt(event, 'limit', 1000) ?? 1000; // Default to 1000 items per page
    const skip = (page - 1) * limit;

    // Limit maximum page size to prevent memory issues
    const maxLimit = 5000;
    const effectiveLimit = Math.min(limit, maxLimit);

    const baseWhere = {
      deletedAt: null, // Only get non-deleted balises
    };

    const whereClause = hasMinAndMaxParams(event)
      ? {
          ...baseWhere,
          secondaryId: getMinMaxParamsAsPrismaQuery(event),
        }
      : baseWhere;

    // Get total count for pagination info
    const totalCount = await database.balise.count({
      where: whereClause,
    });

    // Check if history should be included (optional query parameter)
    const includeHistory = getQueryParam(event, 'include_history') === 'true';

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

    const hasNextPage = skip + effectiveLimit < totalCount;
    const hasPreviousPage = page > 1;

    const response = {
      data: balises,
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
