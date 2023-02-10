import { ALBEvent, ALBResult } from 'aws-lambda';
import axios from 'axios';
import { getAlfrescoOptions, getAlfrescoUrlBase } from '../../utils/alfresco';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { searchQueryBuilder } from './searchQueryBuilder';
import {
  ICategorySearchParameter,
  IParentSearchParameter,
  QueryRequest,
  SearchParameter,
  SearchParameterName,
} from './searchQueryBuilder/types';

const searchByTerm = async (uid: string, body: QueryRequest) => {
  try {
    const bodyRequest = searchQueryBuilder({
      searchParameters: body.searchParameters,
      page: body.page,
      language: body.language,
      sort: body.sort,
    });
    log.debug(bodyRequest, 'Complete body request');
    const alfrescoSearchAPIUrl = `${getAlfrescoUrlBase()}/search/versions/1/search`;
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });

    const response = await axios.post(alfrescoSearchAPIUrl, bodyRequest, options);
    return response.data;
  } catch (err) {
    throw err;
  }
};

/**
 * Endpoint for searching for files from Alfresco with given search parameters
 * @param {ALBEvent} event
 * @param {QueryRequest} event.body JSON stringified QueryRequest
 * @returns {Promise<ALBResult>} List of files stringified in body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    const { body } = event;
    const parsedBody: QueryRequest = body ? JSON.parse(body) : {};
    const { searchParameters } = parsedBody;
    log.info(user, `Alfresco search: ${parsedBody}`);
    validateReadUser(user);

    // Currently, only accept one category
    const categoryParameter = searchParameters.find(
      (parameter: SearchParameter) => SearchParameterName.CATEGORY === parameter.parameterName.toLowerCase(),
    ) as ICategorySearchParameter;
    const database = await DatabaseClient.build();
    if (categoryParameter) {
      const categoryResponse = await database.categoryDataBase.findFirst({
        where: {
          rataextraRequestPage: categoryParameter.categoryName,
        },
      });

      const parentParameter: IParentSearchParameter = {
        parameterName: SearchParameterName.PARENT,
        parent: categoryResponse?.alfrescoFolder || '',
      };
      searchParameters.push(parentParameter);
    }

    const data = await searchByTerm(user.uid, parsedBody);
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
