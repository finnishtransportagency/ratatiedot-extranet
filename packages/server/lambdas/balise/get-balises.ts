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

    let options = {};

    if (hasMinAndMaxParams(event)) {
      options = {
        where: {
          secondaryId: getMinMaxParamsAsPrismaQuery(event),
        },
      };
    }

    const response = await database.balise.findMany(options);

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
