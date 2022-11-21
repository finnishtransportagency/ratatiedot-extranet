import { APIGatewayEvent } from 'aws-lambda';
import { RataExtraLambdaError } from './errors';
import { log } from './logger';
import { validateJwtToken } from './validateJwtToken';

export type User = {
  uid: string;
  roles?: string[];
};

function parseRoles(roles: string): string[] | undefined {
  return roles
    ? roles
        .replace('\\', '')
        .split(',')
        .map((s) => {
          const s1 = s.split('/').pop();
          if (s1) {
            return s1;
          }
          // tsc fails if undefined is returned here
          return '';
        })
        .filter((s) => s)
    : undefined;
}

const isReadUser = (user: User) => user.roles?.includes('Rataextra_lukuDUMMY');

export const validateReadUser = async (event: APIGatewayEvent): Promise<void> => {
  log.debug('dummy2Lambda: Validating read user');
  const headers = event.headers;
  const issuer = process.env.JWT_TOKEN_ISSUER;
  if (!issuer) {
    throw new RataExtraLambdaError('Issuer missing', 500);
  }
  const jwt = await validateJwtToken(headers['x-amzn-oidc-accesstoken'], headers['x-amzn-oidc-data'], issuer);

  if (!jwt) {
    throw new RataExtraLambdaError('Invalid token', 500);
  }
  const roles = parseRoles(jwt['custom:rooli']);
  const user: User = {
    uid: jwt['custom:uid'],
    roles,
  };
  if (!isReadUser(user)) {
    throw new RataExtraLambdaError('Forbidden', 403);
  }
};
