import { S3 } from 'aws-sdk';
import { log } from './logger';

const s3 = new S3();

export interface FileUpload {
  filename: string;
  buffer: Buffer;
}

export async function uploadToS3(bucket: string, fileName: string, fileData: Buffer) {
  const params = {
    Bucket: bucket,
    Key: fileName,
    Body: fileData,
    ACL: 'private',
  };

  await s3.upload(params).promise();
}

// a function to delete a file from S3
export async function deleteFromS3(bucket: string, fileName: string) {
  const params = {
    Bucket: bucket,
    Key: fileName,
  };

  await s3.deleteObject(params).promise();
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

  log.info(userId, `Uploaded file to S3: ${fileName}`);
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

  log.info(userId, `Deleted file from S3: ${fileName}`);
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
      log.error(userId, `Failed to upload file to S3 after retries: ${s3Key}`, error);
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
      log.warn(userId, `Cleaning up ${successfulUploads.length} successfully uploaded files due to batch failure`);

      // Attempt cleanup but don't fail the entire operation if cleanup fails
      const cleanupPromises = successfulUploads.map(async (result) => {
        try {
          await deleteFromS3WithRetry(bucket, result.s3Key, userId);
        } catch (cleanupError) {
          log.error(userId, `Failed to cleanup S3 file: ${result.s3Key}`, cleanupError);
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
  const copyParams = {
    Bucket: bucket,
    CopySource: `${bucket}/${sourceKey}`,
    Key: destKey,
  };

  await s3.copyObject(copyParams).promise();
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

  log.info(userId, `Copied S3 object from ${sourceKey} to ${destKey}`);
}

/**
 * Archives files by copying to archive location and then deleting originals
 * Implements proper error handling to avoid partial states
 */
export async function archiveS3FilesWithCleanup(
  bucket: string,
  filesToArchive: Array<{ sourceKey: string; archiveKey: string }>,
  userId: string,
): Promise<{ successCount: number; failureCount: number }> {
  const results = {
    successCount: 0,
    failureCount: 0,
    copiedFiles: [] as string[],
  };

  // Phase 1: Copy all files to archive
  for (const { sourceKey, archiveKey } of filesToArchive) {
    try {
      await copyS3ObjectWithRetry(bucket, sourceKey, archiveKey, userId);
      results.copiedFiles.push(sourceKey);
      log.info(userId, `Successfully archived ${sourceKey} to ${archiveKey}`);
    } catch (error) {
      log.error(userId, `Failed to archive ${sourceKey} to ${archiveKey}`, error);
      results.failureCount++;

      // If copy fails, we don't want to proceed with deletion
      // Clean up any files we've already copied in this batch
      if (results.copiedFiles.length > 0) {
        log.warn(userId, `Cleaning up ${results.copiedFiles.length} partially copied archive files`);
        const cleanupPromises = results.copiedFiles.map(async (copiedSourceKey) => {
          const correspondingArchiveKey = filesToArchive.find((f) => f.sourceKey === copiedSourceKey)?.archiveKey;
          if (correspondingArchiveKey) {
            try {
              await deleteFromS3WithRetry(bucket, correspondingArchiveKey, userId);
            } catch (cleanupError) {
              log.error(userId, `Failed to cleanup archived file: ${correspondingArchiveKey}`, cleanupError);
            }
          }
        });
        await Promise.allSettled(cleanupPromises);
      }

      throw new Error(`Archive operation failed at ${sourceKey}: ${error}`);
    }
  }

  // Phase 2: Delete original files (only if all copies succeeded)
  for (const { sourceKey } of filesToArchive) {
    try {
      await deleteFromS3WithRetry(bucket, sourceKey, userId);
      results.successCount++;
      log.info(userId, `Successfully deleted original file: ${sourceKey}`);
    } catch (error) {
      log.error(userId, `Failed to delete original file: ${sourceKey}`, error);
      results.failureCount++;
      // Continue with other deletions even if one fails
      // The archived copy exists, so we're not losing data
    }
  }

  return {
    successCount: results.successCount,
    failureCount: results.failureCount,
  };
}
