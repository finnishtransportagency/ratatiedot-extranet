import { ALBEvent, Context } from 'aws-lambda';
import AWS from 'aws-sdk';
import axios from 'axios';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';

let alfrescoAPIKey: string | null = null;
const alfrescoAPIKeyName = process.env.ALFRESCO_API_KEY_NAME || '';

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
    return '';
  }
};

const searchByTerm = async (term: string) => {
  try {
    if (!alfrescoAPIKey) {
      alfrescoAPIKey = await getSecuredStringParamter(alfrescoAPIKeyName);
    }
    const testUrl = `https://api.testivaylapilvi.fi/alfresco/api/-default-/public/alfresco/versions/1/queries/nodes?term=${term}`;
    const options = {
      headers: {
        'X-API-Key': alfrescoAPIKey,
        Cookie:
          'VaylaExtra_TEST=rd461o00000000000000000000ffffac11d0e3o7777; OAMAuthnCookie_testiextranet.vayla.fi_443=bb09ba4f84ea043650e135012b1cf45b5654929e%7ELPz6Cw0EWQG%2FSOS6Qgc6DjZy4B%2BezmRWZXN7asEHo01MQZ8ckyuReRjKkxoK0RXjT7mYK%2B3qGRax9KzYRnrFAI4DGVenndPRKpb2R%2BBN8svRsT8OnZFG%2BtX4T%2BYlBgT2PNZtDnj81VmMaDgYeutt7L0PkqSfHSVkwwoZBXmm%2BnF8RGPX9E2DMR9smelIKB8zSEfuq8x6O2wRp0LBmG6BSG9QNjKn5IQvvUkPMi8xV14qRkL%2F%2BRoYxfEIWdSp9vptUNB%2FXpWUbxX402XCKqMSHhhF6Fp%2B7uorfW%2FXdsKGbdQbnOi6ADmuJcXqP0BQbwuX%2B4QiatTfzPaCPgotztzW2XH64khWYr9QoBfCeZhk9k30zmcjvkgypRF%2BT9rFm%2BOsHjl4%2B7sJvjFvCRe%2BIyedztBCQ9FT37HQlCQZYSFh4RSSN3t72u6iMkCjoHQixyoduBEErInOnDEEY%2Fp6q3AO%2FEXpb3rw1ll%2FOzxdRAga40%2BQD09VSpJZ%2FT9mGWNIRc1TgjqTtWOcBdNEbD8yrOCYaEh2LdHRXpZKoK3rzby4iufSx4EdQjxSlQs34SdMCFrH2IG914A%2Fu8AhEJhvBNavxX1C9BK4I%2Bu3eR%2FCab1eH4aTtIXDmLwdQzAWAYB31XQR; OAMAuthnHintCookie=1',
      },
    };
    const response = await axios.get(testUrl, options);
    return response.data;
  } catch (err) {
    log.error(err);
  }
};

export async function handleRequest(event: ALBEvent, _context: Context) {
  try {
    const user = await getUser(event);
    await validateReadUser(user);
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
  const data = await searchByTerm('Tampere');
  console.log('>>>> EVENT: ', event);
  console.log('>>>> EVENT.queryStringParameters', event.queryStringParameters);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data,
  };
}
