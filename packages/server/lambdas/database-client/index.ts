import { PrismaClient } from '@prisma/client';
import { getParameter } from '../../utils/parameterStore';

const databaseNameId = process.env.SSM_DATABASE_NAME_ID || '';
const databaseDomainId = process.env.SSM_DATABASE_DOMAIN_ID || '';
const databasePasswordId = process.env.SSM_DATABASE_PASSWORD_ID || '';

let databaseName: string | null = null;
let databaseDomain: string | null = null;
let databasePassword: string | null = null;

export class DatabaseClient {
  public static async build(): Promise<PrismaClient> {
    if (!databaseName || !databaseDomain || !databasePassword) {
      [databaseName, databaseDomain, databasePassword] = await Promise.all([
        getParameter(databaseNameId),
        getParameter(databaseDomainId),
        getParameter(databasePasswordId),
      ]);
    }

    const DATABASE_URL = `postgresql://${databaseName}:${databasePassword}@${databaseDomain}:5432/${databaseName}?schema=public`;

    return new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });
  }
}
