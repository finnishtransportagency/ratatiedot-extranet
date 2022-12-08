import { ALBEvent, Context } from 'aws-lambda';
import AWS from 'aws-sdk';
import axios from 'axios';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';

let alfrescoAPIKey: string | null = null;
let alfrescoAPIUrl: string | null = null;
const alfrescoAPIKeyName = process.env.ALFRESCO_API_KEY_NAME || '';
const alfrescoAPIUrlName = process.env.ALFRESCO_API_URL_NAME || '';

const getSecuredStringParamter = async (name: string) => {
  const ssm = new AWS.SSM({ region: 'eu-west-1' });
  try {
    const value = await ssm
      .getParameter({
        Name: name,
        WithDecryption: true,
      })
      .promise();
    return value.Parameter?.Value || '';
  } catch (error) {
    log.error(error);
    throw error;
  }
};

const searchByTerm = async (term: string) => {
  try {
    if (!alfrescoAPIKey) {
      alfrescoAPIKey = await getSecuredStringParamter(alfrescoAPIKeyName);
    }
    if (!alfrescoAPIUrl) {
      alfrescoAPIUrl = await getSecuredStringParamter(alfrescoAPIUrlName);
    }
    const options = {
      headers: {
        'X-API-Key': alfrescoAPIKey,
        // Cookie: '',
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
    if (term) {
      data = await searchByTerm(term);
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
