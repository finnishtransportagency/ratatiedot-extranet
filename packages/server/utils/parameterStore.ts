import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { log } from './logger';

const ssm = new SSMClient({ region: process.env.region || 'eu-west-1' });

export const getSecuredStringParameter = async (name: string) => {
  try {
    const value = await ssm.send(
      new GetParameterCommand({
        Name: name,
        WithDecryption: true,
      }),
    );
    return value.Parameter?.Value || '';
  } catch (error) {
    log.error(error);
    throw error;
  }
};

export const getParameter = async (name: string) => {
  try {
    const value = await ssm.send(
      new GetParameterCommand({
        Name: name,
      }),
    );
    return value.Parameter?.Value || '';
  } catch (error) {
    log.error(error);
    throw error;
  }
};
