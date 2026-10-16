import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser } from '../../utils/userService';
import { getBaliseCapabilities } from '../../utils/balise/balisePermissions';

/**
 * Check user's balise permissions. Example request: /api/balise/permissions
 * @param {ALBEvent} event
 * @returns  {Promise<ALBResult>} JSON stringified object with balise permissions
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    log.info(user, `Check balise permissions`);

    const capabilities = getBaliseCapabilities(user);
    const permissions = {
      canRead: capabilities.has('read'),
      canWrite: capabilities.has('write'),
      canUnlockOthers: capabilities.has('unlockOthers'),
      canDelete: capabilities.has('delete'),
      canDeleteLocked: capabilities.has('deleteLocked'),
      canViewHistory: capabilities.has('viewHistory'),
      canManageSections: capabilities.has('manageSections'),
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
