import { ALBEvent, ALBResult } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateBaliseReadUser, isBaliseAdmin } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import {
  parseVersionParameter,
  validateVersionParameterAccess,
  validateLockOwnerVersionAccess,
  getVersionFileTypes,
  validateFileInVersion,
} from '../../utils/baliseVersionUtils';

const database = await DatabaseClient.build();
const s3Client = new S3Client({});
const BALISES_BUCKET_NAME = process.env.BALISES_BUCKET_NAME || '';

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    // Extract balise ID from path (e.g., /api/balise/12345/download)
    const pathParts = event.path.split('/').filter((p) => p);
    const baliseIdStr = pathParts[pathParts.indexOf('balise') + 1];
    const baliseId = parseInt(baliseIdStr || '0', 10);
    const fileName = event.queryStringParameters?.fileName;
    const requestedVersion = parseVersionParameter(event.queryStringParameters);

    log.info(
      user,
      `Get download URL for balise ${baliseId}, fileName: ${fileName}, version: ${requestedVersion}, path: ${event.path}`,
    );

    if (!baliseId || isNaN(baliseId)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Virheellinen tai puuttuva baliisi-tunnus' }),
      };
    }

    if (!fileName) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Tiedostonimi puuttuu' }),
      };
    }

    validateBaliseReadUser(user);

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

    // Check if user is admin
    const isAdmin = isBaliseAdmin(user) ?? false;

    // Validate that only admins and lock owners can specify version parameter
    validateVersionParameterAccess(user, requestedVersion, balise, isAdmin);

    // If lock owner specified a version, validate they can only access versions from their lock session
    const isLockOwner = balise.locked && balise.lockedBy === user.uid;
    if (requestedVersion !== undefined && isLockOwner && !isAdmin) {
      validateLockOwnerVersionAccess(requestedVersion, balise);
    }

    // Use requested version if specified, otherwise use current balise version
    const version = requestedVersion ?? balise.version;

    // Get fileTypes for the requested version (handles both current and historical)
    const versionData = await getVersionFileTypes(database, baliseId, version, balise);

    // Validate that the requested file exists in this version
    validateFileInVersion(versionData.fileTypes, fileName, version);

    // Generate S3 file key with hierarchical structure: balise_{secondaryId}/v{version}/{fileName}
    const fileKey = `balise_${balise.secondaryId}/v${version}/${fileName}`;

    // Generate presigned URL (expires in 1 hour)
    const downloadUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: BALISES_BUCKET_NAME,
        Key: fileKey,
      }),
      {
        expiresIn: 3600, // 1 hour
      },
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        downloadUrl,
        expiresIn: 3600,
        fileName,
        baliseId: balise.secondaryId,
      }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
