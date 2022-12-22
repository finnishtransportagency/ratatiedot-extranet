import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, Context } from 'aws-lambda';
import axios from 'axios';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { findEndpoint, getAlfrescoOptions, getAlfrescoUrlBase } from '../../utils/alfresco';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { searchQueryBuilder } from './searchQueryBuilder';
import { Include, IParentSearchParameter, SearchParameter, SearchParameterName } from './searchQueryBuilder/types';

const searchByTermWithParent = async (body: string | null, uid: string, alfrescoParent: string) => {
  try {
    const parsedBody = body ? JSON.parse(body) : {};

    const searchparameters: Array<SearchParameter> = parsedBody.searchParameters;
    const parent: IParentSearchParameter = {
      parameterName: SearchParameterName.PARENT,
      parent: alfrescoParent,
    };
    searchparameters.concat(parent);

    const bodyRequest = searchQueryBuilder({
      searchParameters: searchparameters,
      page: parsedBody.page,
      language: parsedBody.language,
      include: [Include.PROPERTIES],
    });

    const alfrescoAPIUrl = getAlfrescoUrlBase();
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });

    const response = await axios.post(`${alfrescoAPIUrl}/search`, bodyRequest, options);
    return response.data;
  } catch (err) {
    throw err;
  }
};
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
    const alfrescoParent = findEndpoint(category, fileEndpointsCache)?.alfrescoFolder;
    if (!alfrescoParent) {
      throw new RataExtraLambdaError('Category not found', 404);
    }
    const data = await searchByTermWithParent(event.body, user.uid, alfrescoParent);
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
