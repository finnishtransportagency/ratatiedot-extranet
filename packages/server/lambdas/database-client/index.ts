import { PrismaClient } from '@prisma/client';
import { SSM, GetParameterCommand } from '@aws-sdk/client-ssm';

//    const encodedConnectionUrl = `postgresql://${databaseName}:${encodeURIComponent(databasePassword)}@${databaseDomain}:5432/${databaseName}?schema=public`;

// Construct evironment variable that prisma uses as connection string to database
const ssm = new SSM({ region: 'eu-west-1' });

const getParameter = ssm.getParameter({ Name: 'rataextra-database-name' });
console.log('parameterPromise: ', getParameter);
getParameter
  .then((data) => {
    console.log('data: ', data);
  })
  .catch((err) => {
    console.log(err);
  });

// process.env.DATABASE_URL = `postgresql://${secrets.databaseName}:${encodeURIComponent(secrets.databasePassword)}@${
//   secrets.databaseDomain
// }:5432/${secrets.databaseName}?schema=public`;

export default new PrismaClient();
