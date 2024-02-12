import { ALBEvent, ALBResult } from 'aws-lambda';
import { getAlfrescoOptions } from '../../utils/alfresco';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { searchQueryBuilder } from './searchQueryBuilder';
import { AdditionalFields, QueryRequest } from './searchQueryBuilder/types';
import { alfrescoAxios, alfrescoSearchApiVersion } from '../../utils/axios';

const searchByTerm = async (uid: string, body: QueryRequest) => {
  try {
    const bodyRequest = searchQueryBuilder({
      searchParameters: body.searchParameters,
      page: body.page,
      language: body.language,
      sort: body.sort,
      additionalFields: [AdditionalFields.PROPERTIES],
    });
    log.debug(bodyRequest, 'Complete body request');
    const alfrescoSearchAPIUrl = alfrescoSearchApiVersion;
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });

    const response = await alfrescoAxios.post(alfrescoSearchAPIUrl, bodyRequest, options);
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
    if (body === null) throw new Error('Body is null');
    const parsedBody: QueryRequest = JSON.parse(body);
    log.info(user, `Alfresco search: ${body}`);
    validateReadUser(user);

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
