import { ALBEvent, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateBaliseAdminUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import {
  type BaliseWithHistory,
  fetchBaliseWithHistory,
  deleteSingleBalise,
} from '../../utils/balise/baliseArchiveUtils';

const database = await DatabaseClient.build();
const BALISES_BUCKET_NAME = process.env.BALISES_BUCKET_NAME || '';

// Extract and validate balise ID from the request path
async function parseAndValidateBaliseId(event: ALBEvent): Promise<number> {
  const pathParts = event.path.split('/').filter((p) => p);
  const baliseIdStr = pathParts[pathParts.indexOf('balise') + 1];
  const baliseId = parseInt(baliseIdStr || '0', 10);

  if (!baliseId || isNaN(baliseId)) {
    throw new Error('INVALID_BALISE_ID');
  }

  return baliseId;
}

// Generate archive success response
function createSuccessResponse(
  baliseId: number,
  archivedSecondaryId: string,
  uniqueVersionsCount: number,
  archivedFilesCount: number,
): ALBResult {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Balise archived successfully - secondary ID is now available for reuse',
      originalSecondaryId: baliseId,
      archivedSecondaryId: archivedSecondaryId,
      archivedVersions: uniqueVersionsCount,
      archivedFiles: archivedFilesCount,
    }),
  };
}

// Handle specific error types
function handleArchiveError(err: unknown): ALBResult {
  const errorMessage = err instanceof Error ? err.message : String(err);

  if (errorMessage === 'INVALID_BALISE_ID') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Virheellinen tai puuttuva baliisi-tunnus' }),
    };
  }

  if (errorMessage === 'BALISE_NOT_FOUND') {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Baliisia ei löytynyt' }),
    };
  }

  log.error(err);
  return getRataExtraLambdaError(err);
}

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    const baliseId = await parseAndValidateBaliseId(event);

    log.info(user, `Archive balise id: ${baliseId}, path: ${event.path}`);

    validateBaliseAdminUser(user);

    const balise = await fetchBaliseWithHistory(database, baliseId);

    const { archivedSecondaryId, deletedFilesCount } = await deleteSingleBalise(
      database,
      BALISES_BUCKET_NAME,
      balise,
      user.uid,
    );

    // Calculate unique versions count for response
    const allVersions = [
      { version: balise.version, fileTypes: balise.fileTypes },
      ...balise.history.map((h: BaliseWithHistory['history'][0]) => ({
        version: h.version,
        fileTypes: h.fileTypes,
      })),
    ];
    const uniqueVersionsCount = Array.from(new Map(allVersions.map((v) => [v.version, v])).values()).length;

    return createSuccessResponse(baliseId, archivedSecondaryId, uniqueVersionsCount, deletedFilesCount);
  } catch (err) {
    return handleArchiveError(err);
  }
}
