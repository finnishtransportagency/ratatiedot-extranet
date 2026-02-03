import { ALBEvent, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateBaliseReadUser, isBaliseAdmin } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { resolveBalisesForUser } from '../../utils/baliseVersionUtils';

const database = await DatabaseClient.build();

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    // Extract balise ID from path (e.g., /api/balise/12345 or /api/balise/12345/edit)
    const pathParts = event.path.split('/').filter((p) => p);
    const baliseIdStr = pathParts[pathParts.indexOf('balise') + 1];
    const baliseId = parseInt(baliseIdStr || '0', 10);

    log.info(user, `Get balise by id: ${baliseId}, path: ${event.path}`);

    if (!baliseId || isNaN(baliseId)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid or missing balise ID' }),
      };
    }

    validateBaliseReadUser(user);
    const isAdmin = isBaliseAdmin(user);

    const balise = await database.balise.findUnique({
      where: { secondaryId: baliseId },
      include: {
        history: isAdmin
          ? {
              orderBy: { createdTime: 'desc' },
            }
          : false,
      },
    });

    if (!balise) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Balise not found' }),
      };
    }

    // Resolve to latest OFFICIAL version if current is UNCONFIRMED (unless user is admin or lock owner)
    const [resolvedBalise] = await resolveBalisesForUser(database, [balise], user.uid, isAdmin);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resolvedBalise),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
