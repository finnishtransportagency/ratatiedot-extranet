import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { findEndpoint } from '../../utils/alfresco';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from './client';

type UpdateRequestBody = {
  category: string;
  fields: Record<string, string>;
};

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

/**
 * Update custom content for page
 * @param {ALBEvent} event
 * @param {{UpdateRequestBody}} event.body Page to get the custom content for
 * @returns  {Promise<ALBResult>} JSON stringified object of updated contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    const body: UpdateRequestBody = event.body ? JSON.parse(event.body) : {};
    log.debug(`Request body: ${JSON.stringify(body)}`);
    const { category, fields } = body;
    log.info(user, `Updating page contents for page ${body.category}`);
    validateReadUser(user);
    if (!category) {
      throw new RataExtraLambdaError('Category missing', 400);
    }
    if (!fields) {
      throw new RataExtraLambdaError('Fields missing', 400);
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

    const contents = await database.categoryDataContents.update({
      where: { baseId: categoryData.id },
      data: { fields: fields },
    });

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
