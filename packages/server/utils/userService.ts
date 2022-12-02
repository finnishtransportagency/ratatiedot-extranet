import { ALBEvent } from 'aws-lambda';
import { RataExtraLambdaError } from './errors';
import { validateJwtToken } from './validateJwtToken';
import { isPermanentStack, isProductionStack } from '../../../lib/utils';
import { RataExtraEnvironment } from '../../../lib/config';
import { log } from './logger';

const ISSUER = process.env.JWT_TOKEN_ISSUER;
const STACK_ID = process.env.STACK_ID || '';
const ENVIRONMENT = process.env.ENVIRONMENT || '';

const STATIC_ROLES = {
  read: 'Rataextra_luku',
  write_dev: 'Rataextra_kirjoitus',
  // admin:
};

export type RataExtraUser = {
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

const getMockUser = (): RataExtraUser => ({
  uid: 'MOCK_UID',
  roles: [STATIC_ROLES.read],
});

const parseUserFromEvent = async (event: ALBEvent): Promise<RataExtraUser> => {
  if (!ISSUER) {
    log.error('Issuer missing');
    throw new RataExtraLambdaError('User validation failed', 500);
  }
  const headers = event.headers;
  if (!headers) {
    log.error('Headers missing');
    throw new RataExtraLambdaError('Headers missing', 400);
  }
  const jwt = await validateJwtToken(headers['x-amzn-oidc-accesstoken'], headers['x-amzn-oidc-data'], ISSUER);

  if (!jwt) {
    throw new RataExtraLambdaError('User validation failed', 500);
  }
  const roles = parseRoles(jwt['custom:rooli']);
  const user: RataExtraUser = {
    uid: jwt['custom:uid'],
    roles,
  };
  return user;
};

const isReadUser = (user: RataExtraUser) => user.roles?.includes(STATIC_ROLES.read);

const isWriteDevUser = (user: RataExtraUser) => user.roles?.includes(STATIC_ROLES.write_dev);

export const getUser = async (event: ALBEvent): Promise<RataExtraUser> => {
  if (!STACK_ID || !ENVIRONMENT) {
    log.error('STACK_ID or ENVIRONMENT missing!');
    throw new RataExtraLambdaError('Error', 500);
  }
  if (!isPermanentStack(STACK_ID, ENVIRONMENT as RataExtraEnvironment)) {
    return getMockUser();
  }
  return parseUserFromEvent(event);
};

/**
 * Checks if the user has necessary role for read access. Throws 403 Forbidden if not.
 * @param user User being validated
 */
export const validateReadUser = async (user: RataExtraUser): Promise<void> => {
  if (!isReadUser(user)) {
    log.error(user, 'Forbidden: User is not a read user');
    throw new RataExtraLambdaError('Forbidden', 403);
  }
};

export const validateWriteUser = async (user: RataExtraUser): Promise<void> => {
  if (!isProductionStack(STACK_ID, ENVIRONMENT as RataExtraEnvironment)) {
    if (!isWriteDevUser(user)) {
      log.error(user, 'Forbidden: User is not a write_dev user');
      throw new RataExtraLambdaError('Forbidden', 403);
    }
  } else {
    // TODO: Prod validation
    log.error(user, 'Forbidden: No prod write validation yet');
    throw new RataExtraLambdaError('Forbidden', 403);
  }
};
