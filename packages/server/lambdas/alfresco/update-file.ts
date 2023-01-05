import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { isEmpty } from 'lodash';
import { findEndpoint } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { fileRequestBuilder } from './fileRequestBuilder';
import { IFileRequestBody } from './fileRequestBuilder/types';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

/**
 * Update custom content for page. Example request: /api/alfresco/file/linjakaaviot
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to update the file to
 * @param {{FileUpdatedBody}} event.body Page to get the custom content for
 * @returns  {Promise<ALBResult>} JSON stringified object of updated contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const paths = event.path.split('/');
    const category = paths.pop();
    const body: IFileRequestBody = event.body ? JSON.parse(event.body) : {};

    const user = await getUser(event);
    log.info(user, `Updating file ${body.fileName} to category ${category}`);
    validateReadUser(user);

    if (!category || paths.pop() !== 'file') {
      throw new RataExtraLambdaError('Category missing from path', 400);
    }
    if (isEmpty(body)) {
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

    // TODO: Alfresco functionality. See search.ts for help
    const request = fileRequestBuilder({ ...body, category: category });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      // TODO: Return content
      body: JSON.stringify('Appropriate information about file as JSON'),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
