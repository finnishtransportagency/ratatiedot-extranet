import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { findEndpoint } from '../../utils/alfresco';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { auditLog, log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

/**
 * User adds their favorite category page. Example request: POST /api/database/favorites?category=linjakaaviot
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to get the custom content for
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    const params = event.queryStringParameters;
    const category = params?.category;
    log.info(user, 'Add favorite category page');
    validateReadUser(user);

    if (!category) {
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
    const data = await database.favoriteCategory.upsert({
      where: {
        favoriteCategoryIdentifier: {
          userId: user.uid,
          categoryId: categoryData.id,
        },
      },
      update: {},
      create: {
        userId: user.uid,
        categoryId: categoryData.id,
      },
    });

    auditLog.info(user, `Added category page ${category} to their favorite list`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
