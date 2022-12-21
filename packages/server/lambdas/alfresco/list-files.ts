import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, Context } from 'aws-lambda';
import axios from 'axios';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { findEndpoint, getAlfrescoAncestor, getAlfrescoOptions, getAlfrescoUrlBase } from '../../utils/alfresco';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';

// TODO: Preliminary implementation based on search.ts
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
    const alfrescoEndpoint = findEndpoint(category, fileEndpointsCache)?.alfrescoFolder;
    if (!alfrescoEndpoint) {
      throw new RataExtraLambdaError('Category not found', 404);
    }

    const options = await getAlfrescoOptions(user.uid);
    const alfrescoAPIUrlBase = getAlfrescoUrlBase;
    const alfrescoAPIPath = getAlfrescoAncestor;
    const response = await axios.get(`${alfrescoAPIUrlBase}${alfrescoAPIPath}${alfrescoEndpoint}`, options);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response.data),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
