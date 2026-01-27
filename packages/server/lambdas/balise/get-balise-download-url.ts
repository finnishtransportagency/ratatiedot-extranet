import { ALBEvent, ALBResult } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateBaliseReadUser, validateBaliseAdminUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';

const database = await DatabaseClient.build();
const s3 = new S3();
const BALISES_BUCKET_NAME = process.env.BALISES_BUCKET_NAME || '';
// Using existing AWS SDK v2 (same as s3utils.ts) to generate presigned URLs

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    // Extract balise ID from path (e.g., /api/balise/12345/download)
    const pathParts = event.path.split('/').filter((p) => p);
    const baliseIdStr = pathParts[pathParts.indexOf('balise') + 1];
    const baliseId = parseInt(baliseIdStr || '0', 10);
    const fileName = event.queryStringParameters?.fileName;
    const versionStr = event.queryStringParameters?.version;
    const requestedVersion = versionStr ? parseInt(versionStr, 10) : undefined;

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

    // If requesting a historical version (not current), require admin access
    if (requestedVersion !== undefined && !isNaN(requestedVersion) && requestedVersion !== balise.version) {
      validateBaliseAdminUser(user);
    }

    // Check if the requested file exists for this balise
    if (!balise.fileTypes.includes(fileName)) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Tiedostoa '${fileName}' ei löydy tälle balisille` }),
      };
    }

    // Note: We don't block downloads for locked balises - users can download but not modify

    // Determine which version to use
    const version = requestedVersion !== undefined && !isNaN(requestedVersion) ? requestedVersion : balise.version;

    // If a specific version is requested, verify it exists
    if (requestedVersion !== undefined && !isNaN(requestedVersion)) {
      if (requestedVersion === balise.version) {
        // Current version - check current balise
        if (!balise.fileTypes.includes(fileName)) {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: `Tiedostoa '${fileName}' ei löydy tälle versiolle` }),
          };
        }
      } else {
        // Historical version - check version history
        const versionHistory = await database.baliseVersion.findFirst({
          where: {
            secondaryId: baliseId,
            version: requestedVersion,
          },
        });

        if (!versionHistory) {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: `Versiota ${requestedVersion} ei löydy` }),
          };
        }

        if (!versionHistory.fileTypes.includes(fileName)) {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: `Tiedostoa '${fileName}' ei löydy versiolle ${requestedVersion}` }),
          };
        }
      }
    } else {
      // No version specified - use current version
      if (!balise.fileTypes.includes(fileName)) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: `Tiedostoa '${fileName}' ei löydy tälle balisille` }),
        };
      }
    }

    // Generate S3 file key with hierarchical structure: balise_{secondaryId}/v{version}/{fileName}
    const fileKey = `balise_${balise.secondaryId}/v${version}/${fileName}`;

    // Generate presigned URL (expires in 1 hour)
    const downloadUrl = s3.getSignedUrl('getObject', {
      Bucket: BALISES_BUCKET_NAME,
      Key: fileKey,
      Expires: 3600, // 1 hour
    });

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
