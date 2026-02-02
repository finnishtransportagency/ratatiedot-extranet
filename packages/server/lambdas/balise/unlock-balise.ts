import { ALBEvent, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateBaliseWriteUser, isBaliseAdmin } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { VersionStatus } from '../../generated/prisma/client';

const database = await DatabaseClient.build();

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    // Extract balise ID from path (e.g., /api/balise/12345/unlock)
    const pathParts = event.path.split('/').filter((p) => p);
    const baliseIdStr = pathParts[pathParts.indexOf('balise') + 1];
    const baliseId = parseInt(baliseIdStr || '0', 10);

    log.info(user, `Unlock balise id: ${baliseId}, path: ${event.path}`);

    if (!baliseId || isNaN(baliseId)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Virheellinen tai puuttuva baliisi-tunnus' }),
      };
    }

    validateBaliseWriteUser(user);

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

    // Check if balise is locked
    if (!balise.locked) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Baliisi ei ole lukittu' }),
      };
    }

    // Check if user is the one who locked it or is an admin
    const isAdmin = isBaliseAdmin(user);
    if (balise.lockedBy !== user.uid && !isAdmin) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `Lukituksen voi poistaa vain käyttäjä ${balise.lockedBy} tai järjestelmän ylläpitäjä.`,
          errorType: 'permission',
          lockedBy: balise.lockedBy,
        }),
      };
    }

    // Unlock the balise and promote all unconfirmed versions to official
    // Use a transaction to ensure atomicity
    const unlockedBalise = await database.$transaction(async (tx) => {
      await tx.baliseVersion.updateMany({
        where: {
          baliseId: balise.id,
          versionStatus: VersionStatus.UNCONFIRMED,
        },
        data: {
          versionStatus: VersionStatus.OFFICIAL,
        },
      });

      const unlockedBalise = await tx.balise.update({
        where: { secondaryId: baliseId },
        data: {
          locked: false,
          lockedBy: null,
          lockedTime: null,
          lockedAtVersion: null,
          versionStatus: VersionStatus.OFFICIAL,
        },
      });

      return unlockedBalise;
    });

    log.info(user, `Balise ${baliseId} unlocked successfully by ${user.uid}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Balise unlocked successfully', balise: unlockedBalise }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
