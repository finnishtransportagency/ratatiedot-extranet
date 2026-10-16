import { ALBEvent, ALBResult } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser } from '../../utils/userService';
import { validateBaliseCapability, hasBaliseCapability } from '../../utils/balise/balisePermissions';
import { DatabaseClient } from '../database/client';
import {
  parseVersionParameter,
  validateVersionParameterAccess,
  validateLockOwnerVersionAccess,
  getVersionFileTypes,
} from '../../utils/balise/baliseVersionUtils';

const database = await DatabaseClient.build();
const s3Client = new S3Client({});
const BALISES_BUCKET_NAME = process.env.BALISES_BUCKET_NAME || '';

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    validateBaliseCapability(user, 'read');

    // Extract balise ID from path (e.g., /api/balise/12345/download)
    const pathParts = event.path.split('/').filter((p) => p);
    const baliseIdStr = pathParts[pathParts.indexOf('balise') + 1];
    const baliseId = parseInt(baliseIdStr || '0', 10);
    const requestedVersion = parseVersionParameter(event.queryStringParameters);

    log.info(user, `Get download URLs for balise ${baliseId}, version: ${requestedVersion}, path: ${event.path}`);

    if (!baliseId || isNaN(baliseId)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Virheellinen tai puuttuva baliisi-tunnus' }),
      };
    }

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

    const canViewHistory = hasBaliseCapability(user, 'viewHistory');

    validateVersionParameterAccess(user, requestedVersion, balise, canViewHistory);

    // If lock owner specified a version, validate they can only access versions from their lock session
    const isLockOwner = balise.locked && balise.lockedBy === user.uid;
    if (requestedVersion !== undefined && isLockOwner && !canViewHistory) {
      validateLockOwnerVersionAccess(requestedVersion, balise);
    }

    // Resolve which version to use:
    const officialVersion =
      balise.lockedAtVersion !== null && balise.lockedAtVersion !== balise.version
        ? balise.lockedAtVersion
        : balise.version;
    const version = requestedVersion ?? officialVersion;

    // Get fileTypes for the requested version (handles both current and historical)
    const versionData = await getVersionFileTypes(database, baliseId, version, balise);

    // Generate presigned URLs for all files in this version
    const downloadUrls = await Promise.all(
      versionData.fileTypes.map(async (fileName) => {
        const fileKey = `balise_${balise.secondaryId}/v${version}/${fileName}`;
        const url = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: BALISES_BUCKET_NAME,
            Key: fileKey,
          }),
          {
            expiresIn: 3600, // 1 hour
          },
        );
        return { fileName, url };
      }),
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        downloadUrls,
        expiresIn: 3600,
        baliseId: balise.secondaryId,
        version,
      }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
