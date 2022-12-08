import AWS from 'aws-sdk';
import { log } from './logger';

const ssm = new AWS.SSM({ region: process.env.region || 'eu-west-1' });

export const getSecuredStringParamter = async (name: string) => {
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

export const getParamter = async (name: string) => {
  try {
    const value = await ssm.getParameter({ Name: name }).promise();
    return value.Parameter?.Value || '';
  } catch (error) {
    log.error(error);
    throw error;
  }
};
