import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { isEmpty } from 'lodash';

import { findEndpoint } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from './client';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  const userRight = {
    canRead: false,
    canWrite: false,
  };

  try {
    const paths = event.path.split('/');
    const category = paths.at(-2);

    const user = await getUser(event);
    log.info(user, `Checking user write permission for page ${category}`);
    validateReadUser(user);
    userRight.canRead = true;

    if (!category || paths.pop() !== 'page-contents') {
      throw new RataExtraLambdaError('Category missing from path', 400);
    }
    if (isEmpty(event.body)) {
      throw new RataExtraLambdaError('Request body missing', 400);
    }
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
  } catch (err) {
    log.error(err);
    return { ...getRataExtraLambdaError(err), body: JSON.stringify(userRight) };
  }
}
