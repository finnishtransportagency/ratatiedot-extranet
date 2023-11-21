import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, isAdmin } from '../../utils/userService';

/**
 * Check user's right based on given page. Example request: /api/admin
 * @param {ALBEvent} event
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  const permission = { isAdmin: false };

  try {
    const user = await getUser(event);
    log.info(user, `Check admin permission`);

    if (isAdmin(user)) {
      permission.isAdmin = true;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(permission),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
