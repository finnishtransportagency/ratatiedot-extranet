import { ALBEvent, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';

const database = await DatabaseClient.build();

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    const baliseId = parseInt(event.path.split('/').pop() || '0');

    log.info(user, `Get balise by id: ${baliseId}`);
    validateReadUser(user);

    const balise = await database.balise.findUnique({
      where: { secondaryId: baliseId },
      include: {
        history: {
          orderBy: { createdTime: 'desc' },
        },
      },
    });

    if (!balise) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Balise not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(balise),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
