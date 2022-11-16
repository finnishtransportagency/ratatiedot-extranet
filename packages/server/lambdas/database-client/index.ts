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
    const data = await ssm.getParameter({ Name: parameterName });
    value = data.Parameter?.Value;
  } catch (error) {
    value = 'NOT_FOUND';
  }
  return encodeURIComponent(value as string);
};

export class DatabaseClient {
  constructor() {
    // set props normally
    // nothing async can go here
  }
  public static async build(): Promise<PrismaClient> {
    const [databaseName, databaseDomain, databasePassword] = await Promise.all([
      getParameter(process.env.SSM_DATABASE_NAME_ID),
      getParameter(process.env.SSM_DATABASE_DOMAIN_ID),
      getParameter(process.env.SSM_DATABASE_PASSWORD_ID),
    ]);

    console.log('name: ', databaseName);
    const DATABASE_URL = `postgresql://${databaseName}:${databasePassword}@${databaseDomain}:5432/${databaseName}?schema=public`;
    console.log(DATABASE_URL);

    return new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });
  }
}
