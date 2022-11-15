import { PrismaClient } from '@prisma/client';
import { SSM } from '@aws-sdk/client-ssm';

const ssm = new SSM({ region: 'eu-west-1' });

const secrets = [
  {
    name: process.env.SSM_DATABASE_NAME_ID,
    value: '',
  },
  {
    name: process.env.SSM_DATABASE_DOMAIN_ID,
    value: '',
  },
  {
    name: process.env.SSM_DATABASE_PASSWORD_ID,
    value: '',
  },
];

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

secrets.forEach((secret) => {
  secret.value = getParameter(secret.name) ?? '';
});

// process.env.DATABASE_URL = `postgresql://${secrets.databaseName}:${encodeURIComponent(secrets.databasePassword)}@${
//   secrets.databaseDomain
// }:5432/${secrets.databaseName}?schema=public`;

export default new PrismaClient();
