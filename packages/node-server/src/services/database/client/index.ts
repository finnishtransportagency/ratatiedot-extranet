import { PrismaClient } from '@prisma/client';
import { ENVIRONMENTS } from './../../../utils/lib.js';
import { getParameter, getSecuredStringParameter } from '../../../utils/parameterStore.js';

const environment = process.env.ENVIRONMENT;
const databaseNameId = process.env.SSM_DATABASE_NAME_ID || '';
const databaseDomainId = process.env.SSM_DATABASE_DOMAIN_ID || '';
const databasePasswordId = process.env.SSM_DATABASE_PASSWORD_ID || '';

let databaseName: string | null;
let databaseDomain: string | null;
let databasePassword: string | null;

export class DatabaseClient {
  public static async build(): Promise<PrismaClient> {
    let DATABASE_URL: string;
    const isLocalDatabaseConnection = environment === ENVIRONMENTS.local;
    if (isLocalDatabaseConnection) {
      DATABASE_URL = 'postgresql://root:root@host.docker.internal:5432/test_db?schema=public';
    } else {
      if (!databaseName || !databaseDomain || !databasePassword) {
        [databaseName, databaseDomain, databasePassword] = await Promise.all([
          getParameter(databaseNameId),
          getParameter(databaseDomainId),
          getSecuredStringParameter(databasePasswordId),
        ]);
      }

      DATABASE_URL = `postgresql://${databaseName}:${databasePassword}@${databaseDomain}:5432/${databaseName}?schema=public`;
    }

    return new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });
  }
}
