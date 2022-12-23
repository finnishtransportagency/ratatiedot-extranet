import { ALBEvent, ALBResult } from 'aws-lambda';
import axios from 'axios';
import { getAlfrescoOptions, getAlfrescoUrlBase } from '../../utils/alfresco';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { searchQueryBuilder } from './searchQueryBuilder';
import { QueryRequest } from './searchQueryBuilder/types';

const searchByTerm = async (body: string | null, uid: string) => {
  try {
    log.debug(body, 'POST body request');
    const parsedBody: QueryRequest = body ? JSON.parse(body) : {};
    log.debug(parsedBody, 'Body parsing...');
    const bodyRequest = searchQueryBuilder({
      searchParameters: parsedBody.searchParameters,
      page: parsedBody.page,
      language: parsedBody.language,
    });
    log.debug(bodyRequest, 'Complete body request');

    const alfrescoAPIUrl = getAlfrescoUrlBase();
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });

    const response = await axios.post(`${alfrescoAPIUrl}/search`, bodyRequest, options);
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
    await validateReadUser(user);
    log.info(user, `Alfresco search: ${event.body}`);
    const data = await searchByTerm(event.body, user.uid);
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
