import { ALBEvent } from 'aws-lambda';
import { RataExtraLambdaError } from './errors';
import { validateJwtToken } from './validateJwtToken';
import { isFeatOrLocalStack } from '../../../lib/utils';
import { RataExtraEnvironment } from '../../../lib/config';
import { log } from './logger';

const ISSUERS = process.env.JWT_TOKEN_ISSUERS?.split(',');
const STACK_ID = process.env.STACK_ID || '';
const ENVIRONMENT = process.env.ENVIRONMENT || '';
const MOCK_UID = process.env.MOCK_UID || '';
const SERVICE_USER_UID = process.env.SERVICE_USER_UID || '';

const STATIC_ROLES = {
  read: 'Ratatieto_luku',
  write: 'Ratatieto_kirjoitus',
  admin: 'Ratatieto_admin',
};

const BALISE_ROLES = {
  read: 'Ratatieto_luku_Baliisisanomat',
  write: 'Ratatieto_kirjoitus_Baliisisanomat',
  admin: 'Ratatieto_admin_Baliisisanomat',
};

export type RataExtraUser = {
  uid: string;
  roles?: string[];
  isMockUser?: boolean;
};

export function parseRoles(roles: string): string[] | undefined {
  return roles
    ? (roles
        .replace(/[\"\[\]\\]/g, '')
        .split(',')
        .map((s) => {
          const s1 = s.split('/').pop();
          if (s1) {
            return s1;
          }
          return '';
        })
        .filter(Boolean) as string[])
    : undefined;
}

export const getMockUser = (): RataExtraUser => ({
  uid: MOCK_UID,
  roles: [STATIC_ROLES.read, STATIC_ROLES.admin, BALISE_ROLES.read, BALISE_ROLES.write, BALISE_ROLES.admin],
  isMockUser: true,
});

export const getServiceUser = (): RataExtraUser => ({
  uid: SERVICE_USER_UID,
});

const parseUserFromEvent = async (event: ALBEvent): Promise<RataExtraUser> => {
  if (!ISSUERS) {
    log.error('Issuer missing');
    throw new RataExtraLambdaError('User validation failed', 500);
  }
  const headers = event.headers;
  if (!headers) {
    log.error('Headers missing');
    throw new RataExtraLambdaError('Headers missing', 400);
  }
  const jwt = await validateJwtToken(headers['x-iam-accesstoken'], headers['x-iam-data'], ISSUERS);

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

export const isAdmin = (user: RataExtraUser) => user.roles?.includes(STATIC_ROLES.admin);

const isWriteUser = (user: RataExtraUser, writeRole: string) =>
  user.roles?.includes(writeRole) || user.roles?.includes(STATIC_ROLES.write);

const isBaliseReadUser = (user: RataExtraUser) => user.roles?.includes(BALISE_ROLES.read);

const isBaliseWriteUser = (user: RataExtraUser) => user.roles?.includes(BALISE_ROLES.write);

const isBaliseAdmin = (user: RataExtraUser) => user.roles?.includes(BALISE_ROLES.admin);

export const getUser = async (event: ALBEvent): Promise<RataExtraUser> => {
  if (!STACK_ID || !ENVIRONMENT) {
    log.error('STACK_ID or ENVIRONMENT missing!');
    throw new RataExtraLambdaError('Error', 500);
  }
  if (isFeatOrLocalStack(ENVIRONMENT as RataExtraEnvironment)) {
    return getMockUser();
  }
  return parseUserFromEvent(event);
};

/**
 * Checks if the user has necessary role for read access. Throws 403 Forbidden if not.
 * @param {RataExtraUser} user User being validated
 */
export const validateReadUser = (user: RataExtraUser): void => {
  if (!isReadUser(user)) {
    log.error(user, 'Forbidden: User is not a read user');
    // This should be 403, but those are redirected to /index.html by cloudfront, so 401 is used instead.
    // Fixing this would require using Lambda@Edge to check only frontend origin responses
    throw new RataExtraLambdaError('Forbidden', 401);
  }
};

/**
 * Checks if the user has necessary role for write access. Also checks for admin rights. Throws 403 Forbidden if not authorised.
 * @param {RataExtraUser} user User being validated
 * @param {string} writeRole Role being validated against
 */
export const validateWriteUser = (user: RataExtraUser, writeRole: string): void => {
  if (isAdmin(user) || isWriteUser(user, writeRole)) {
    return;
  } else {
    log.error(user, 'Forbidden: User is not an authorised write user');
    // This should be 403, but those are redirected to /index.html by cloudfront, so 401 is used instead.
    throw new RataExtraLambdaError('Forbidden', 401);
  }
};

/**
 * Checks if the user has necessary "Admin" role. Throws 403 Forbidden if not authorised.
 * @param {RataExtraUser} user User being validated
 */
export const validateAdminUser = (user: RataExtraUser): void => {
  if (isAdmin(user)) {
    return;
  } else {
    log.error(user, 'Forbidden: User is not admin');
    // This should be 403, but those are redirected to /index.html by cloudfront, so 401 is used instead.
    throw new RataExtraLambdaError('Forbidden', 401);
  }
};

/**
 * Checks if the user has necessary role for balise read access. Throws 403 Forbidden if not authorised.
 * @param {RataExtraUser} user User being validated
 */
export const validateBaliseReadUser = (user: RataExtraUser): void => {
  if (isBaliseReadUser(user) || isBaliseWriteUser(user) || isBaliseAdmin(user)) {
    return;
  } else {
    log.error(user, 'Forbidden: User is not a balise read user');
    // This should be 403, but those are redirected to /index.html by cloudfront, so 401 is used instead.
    throw new RataExtraLambdaError('Forbidden', 401);
  }
};

/**
 * Checks if the user has necessary role for balise write access. Also checks for balise admin rights. Throws 403 Forbidden if not authorised.
 * @param {RataExtraUser} user User being validated
 */
export const validateBaliseWriteUser = (user: RataExtraUser): void => {
  if (isBaliseWriteUser(user) || isBaliseAdmin(user)) {
    return;
  } else {
    log.error(user, 'Forbidden: User is not a balise write user');
    // This should be 403, but those are redirected to /index.html by cloudfront, so 401 is used instead.
    throw new RataExtraLambdaError('Forbidden', 401);
  }
};

/**
 * Checks if the user has necessary role for balise admin access. Throws 403 Forbidden if not authorised.
 * @param {RataExtraUser} user User being validated
 */
export const validateBaliseAdminUser = (user: RataExtraUser): void => {
  if (isBaliseAdmin(user)) {
    return;
  } else {
    log.error(user, 'Forbidden: User is not a balise admin user');
    // This should be 403, but those are redirected to /index.html by cloudfront, so 401 is used instead.
    throw new RataExtraLambdaError('Forbidden', 401);
  }
};
