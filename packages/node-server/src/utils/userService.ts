import { Request } from 'express';
import { RataExtraEC2Error } from './errors.js';
import { validateJwtToken } from './validateJwtToken.js';
import { isFeatOrLocalStack, RataExtraEnvironment } from './lib.js';
import { log } from './logger.js';

const ISSUER = process.env.JWT_TOKEN_ISSUER;
const ENVIRONMENT = process.env.ENVIRONMENT || '';
const MOCK_UID = process.env.MOCK_UID || '';

const STATIC_ROLES = {
  read: 'Ratatieto_luku',
  write: 'Ratatieto_kirjoitus',
  admin: 'Ratatieto_admin',
};

export type RataExtraUser = {
  uid: string;
  roles?: string[];
  isMockUser?: boolean;
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
  uid: MOCK_UID,
  roles: [/* STATIC_ROLES.read, */ STATIC_ROLES.admin],
  isMockUser: true,
});

const parseUserFromEvent = async (req: Request): Promise<RataExtraUser> => {
  if (!ISSUER) {
    log.error('Issuer missing');
    throw new RataExtraEC2Error('User validation failed', 500);
  }
  const headers = req.headers;
  if (!headers) {
    log.error('Headers missing');
    throw new RataExtraEC2Error('Headers missing', 400);
  }
  const jwt = await validateJwtToken(headers['x-iam-accesstoken'].toString(), headers['x-iam-data'].toString(), ISSUER);

  if (!jwt) {
    throw new RataExtraEC2Error('User validation failed', 500);
  }
  const roles = parseRoles(jwt['custom:rooli']);
  const user: RataExtraUser = {
    uid: jwt['custom:uid'],
    roles,
  };
  return user;
};

const isReadUser = (user: RataExtraUser) => user.roles?.includes(STATIC_ROLES.read);

const isAdmin = (user: RataExtraUser) => user.roles?.includes(STATIC_ROLES.admin);

const isWriteUser = (user: RataExtraUser, writeRole: string) =>
  user.roles?.includes(writeRole) || user.roles?.includes(STATIC_ROLES.write);

export const getUser = async (event: Request): Promise<RataExtraUser> => {
  if (!ENVIRONMENT) {
    log.error('ENVIRONMENT missing!');
    throw new RataExtraEC2Error('Error', 500);
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
    throw new RataExtraEC2Error('Forbidden', 401);
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
    throw new RataExtraEC2Error('Forbidden', 401);
  }
};
