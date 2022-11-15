import { PrismaClient } from '@prisma/client';
import { SSM } from '@aws-sdk/client-ssm';

const ssm = new SSM({ region: 'eu-west-1' });

const getParameter = (parameterName?: string): string | void => {
  ssm
    .getParameter({ Name: parameterName })
    .then((data) => {
      console.log('data: ', data);
      return data.Parameter?.Value;
    })
    .catch((err) => {
      console.log('error: ', err);
    });
};

process.env.DATABASE_URL = `postgresql://${getParameter(process.env.SSM_DATABASE_NAME_ID)}:${encodeURIComponent(
  getParameter(process.env.SSM_DATABASE_PASSWORD_ID) ?? '',
)}@${getParameter(process.env.SSM_DATABASE_DOMAIN_ID)}:5432/${getParameter(
  process.env.SSM_DATABASE_NAME_ID,
)}?schema=public`;

export default new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
