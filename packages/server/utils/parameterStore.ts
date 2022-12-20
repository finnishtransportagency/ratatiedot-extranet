const AWS = require('aws-sdk'); //eslint-disable-line @typescript-eslint/no-var-requires
import { log } from './logger';

const ssm = new AWS.SSM({ region: process.env.region || 'eu-west-1' });

export const getSecuredStringParameter = async (name: string) => {
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

export const getParameter = async (name: string) => {
  try {
    const value = await ssm.getParameter({ Name: name }).promise();
    return value.Parameter?.Value || '';
  } catch (error) {
    log.error(error);
    throw error;
  }
};
