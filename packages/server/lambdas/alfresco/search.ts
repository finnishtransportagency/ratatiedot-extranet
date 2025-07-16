import { ALBEvent, ALBResult } from 'aws-lambda';
import { getAlfrescoOptions } from '../../utils/alfresco';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { RataExtraUser, getUser, validateReadUser } from '../../utils/userService';
import { searchQueryBuilder } from './searchQueryBuilder';
import { AdditionalFields, QueryRequest } from './searchQueryBuilder/types';
import { alfrescoAxios, alfrescoSearchApiVersion } from '../../utils/axios';
import { handlerWrapper } from '../handler-wrapper';

const searchByTerm = async (user: RataExtraUser, body: QueryRequest) => {
  log.info(user, 'searchByTerm');
  try {
    const bodyRequest = searchQueryBuilder({
      searchParameters: body.searchParameters,
      page: body.page,
      language: body.language,
      sort: body.sort,
      additionalFields: [AdditionalFields.PROPERTIES],
    });
    log.info(user, `bodyRequest: ${JSON.stringify(bodyRequest)}`);
    const alfrescoSearchAPIUrl = alfrescoSearchApiVersion;
    const options = await getAlfrescoOptions(user.uid, { 'Content-Type': 'application/json;charset=UTF-8' });

    const response = await alfrescoAxios.post(alfrescoSearchAPIUrl, bodyRequest, options);
    return response.data;
  } catch (err) {
    log.error(err);
    throw err;
  }
};

/**
 * Endpoint for searching for files from Alfresco with given search parameters
 * @param {ALBEvent} event
 * @param {QueryRequest} event.body JSON stringified QueryRequest
 * @returns {Promise<ALBResult>} List of files stringified in body
 */
export const handleRequest = handlerWrapper(async (event: ALBEvent): Promise<ALBResult> => {
  try {
    const user = await getUser(event);
    const { body } = event;
    if (body === null) throw new Error('Body is null');
    const parsedBody: QueryRequest = JSON.parse(body);
    log.info(user, `Alfresco search: ${body}`);
    validateReadUser(user);
    log.info(user, `we are here!`);

    const data = await searchByTerm(user, parsedBody);
    log.info(user, JSON.stringify(data));
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
});
