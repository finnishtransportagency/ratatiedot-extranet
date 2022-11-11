import { PrismaClient } from '@prisma/client';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

//    const encodedConnectionUrl = `postgresql://${databaseName}:${encodeURIComponent(databasePassword)}@${databaseDomain}:5432/${databaseName}?schema=public`;

// Construct evironment variable that prisma uses as connection string to database
const client = new SSMClient({ region: 'eu-west-1' });

const getParameterByName = (parameterName: string): any => {
  const command = new GetParameterCommand({ Name: parameterName });
  client.send(command).then(
    (data) => {
      return data.Parameter?.Value;
    },
    (error) => {
      // handle error
    },
  );
};

const secrets = {
  databaseName: getParameterByName('rataextra-rdspg13-rataextradev-password'),
  databasePassword: getParameterByName('rataextra-database-name'),
  databaseDomain: getParameterByName('rataextra-database-domain'),
};

console.log('name: ', secrets.databaseName);
console.log('databaseDomain: ', secrets.databaseDomain);
console.log('password length: ', secrets.databasePassword.length);

process.env.DATABASE_URL = `postgresql://${secrets.databaseName}:${encodeURIComponent(secrets.databasePassword)}@${
  secrets.databaseDomain
}:5432/${secrets.databaseName}?schema=public`;

export default new PrismaClient();
