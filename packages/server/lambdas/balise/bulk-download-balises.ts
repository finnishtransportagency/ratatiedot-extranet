import { ALBEvent, ALBResult } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import archiver from 'archiver';
import { PassThrough, Readable } from 'stream';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateBaliseReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';

const database = await DatabaseClient.build();
const s3Client = new S3Client({});
const BALISES_BUCKET_NAME = process.env.BALISES_BUCKET_NAME || '';

interface BulkDownloadRequest {
  baliseIds: number[];
}

/**
 * Helper to convert a ReadableStream/Readable to a Buffer
 */
async function streamToBuffer(stream: Readable | ReadableStream | Blob): Promise<Buffer> {
  if (stream instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
  throw new Error('Unsupported stream type');
}

/**
 * Bulk download endpoint - creates a zip file containing all requested files.
 * Returns the zip as a binary response.
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    validateBaliseReadUser(user);

    log.info(user, `Bulk download request`);

    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const body: BulkDownloadRequest = JSON.parse(
      event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf-8') : event.body,
    );

    if (!body.baliseIds || !Array.isArray(body.baliseIds) || body.baliseIds.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'baliseIds array is required' }),
      };
    }

    // Fetch all balise records with fileTypes
    const baliseRecords = await database.balise.findMany({
      where: { secondaryId: { in: body.baliseIds } },
      select: { secondaryId: true, version: true, lockedAtVersion: true, fileTypes: true },
    });

    // For locked balises, we need to fetch fileTypes from the official version (lockedAtVersion)
    const lockedBaliseIds = baliseRecords
      .filter((b) => b.lockedAtVersion !== null && b.lockedAtVersion !== b.version)
      .map((b) => b.secondaryId);

    // Fetch official version fileTypes for locked balises
    const officialVersions =
      lockedBaliseIds.length > 0
        ? await database.baliseVersion.findMany({
            where: {
              secondaryId: { in: lockedBaliseIds },
              version: { in: baliseRecords.filter((b) => b.lockedAtVersion !== null).map((b) => b.lockedAtVersion!) },
            },
            select: { secondaryId: true, version: true, fileTypes: true },
          })
        : [];

    // Build map: secondaryId -> { version, fileTypes } using official version data
    const officialVersionMap = new Map(officialVersions.map((v) => [v.secondaryId, v]));

    interface BaliseData {
      version: number;
      fileTypes: string[];
    }
    const baliseDataMap = new Map<number, BaliseData>();
    for (const b of baliseRecords) {
      if (b.lockedAtVersion !== null && b.lockedAtVersion !== b.version) {
        // Use official version data
        const official = officialVersionMap.get(b.secondaryId);
        if (official) {
          baliseDataMap.set(b.secondaryId, { version: official.version, fileTypes: official.fileTypes });
        }
      } else {
        // Not locked or lockedAtVersion equals current version - use current
        baliseDataMap.set(b.secondaryId, { version: b.lockedAtVersion ?? b.version, fileTypes: b.fileTypes });
      }
    }

    // Create zip archive
    const archive = archiver('zip', { zlib: { level: 5 } });
    const passThrough = new PassThrough();
    archive.pipe(passThrough);

    // Collect all file buffers first (fetch in parallel)
    const filePromises: Promise<{ folder: string; filename: string; buffer: Buffer } | null>[] = [];

    for (const baliseId of body.baliseIds) {
      const baliseData = baliseDataMap.get(baliseId);
      if (!baliseData) {
        log.warn(user, `Balise ${baliseId} not found, skipping`);
        continue;
      }

      const folderName = `${baliseId}`;

      // Use fileTypes from the official version (backend-determined, not frontend-provided)
      for (const filename of baliseData.fileTypes) {
        filePromises.push(
          (async () => {
            try {
              const fileKey = `balise_${baliseId}/v${baliseData.version}/${filename}`;
              const response = await s3Client.send(new GetObjectCommand({ Bucket: BALISES_BUCKET_NAME, Key: fileKey }));
              if (!response.Body) return null;
              const buffer = await streamToBuffer(response.Body as Readable);
              return { folder: folderName, filename, buffer };
            } catch (error) {
              log.error(`Error fetching file ${filename} for balise ${baliseId}: ${error}`);
              return null;
            }
          })(),
        );
      }
    }

    // Wait for all files to be fetched
    const results = await Promise.all(filePromises);

    // Add files to archive
    for (const result of results) {
      if (result) {
        archive.append(result.buffer, { name: `${result.folder}/${result.filename}` });
      }
    }

    // Finalize archive
    await archive.finalize();

    // Collect zip data
    const zipBuffer = await streamToBuffer(passThrough);

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `balise_files_${timestamp}.zip`;

    log.info(user, `Bulk download: returning zip with ${results.filter(Boolean).length} files`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
      body: zipBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
