import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';

import { findEndpoint } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from './client';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

/**
 * Check user's right based on given page. Example request: /api/database/user-right?category=linjakaaviot
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to get the custom content for
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  const userRight = {
    canRead: false,
    canWrite: false,
  };

  try {
    const params = event.queryStringParameters;
    const category = params?.category;

    const user = await getUser(event);
    log.info(user, `Checking user write permission for page ${category}`);
    validateReadUser(user);
    userRight.canRead = true;

    if (!category) {
      throw new RataExtraLambdaError('Category missing', 400);
    }

    // TODO: check super admin's role that can edit front page/home page/etusivu
    if (!fileEndpointsCache.length) {
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }
    const categoryData = findEndpoint(category, fileEndpointsCache);
    if (!categoryData) {
      throw new RataExtraLambdaError('Category not found', 404);
    }

    const writeRole = categoryData.writeRights;
    validateWriteUser(user, writeRole);
    userRight.canWrite = true;
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userRight),
    };
  } catch (err: unknown) {
    if (err instanceof RataExtraLambdaError) {
      if (err.statusCode === 403 || err.statusCode === 401) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userRight),
        };
      }
    }
    log.error(err);
    return { ...getRataExtraLambdaError(err), body: JSON.stringify(userRight) };
  }
}
