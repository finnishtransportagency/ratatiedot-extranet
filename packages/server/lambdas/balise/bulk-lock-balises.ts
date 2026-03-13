import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../../utils/logger';
import { getUser, validateBaliseWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import {
  BulkOperationResult,
  parseBaliseIds,
  parseLockReason,
  processBulkOperation,
  handleBulkOperationError,
} from '../../utils/balise/bulkUtils';

const database = await DatabaseClient.build();

interface LockContext {
  userUid: string;
  lockReason: string;
}

async function executeLock(baliseId: number, context: LockContext): Promise<BulkOperationResult> {
  try {
    const balise = await database.balise.findUnique({
      where: { secondaryId: baliseId },
    });

    if (!balise) {
      log.info(`Skipping non-existent balise ${baliseId}`);
      return { baliseId, success: false, skipped: true, error: 'Balise not found' };
    }

    if (balise.locked) {
      log.info(`Skipping already locked balise ${baliseId}`);
      return { baliseId, success: false, skipped: true, error: 'Already locked' };
    }

    await database.balise.update({
      where: { secondaryId: baliseId },
      data: {
        locked: true,
        lockedBy: context.userUid,
        lockedTime: new Date(),
        lockedAtVersion: balise.version,
        lockReason: context.lockReason,
      },
    });

    return { baliseId, success: true };
  } catch (error) {
    log.error(`Failed to lock balise ${baliseId}: ${error}`);
    return { baliseId, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    log.info(user, `Bulk lock balises request`);

    validateBaliseWriteUser(user);

    const baliseIds = parseBaliseIds(event);
    const lockReason = parseLockReason(event);
    const response = await processBulkOperation(baliseIds, { userUid: user.uid, lockReason }, executeLock);

    log.info(
      user,
      `Bulk lock completed: ${response.successCount} locked, ${response.skippedCount} skipped, ${response.failureCount} failed`,
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
