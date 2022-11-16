import { exec } from 'child_process';
import { APIGatewayEvent, Context } from 'aws-lambda';
import { SSM } from '@aws-sdk/client-ssm';

const ssm = new SSM({ region: 'eu-west-1' });

export async function handleRequest(_event: APIGatewayEvent, _context: Context) {
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

  (async () => {
    const [databaseName, databaseDomain, databasePassword] = await Promise.all([
      getParameter(process.env.SSM_DATABASE_NAME_ID),
      getParameter(process.env.SSM_DATABASE_DOMAIN_ID),
      getSecureStringParameter(process.env.SSM_DATABASE_PASSWORD_ID),
    ]);

    const url = `postgresql://${databaseName}:${databasePassword}@${databaseDomain}:5432/${databaseName}?schema=public`;

    // Run Database migration
    exec(`DATABASE_URL="${url}" npx prisma migrate deploy`);
  })();
}
