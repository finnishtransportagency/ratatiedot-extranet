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
        Cookie:
          'VaylaExtra_TEST=rd461o00000000000000000000ffffac11d0e3o7777; OAMAuthnCookie_testiextranet.vayla.fi_443=878ab508b49bac5848d1d02345635e0227764ed1%7EW9EDe2q3Ee0F5AMkx9OX4ketDcJYAHqhDE8Fxn2aE7z10xGT7KSwdrkVHbnRaRIDGaVRtFpAK5lWARxzcDIFhwcm9Xg1FJZJAphVdI7qZz9g9sw1pABB7ttybpU4KOJ4d8Uh18CoAHeRdr06pEy1xKRRHfcnZCtwlel27rg1VJV8HWKGFcxbGNElVsce%2BlLmNr%2FtblRp9rTdAgpmy41TWdBAsrBS33kpyzbWk3Oru3IdlJx7AE8vddo6ES67%2B%2Fcvc%2BA7vTrjquw5rAMM4Um0UtWQzrVmnAbWXcPKcB9MgulrKsrU%2B315DskAHRvA25XQRxzI7q7Neh8PyG0nOWFmmsd2OvuPAJVCzMEYWfo8sesDPIMcONcVFvMnTMPETIXzFozZ4thfmE3LD6usNFgPOxwjRrHfsxwsJy9WRKkdj12S8959%2FZtz5nxm6N5ni5a4KgeVDhlEQqL9VPWDBNaYTpDrl%2FRlBBOF6A4uZ7laL%2FyW7587f1my0WRtpkvxQRZKoqvnqQldPROnGQ1hUKT9hQDcQ%2BAmUG%2Fy4kzgK%2BQDB1pxMgIbheyMRf8tuo2g2bgl64quOE3oa7e199DkPw8vQlRd%2FVt6T%2B4mChtpaH%2FSENrfPLE4b3URfd8%2BBT3VXVqi; OAMAuthnHintCookie=1',
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
    const data = await searchByTerm('Tampere');
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
