import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../../utils/logger';
import { getUser, validateBaliseWriteUser, isBaliseAdmin } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { VersionStatus } from '../../generated/prisma/client';
import {
  BulkOperationResult,
  parseBaliseIds,
  processBulkOperation,
  handleBulkOperationError,
} from '../../utils/bulkUtils';

const database = await DatabaseClient.build();

interface UnlockContext {
  userUid: string;
  isAdmin: boolean;
}

async function executeUnlock(baliseId: number, context: UnlockContext): Promise<BulkOperationResult> {
  try {
    const balise = await database.balise.findUnique({
      where: { secondaryId: baliseId },
    });

    if (!balise) {
      log.info(`Skipping non-existent balise ${baliseId}`);
      return { baliseId, success: false, skipped: true, error: 'Balise not found' };
    }

    if (!balise.locked) {
      log.info(`Skipping already unlocked balise ${baliseId}`);
      return { baliseId, success: false, skipped: true, error: 'Already unlocked' };
    }

    if (balise.lockedBy !== context.userUid && !context.isAdmin) {
      log.info(`User ${context.userUid} cannot unlock balise ${baliseId} locked by ${balise.lockedBy}`);
      return { baliseId, success: false, skipped: false, error: `Cannot unlock - locked by ${balise.lockedBy}` };
    }

    await database.$transaction(async (tx) => {
      await tx.baliseVersion.updateMany({
        where: { baliseId: balise.id, versionStatus: VersionStatus.UNCONFIRMED },
        data: { versionStatus: VersionStatus.OFFICIAL },
      });

      await tx.balise.update({
        where: { secondaryId: baliseId },
        data: {
          locked: false,
          lockedBy: null,
          lockedTime: null,
          lockedAtVersion: null,
          lockReason: null,
          versionStatus: VersionStatus.OFFICIAL,
        },
      });
    });

    return { baliseId, success: true };
  } catch (error) {
    log.error(`Failed to unlock balise ${baliseId}: ${error}`);
    return { baliseId, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    log.info(user, `Bulk unlock balises request`);

    validateBaliseWriteUser(user);

    const baliseIds = parseBaliseIds(event);
    const isAdmin = isBaliseAdmin(user) || false;
    const response = await processBulkOperation(baliseIds, { userUid: user.uid, isAdmin }, executeUnlock);

    log.info(
      user,
      `Bulk unlock completed: ${response.successCount} unlocked, ${response.skippedCount} skipped, ${response.failureCount} failed`,
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    };
  } catch (err) {
    log.error(err);
    return handleBulkOperationError(err);
  }
}
