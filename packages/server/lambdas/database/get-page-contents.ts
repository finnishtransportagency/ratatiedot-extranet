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
 * Get custom content for page. Example request: /api/database/page-contents/linjakaaviot
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to get the custom content for
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const paths = event.path.split('/');
    const category = paths.pop();

    const user = await getUser(event);
    log.info(user, `Fetching page contents for page ${category}`);
    validateReadUser(user);

    if (!category || paths.pop() !== 'page-contents') {
      throw new RataExtraLambdaError('Category missing from path', 400);
    }
    if (!fileEndpointsCache.length) {
      log.debug('Cache empty');
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }
    log.debug(`Cached ${JSON.stringify(fileEndpointsCache)}`);
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
