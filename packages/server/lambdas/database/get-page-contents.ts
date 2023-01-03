import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { findEndpoint } from '../../utils/alfresco';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

/**
 * Get custom content for page
 * @param {ALBEvent} event
 * @param {string} event.queryStringParameters.category Page to get the custom content for
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    log.info(user, `Fetching page contents for page ${event.queryStringParameters}`);
    validateReadUser(user);
    const category = event.queryStringParameters?.category;
    if (!category) {
      throw new RataExtraLambdaError('Category missing', 400);
    }
    if (!fileEndpointsCache.length) {
      log.debug('Cache empty');
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }
    log.debug(`Cached ${fileEndpointsCache}`);
    const categoryData = findEndpoint(category, fileEndpointsCache);
    if (!categoryData) {
      throw new RataExtraLambdaError('Category not found', 404);
    }
    const contents = await database.categoryDataContents.findUnique({ where: { baseId: categoryData.id } });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: contents?.fields }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
