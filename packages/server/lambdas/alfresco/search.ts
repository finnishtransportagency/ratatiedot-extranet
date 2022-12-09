import { ALBEvent, Context } from 'aws-lambda';
import axios from 'axios';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getParameter, getSecuredStringParameter } from '../../utils/parameterStore';
import { getUser, validateReadUser } from '../../utils/userService';

let alfrescoAPIKey: string | null = null;
let alfrescoAPIUrl: string | null = null;
const alfrescoAPIKeyName = process.env.ALFRESCO_API_KEY || '';
const alfrescoAPIUrlName = process.env.ALFRESCO_API_URL || '';

const searchByTerm = async (cookie: string, term: string) => {
  try {
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
      },
    };
    const response = await axios.get(`${alfrescoAPIUrl}/queries/nodes?term=${term}`, options);
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
    let data = {};
    const term = event.queryStringParameters?.term ? decodeURIComponent(event.queryStringParameters.term) : '';
    // Testing cookie by event.json file
    const cookie = event.headers?.cookie || '';

    if (term) {
      data = await searchByTerm(cookie, term);
    }
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
