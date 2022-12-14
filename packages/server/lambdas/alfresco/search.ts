import { ALBEvent, Context } from 'aws-lambda';
import axios from 'axios';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getParameter, getSecuredStringParameter } from '../../utils/parameterStore';
import { getUser, validateReadUser } from '../../utils/userService';
import { searchQueryBuilder } from './searchQueryBuilder';

let alfrescoAPIKey: string | null = null;
let alfrescoAPIUrl: string | null = null;
const alfrescoAPIKeyName = process.env.ALFRESCO_API_KEY || '';
const alfrescoAPIUrlName = process.env.ALFRESCO_API_URL || '';

const searchByTerm = async ({ headers, body }: ALBEvent) => {
  try {
    // Testing `cookie` and `body` by event.json file
    const cookie = headers?.cookie || '';
    // ALBEvent's body type is string | null
    const parsedBody = body ? JSON.parse(body) : {};
    const bodyRequest = searchQueryBuilder({
      searchParameters: parsedBody.searchParameters,
      page: parsedBody.page,
      language: parsedBody.language,
    });

    if (!alfrescoAPIKey) {
      alfrescoAPIKey = await getSecuredStringParameter(alfrescoAPIKeyName);
    }
    if (!alfrescoAPIUrl) {
      alfrescoAPIUrl = await getParameter(alfrescoAPIUrlName);
    }
    const options = {
      headers: {
        'X-API-Key': alfrescoAPIKey,
        Cookie: cookie,
        'Content-Type': 'application/json;charset=UTF-8',
      },
    };
    const response = await axios.post(`${alfrescoAPIUrl}/search`, bodyRequest, options);
    return response.data;
  } catch (err) {
    log.error(err);
    throw err;
  }
};

export async function handleRequest(event: ALBEvent, _context: Context) {
  try {
    const user = await getUser(event);
    await validateReadUser(user);
    const data = await searchByTerm(event);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
