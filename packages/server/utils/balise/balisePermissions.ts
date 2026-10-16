import { RataExtraLambdaError } from '../errors';
import { log } from '../logger';
import type { RataExtraUser } from '../userService';

export const BALISE_ROLES = {
  read: 'ratatieto_luku_baliisisanomat',
  readRaide: 'ratatieto_luku_baliisisanomat_raide',
  write: 'ratatieto_kirjoitus_baliisisanomat',
  liteAdmin: 'ratatieto_liteadmin_baliisisanomat',
  admin: 'ratatieto_admin_baliisisanomat',
};

export type BaliseCapability =
  | 'read'
  | 'write'
  | 'unlockOthers'
  | 'delete'
  | 'deleteLocked'
  | 'viewHistory'
  | 'manageSections';

const BALISE_WRITE_CAPABILITIES: BaliseCapability[] = ['read', 'write', 'delete'];

const BALISE_ROLE_CAPABILITIES: Record<string, BaliseCapability[]> = {
  [BALISE_ROLES.read]: ['read'],
  [BALISE_ROLES.readRaide]: ['read'],
  [BALISE_ROLES.write]: BALISE_WRITE_CAPABILITIES,
  [BALISE_ROLES.liteAdmin]: [...BALISE_WRITE_CAPABILITIES, 'unlockOthers'],
  [BALISE_ROLES.admin]: [...BALISE_WRITE_CAPABILITIES, 'unlockOthers', 'deleteLocked', 'viewHistory', 'manageSections'],
};

export const getBaliseCapabilities = (user: RataExtraUser): Set<BaliseCapability> =>
  new Set(user.roles?.flatMap((role) => BALISE_ROLE_CAPABILITIES[role.toLowerCase()] ?? []));

export const hasBaliseCapability = (user: RataExtraUser, capability: BaliseCapability): boolean =>
  getBaliseCapabilities(user).has(capability);

export const canDeleteBalise = (user: RataExtraUser, balise: { locked: boolean }): boolean =>
  hasBaliseCapability(user, 'delete') && (!balise.locked || hasBaliseCapability(user, 'deleteLocked'));

/**
 * Checks if the user has the given balise capability. Throws 401 Forbidden if not authorised.
 * @param {RataExtraUser} user User being validated
 * @param {BaliseCapability} capability Required capability
 */
export const validateBaliseCapability = (user: RataExtraUser, capability: BaliseCapability): void => {
  if (!hasBaliseCapability(user, capability)) {
    log.error(user, `Forbidden: User lacks balise capability '${capability}'`);
    // This should be 403, but those are redirected to /index.html by cloudfront, so 401 is used instead.
    throw new RataExtraLambdaError('Forbidden', 401);
  }
};
