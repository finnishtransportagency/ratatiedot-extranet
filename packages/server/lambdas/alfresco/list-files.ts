import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import axios from 'axios';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { findEndpoint, getAlfrescoOptions, getAlfrescoUrlBase } from '../../utils/alfresco';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { searchQueryBuilder } from './searchQueryBuilder';
import {
  AdditionalFields,
  IParentSearchParameter,
  QueryLanguage,
  SearchParameterName,
} from './searchQueryBuilder/types';

const searchByTermWithParent = async (uid: string, alfrescoParent: string, page: number, language: QueryLanguage) => {
  try {
    const parent: IParentSearchParameter = {
      parameterName: SearchParameterName.PARENT,
      parent: alfrescoParent,
    };

    const bodyRequest = searchQueryBuilder({
      searchParameters: [parent],
      page: page,
      language: language,
      additionalFields: [AdditionalFields.PROPERTIES],
    });
    const alfrescoSearchAPIUrl = `${getAlfrescoUrlBase()}/search/versions/1/search`;
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });

    const response = await axios.post(`${alfrescoSearchAPIUrl}`, bodyRequest, options);
    return response.data;
  } catch (err) {
    throw err;
  }
};

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

/**
 * Get the list of files embedded to given page
 * @param {ALBEvent} event
 * @param {{category: string, page?: number, language?: QueryLanguage }} event.queryStringParameters
 * @param {string} event.queryStringParameters.category Page to be searched for
 * @returns {Promise<ALBResult>} List of files for given page
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    validateReadUser(user);
    const params = event.queryStringParameters;
    const category = params?.category;
    log.info(`User ${user.uid} is fetching files for page ${category}`);
    if (!category) {
      throw new RataExtraLambdaError('Category missing', 400);
    }
    const page = params?.page ? parseInt(params?.page) : 0;
    const language = (params?.language as QueryLanguage) ?? QueryLanguage.LUCENE;
    if (!Object.values(QueryLanguage).includes(language)) {
      throw new RataExtraLambdaError('Invalid language', 400);
    }
    if (!fileEndpointsCache.length) {
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }
    const alfrescoParent = findEndpoint(category, fileEndpointsCache)?.alfrescoFolder;
    if (!alfrescoParent) {
      throw new RataExtraLambdaError('Category not found', 404);
    }
    const data = await searchByTermWithParent(user.uid, alfrescoParent, page, language);
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
