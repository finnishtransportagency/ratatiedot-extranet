import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, RataExtraUser } from '../../utils/userService';

const BALISE_ROLES = {
  read: 'Ratatieto_luku_Baliisisanomat',
  write: 'Ratatieto_kirjoitus_Baliisisanomat',
  admin: 'Ratatieto_admin_Baliisisanomat',
};

const isBaliseReadUser = (user: RataExtraUser) => user.roles?.includes(BALISE_ROLES.read);
const isBaliseWriteUser = (user: RataExtraUser) => user.roles?.includes(BALISE_ROLES.write);
const isBaliseAdmin = (user: RataExtraUser) => user.roles?.includes(BALISE_ROLES.admin);

/**
 * Check user's balise permissions. Example request: /api/balise/permissions
 * @param {ALBEvent} event
 * @returns  {Promise<ALBResult>} JSON stringified object with balise permissions
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    log.info(user, `Check balise permissions`);

    const permissions = {
      canRead: isBaliseReadUser(user) || isBaliseWriteUser(user) || isBaliseAdmin(user),
      canWrite: isBaliseWriteUser(user) || isBaliseAdmin(user),
      isAdmin: isBaliseAdmin(user),
      currentUserUid: user.uid,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(permissions),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
