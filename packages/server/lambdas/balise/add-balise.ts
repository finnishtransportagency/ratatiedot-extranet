import { ALBEvent, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';

const database = await DatabaseClient.build();

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    const baliseId = parseInt(event.path.split('/').pop() || '0');
    const body = event.body ? JSON.parse(event.body) : {};

    log.info(user, `Create or update balise. id: ${baliseId}`);
    validateWriteUser(user, '');

    const existingBalise = await database.balise.findUnique({
      where: { secondaryId: baliseId },
    });

    if (existingBalise) {
      await database.baliseHistory.create({
        data: {
          baliseId: existingBalise.id,
          version: existingBalise.version,
          bucketId: existingBalise.bucketId,
          fileTypes: existingBalise.fileTypes,
          createdBy: existingBalise.createdBy,
          createdTime: existingBalise.createdTime,
        },
      });

      const updatedBalise = await database.balise.update({
        where: { secondaryId: baliseId },
        data: {
          version: body.version || existingBalise.version + 1,
          bucketId: body.bucketId || existingBalise.bucketId,
          fileTypes: body.fileTypes || existingBalise.fileTypes,
          createdBy: user.uid,
          createdTime: new Date(),
          locked: false,
          lockedBy: null,
          lockedTime: null,
        },
      });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBalise),
      };
    } else {
      const newBalise = await database.balise.create({
        data: {
          secondaryId: baliseId,
          version: body.version || 1,
          bucketId: body.bucketId || `balise-${baliseId}`,
          fileTypes: body.fileTypes || [],
          createdBy: user.uid,
          createdTime: new Date(),
          locked: false,
        },
      });
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBalise),
      };
    }
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
