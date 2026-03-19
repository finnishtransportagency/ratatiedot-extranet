import { S3Client, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { log } from './logger';

const s3Client = new S3Client({});

export interface FileUpload {
  filename: string;
  buffer: Buffer;
}

export async function uploadToS3(bucket: string, fileName: string, fileData: Buffer) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    Body: fileData,
    ACL: 'private',
  });

  await s3Client.send(command);
}

// a function to delete a file from S3
export async function deleteFromS3(bucket: string, fileName: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: fileName,
  });

  await s3Client.send(command);
}

/**
 * Retries an async operation with exponential backoff
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: delay increases with each attempt
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Uploads a single file to S3 with retry logic
 */
export async function uploadToS3WithRetry(
  bucket: string,
  fileName: string,
  fileData: Buffer,
  userId: string,
): Promise<void> {
  await retryOperation(
    async () => {
      await uploadToS3(bucket, fileName, fileData);
    },
    3, // max retries
    1000, // base delay in ms
  );

  log.info(`[${userId}] Uploaded file to S3: ${fileName}`);
}

/**
 * Deletes a single file from S3 with retry logic
 */
export async function deleteFromS3WithRetry(bucket: string, fileName: string, userId: string): Promise<void> {
  await retryOperation(
    async () => {
      await deleteFromS3(bucket, fileName);
    },
    2, // fewer retries for cleanup
    500, // shorter delay for cleanup
  );

  log.info(`[${userId}] Deleted file from S3: ${fileName}`);
}

/**
 * Uploads multiple files to S3 with consistent path structure
 * Includes retry logic and cleanup of successfully uploaded files on failure
 */
export async function uploadFilesToS3WithCleanup(
  bucket: string,
  files: FileUpload[],
  pathPrefix: string,
  userId: string,
): Promise<string[]> {
  const uploadResults: { filename: string; s3Key: string; success: boolean }[] = [];

  const uploadPromises = files.map(async (file) => {
    const s3Key = `${pathPrefix}/${file.filename}`;
    try {
      await uploadToS3WithRetry(bucket, s3Key, file.buffer, userId);
      uploadResults.push({ filename: file.filename, s3Key, success: true });
      return file.filename;
    } catch (error) {
      log.error(`[${userId}] Failed to upload file to S3 after retries: ${s3Key}, ${error}`);
      uploadResults.push({ filename: file.filename, s3Key, success: false });
      throw error;
    }
  });

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    // If any upload failed, clean up the successfully uploaded files
    const successfulUploads = uploadResults.filter((result) => result.success);
    if (successfulUploads.length > 0) {
      log.warn(`[${userId}] Cleaning up ${successfulUploads.length} successfully uploaded files due to batch failure`);

      // Attempt cleanup but don't fail the entire operation if cleanup fails
      const cleanupPromises = successfulUploads.map(async (result) => {
        try {
          await deleteFromS3WithRetry(bucket, result.s3Key, userId);
        } catch (cleanupError) {
          log.error(`[${userId}] Failed to cleanup S3 file: ${result.s3Key}, ${cleanupError}`);
        }
      });

      await Promise.allSettled(cleanupPromises);
    }

    throw error; // Re-throw the original error
  }
}

/**
 * Copies an S3 object from one location to another
 */
export async function copyS3Object(bucket: string, sourceKey: string, destKey: string) {
  const command = new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${bucket}/${sourceKey}`,
    Key: destKey,
  });

  await s3Client.send(command);
}

/**
 * Copies an S3 object with retry logic
 */
export async function copyS3ObjectWithRetry(
  bucket: string,
  sourceKey: string,
  destKey: string,
  userId: string,
): Promise<void> {
  await retryOperation(
    async () => {
      await copyS3Object(bucket, sourceKey, destKey);
    },
    3, // max retries
    1000, // base delay in ms
  );

  log.info(`[${userId}] Copied S3 object from ${sourceKey} to ${destKey}`);
}

/**
 * Copy files to archive location
 * Throws error if any copy fails, with automatic cleanup of successful copies
 * @returns Array of successfully copied source keys
 */
export async function copyFilesToArchive(
  bucket: string,
  filesToArchive: Array<{ sourceKey: string; archiveKey: string }>,
  userId: string,
): Promise<string[]> {
  // Phase 1: Copy all files to archive in parallel
  const copyPromises = filesToArchive.map(async ({ sourceKey, archiveKey }) => {
    try {
      await copyS3ObjectWithRetry(bucket, sourceKey, archiveKey, userId);
      log.info(`[${userId}] Successfully archived ${sourceKey} to ${archiveKey}`);
      return { sourceKey, archiveKey, success: true };
    } catch (error) {
      log.error(`[${userId}] Failed to archive ${sourceKey} to ${archiveKey}, ${error}`);
      return { sourceKey, archiveKey, success: false, error };
    }
  });

  const copyResults = await Promise.all(copyPromises);

  // Track successful copies and check for failures
  const successfulCopies = copyResults.filter((r) => r.success);
  const failedCopies = copyResults.filter((r) => !r.success);

  if (failedCopies.length > 0) {
    // Clean up successfully copied files since the batch failed
    log.warn(
      `[${userId}] Cleaning up ${successfulCopies.length} copied archive files due to ${failedCopies.length} failures`,
    );

    const cleanupPromises = successfulCopies.map(async ({ archiveKey }) => {
      try {
        await deleteFromS3WithRetry(bucket, archiveKey, userId);
      } catch (cleanupError) {
        log.error(`[${userId}] Failed to cleanup archived file: ${archiveKey}, ${cleanupError}`);
      }
    });

    await Promise.allSettled(cleanupPromises);

    throw new Error(
      `Archive copy operation failed: ${failedCopies.length} of ${filesToArchive.length} files failed to copy`,
    );
  }

  return successfulCopies.map((r) => r.sourceKey);
}

/**
 * Delete original files after successful archival
 * Logs errors but does not throw - orphaned files can be cleaned up later
 * @returns Count of successfully deleted files
 */
export async function deleteOriginalFiles(
  bucket: string,
  sourceKeys: string[],
  userId: string,
): Promise<{ successCount: number; failureCount: number }> {
  const deletePromises = sourceKeys.map(async (sourceKey) => {
    try {
      await deleteFromS3WithRetry(bucket, sourceKey, userId);
      log.info(`[${userId}] Successfully deleted original file: ${sourceKey}`);
      return { sourceKey, success: true };
    } catch (error) {
      log.error(`[${userId}] Failed to delete original file: ${sourceKey}, ${error}`);
      return { sourceKey, success: false };
    }
  });

  const deleteResults = await Promise.all(deletePromises);

  return {
    successCount: deleteResults.filter((r) => r.success).length,
    failureCount: deleteResults.filter((r) => !r.success).length,
  };
}
