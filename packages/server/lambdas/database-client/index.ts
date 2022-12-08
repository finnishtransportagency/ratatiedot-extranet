import { PrismaClient } from '@prisma/client';
import { SSM } from '@aws-sdk/client-ssm';

const ssm = new SSM({ region: 'eu-west-1' });

const getParameter = async (parameterName?: string) => {
  let value;
  try {
    const data = await ssm.getParameter({ Name: parameterName });
    value = data.Parameter?.Value;
  } catch (error) {
    value = 'NOT_FOUND';
  }
  return value;
};

const getSecureStringParameter = async (parameterName?: string) => {
  let value;
  try {
    const data = await ssm.getParameter({ Name: parameterName, WithDecryption: true });
    value = data.Parameter?.Value;
  } catch (error) {
    value = 'NOT_FOUND';
  }
  return value;
};

export class DatabaseClient {
  public static async build(): Promise<PrismaClient> {
    const [databaseName, databaseDomain, databasePassword] = await Promise.all([
      getParameter(process.env.SSM_DATABASE_NAME_ID),
      getParameter(process.env.SSM_DATABASE_DOMAIN_ID),
      getSecureStringParameter(process.env.SSM_DATABASE_PASSWORD_ID),
    ]);

    const DATABASE_URL = `postgresql://${databaseName}:${databasePassword}@${databaseDomain}:5432/${databaseName}?schema=public`;

    return new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });
  }
}
