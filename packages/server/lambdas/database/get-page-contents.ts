import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, Context } from 'aws-lambda';
import { findEndpoint } from '../../utils/alfresco';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';

// TODO: Preliminary implementation
// Not tested, so won't likely work
const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

export async function handleRequest(event: ALBEvent, _context: Context) {
  try {
    const user = await getUser(event);
    log.info(user, `Fetching files for ${event.path}`);
    await validateReadUser(user);
    const category = event.queryStringParameters?.category;
    if (!category) {
      throw new RataExtraLambdaError('Category missing', 400);
    }
    if (!fileEndpointsCache.length) {
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }
    const categoryData = findEndpoint(category, fileEndpointsCache);
    if (!categoryData) {
      throw new RataExtraLambdaError('Category not found', 500);
    }
    const contents = await database.categoryDataContents.findUnique({ where: { baseId: categoryData.id } });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contents?.fields),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
