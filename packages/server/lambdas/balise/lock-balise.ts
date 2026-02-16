import { ALBEvent, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateBaliseWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';

const database = await DatabaseClient.build();

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    validateBaliseWriteUser(user);

    // Extract balise ID from path (e.g., /api/balise/12345/lock)
    const pathParts = event.path.split('/').filter((p) => p);
    const baliseIdStr = pathParts[pathParts.indexOf('balise') + 1];
    const baliseId = parseInt(baliseIdStr || '0', 10);

    if (!baliseId || isNaN(baliseId)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Virheellinen tai puuttuva baliisi-tunnus' }),
      };
    }

    // Parse and validate lock reason from request body
    let lockReason: string | undefined;
    if (event.body) {
      try {
        const body = JSON.parse(event.body);
        lockReason = body.lockReason;
      } catch (parseError) {
        log.warn(user, `Failed to parse lock request body: ${parseError}`);
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Virheellinen pyyntö' }),
        };
      }
    }

    if (!lockReason || lockReason.trim().length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Lukitsemisen syy on pakollinen' }),
      };
    }

    log.info(user, `Lock balise id: ${baliseId}, reason: ${lockReason}`);

    const balise = await database.balise.findUnique({
      where: { secondaryId: baliseId },
    });

    if (!balise) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Baliisia ei löytynyt' }),
      };
    }

    // Check if balise is already locked
    if (balise.locked) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Baliisi on jo lukittu käyttäjän ${balise.lockedBy} toimesta.`,
          errorType: 'already_locked',
          lockedBy: balise.lockedBy,
          lockedTime: balise.lockedTime,
          balise: balise,
        }),
      };
    }

    // Lock the balise and capture the current version
    const lockedBalise = await database.balise.update({
      where: { secondaryId: baliseId },
      data: {
        locked: true,
        lockedBy: user.uid,
        lockedTime: new Date(),
        lockedAtVersion: balise.version,
        lockReason: lockReason.trim(),
      },
    });

    log.info(user, `Balise ${baliseId} locked successfully by ${user.uid}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Balise locked successfully', balise: lockedBalise }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
