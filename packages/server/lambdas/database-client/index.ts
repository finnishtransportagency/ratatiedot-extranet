import { PrismaClient } from '@prisma/client';
import { SSM } from '@aws-sdk/client-ssm';

const ssm = new SSM({ region: 'eu-west-1' });

const getParameter = async (parameterName?: string): Promise<string | undefined> => {
  const parameter = await ssm.getParameter({ Name: parameterName });
  const value = parameter.Parameter?.Value;
  return value;
};
const getSecureStringParameter = async (parameterName?: string): Promise<string | undefined> => {
  const parameter = await ssm.getParameter({ Name: parameterName });
  const value = encodeURIComponent(parameter.Parameter?.Value ?? '');
  return value;
};

console.log('getParameter: ', getParameter(process.env.SSM_DATABASE_NAME_ID));

const DATABASE_URL = `postgresql://${getParameter(process.env.SSM_DATABASE_NAME_ID)}:${getSecureStringParameter(
  process.env.SSM_DATABASE_PASSWORD_ID,
)}@${getParameter(process.env.SSM_DATABASE_DOMAIN_ID)}:5432/${getParameter(
  process.env.SSM_DATABASE_NAME_ID,
)}?schema=public`;

process.env.DATABASE_URL = 'test_value';

console.log('testENV: ', process.env.DATABASE_URL);
console.log('constant: ', DATABASE_URL);

export default new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });
