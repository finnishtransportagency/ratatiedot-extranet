import { useState, useCallback, useRef } from 'react';

interface FileWithBaliseId {
  file: File;
  baliseId: number | null;
  isValid: boolean;
}

interface UploadResult {
  baliseId: number;
  success: boolean;
  newVersion?: number;
  previousVersion?: number;
  filesUploaded?: number;
  error?: string;
  errorType?: 'not_locked' | 'locked_by_other' | 'not_found' | 'permission' | 'storage' | 'unknown';
  lockedBy?: string;
  isNewBalise?: boolean;
}

interface UploadResponse {
  success: boolean;
  message: string;
  results: UploadResult[];
  invalidFiles?: string[];
  totalFiles?: number;
  totalBalises?: number;
}

interface ValidationFailure {
  baliseId: number;
  errorType: 'not_locked' | 'locked_by_other';
  lockedBy?: string;
  message: string;
}

interface ValidationErrorResponse {
  success: false;
  error: string;
  errorType: 'validation_failed';
  failures: ValidationFailure[];
}

export interface BatchUploadProgress {
  currentBatch: number;
  totalBatches: number;
  filesUploaded: number;
  totalFiles: number;
  balisesProcessed: number;
  successCount: number;
  failureCount: number;
  retriedBatches: number;
}

interface BatchUploadResult {
  success: boolean;
  message: string;
  results: UploadResult[];
  invalidFiles: string[];
  totalFiles: number;
  totalBalises: number;
}

const BATCH_SIZE = 200;
const BATCH_DELAY = 200; // ms between successful batches
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // ms, exponential backoff: 1s, 2s, 4s

const INITIAL_PROGRESS: BatchUploadProgress = {
  currentBatch: 0,
  totalBatches: 0,
  filesUploaded: 0,
  totalFiles: 0,
  balisesProcessed: 0,
  successCount: 0,
  failureCount: 0,
  retriedBatches: 0,
};

/**
 * Group files by balise ID
 */
function groupFilesByBalise(files: FileWithBaliseId[]): Map<number, FileWithBaliseId[]> {
  const grouped = new Map<number, FileWithBaliseId[]>();

  for (const file of files) {
    if (!file.isValid || file.baliseId === null) continue;

    if (!grouped.has(file.baliseId)) {
      grouped.set(file.baliseId, []);
    }
    grouped.get(file.baliseId)!.push(file);
  }

  return grouped;
}

/**
 * Split files into batches, keeping all files for each balise together.
 * Batches by file count (~200 files per batch) but never splits a balise across batches.
 */
function splitIntoBatches(files: FileWithBaliseId[], batchSize: number): FileWithBaliseId[][] {
  const grouped = groupFilesByBalise(files);
  const baliseEntries = Array.from(grouped.entries());

  const batches: FileWithBaliseId[][] = [];
  let currentBatch: FileWithBaliseId[] = [];

  for (const [, baliseFiles] of baliseEntries) {
    // If adding this balise would exceed batch size and we have files already, start a new batch
    if (currentBatch.length > 0 && currentBatch.length + baliseFiles.length > batchSize) {
      batches.push(currentBatch);
      currentBatch = [];
    }

    // Add all files for this balise to current batch
    currentBatch.push(...baliseFiles);
  }

  // Don't forget remaining files
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Upload a single batch of files
 */
async function uploadBatch(
  batchFiles: FileWithBaliseId[],
  globalDescription: string,
  baliseDescriptions: Record<number, string>,
): Promise<{ response: Response; data: UploadResponse | ValidationErrorResponse }> {
  const formData = new FormData();

  batchFiles.forEach((item, index) => {
    formData.append(`file-${index}`, item.file);
  });

  if (globalDescription.trim()) {
    formData.append('globalDescription', globalDescription.trim());
  }

  // Add per-balise descriptions for balises in this batch
  const baliseIdsInBatch = new Set(batchFiles.map((f) => f.baliseId).filter((id) => id !== null));
  Object.entries(baliseDescriptions).forEach(([baliseId, description]) => {
    if (description.trim() && baliseIdsInBatch.has(parseInt(baliseId, 10))) {
      formData.append(`description_${baliseId}`, description.trim());
    }
  });

  const response = await fetch('/api/balise/bulk-upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return { response, data };
}

/**
 * Attempt to upload a batch with retries and exponential backoff
 */
async function uploadBatchWithRetry(
  batchFiles: FileWithBaliseId[],
  globalDescription: string,
  baliseDescriptions: Record<number, string>,
  onRetry?: (attempt: number) => void,
): Promise<{ response: Response; data: UploadResponse | ValidationErrorResponse; retried: boolean }> {
  let lastError: Error | null = null;
  let retried = false;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await uploadBatch(batchFiles, globalDescription, baliseDescriptions);

      // If we get any response (even error), return it - only retry on network failures
      return { ...result, retried };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < MAX_RETRIES) {
        retried = true;
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
        onRetry?.(attempt + 1);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted - throw the last error
  throw lastError;
}

export const useBatchUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<BatchUploadProgress>(INITIAL_PROGRESS);
  const [uploadResult, setUploadResult] = useState<BatchUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const resetState = useCallback(() => {
    setProgress(INITIAL_PROGRESS);
    setUploadResult(null);
    setError(null);
    abortRef.current = false;
  }, []);

  const uploadBatches = useCallback(
    async (
      files: FileWithBaliseId[],
      globalDescription: string,
      baliseDescriptions: Record<number, string>,
    ): Promise<BatchUploadResult | null> => {
      resetState();
      setIsUploading(true);
      abortRef.current = false;

      const batches = splitIntoBatches(files, BATCH_SIZE);
      const totalFiles = files.filter((f) => f.isValid).length;

      if (batches.length === 0) {
        setError('Ei ladattavia tiedostoja');
        setIsUploading(false);
        return null;
      }

      setProgress({
        ...INITIAL_PROGRESS,
        totalBatches: batches.length,
        totalFiles,
      });

      const allResults: UploadResult[] = [];
      const allInvalidFiles: string[] = [];
      let totalFilesUploaded = 0;
      let totalBalisesProcessed = 0;
      let successCount = 0;
      let failureCount = 0;
      let retriedBatches = 0;
      let hasValidationError = false;
      let validationErrorMessage = '';

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        if (abortRef.current) {
          break;
        }

        const batch = batches[batchIndex];

        try {
          const { response, data, retried } = await uploadBatchWithRetry(
            batch,
            globalDescription,
            baliseDescriptions,
            () => {
              retriedBatches++;
            },
          );

          if (retried) {
            retriedBatches++;
          }

          if (!response.ok) {
            // Check for validation error
            if ('errorType' in data && data.errorType === 'validation_failed' && 'failures' in data) {
              hasValidationError = true;
              validationErrorMessage = data.error;

              const validationError = data as ValidationErrorResponse;
              const convertedResults: UploadResult[] = validationError.failures.map((f) => ({
                baliseId: f.baliseId,
                success: false,
                error: f.message,
                errorType: f.errorType,
                lockedBy: f.lockedBy,
              }));

              allResults.push(...convertedResults);
              failureCount += convertedResults.length;
            } else if ('results' in data && Array.isArray(data.results)) {
              // Partial failure with results
              allResults.push(...data.results);
              if (data.invalidFiles) {
                allInvalidFiles.push(...data.invalidFiles);
              }

              data.results.forEach((r: UploadResult) => {
                if (r.success) {
                  successCount++;
                  totalFilesUploaded += r.filesUploaded || 0;
                } else {
                  failureCount++;
                }
              });
              totalBalisesProcessed += data.results.length;
            } else {
              // General error - mark all files in batch as failed
              const batchBaliseIds = [...new Set(batch.map((f) => f.baliseId).filter((id) => id !== null))];
              batchBaliseIds.forEach((baliseId) => {
                allResults.push({
                  baliseId: baliseId!,
                  success: false,
                  error: 'error' in data ? data.error : 'Lataus epäonnistui',
                  errorType: 'unknown',
                });
                failureCount++;
              });
            }
          } else {
            // Success response
            const successData = data as UploadResponse;
            const resultsWithSuccess = successData.results.map((r: UploadResult) => ({
              ...r,
              success: true,
            }));

            allResults.push(...resultsWithSuccess);
            if (successData.invalidFiles) {
              allInvalidFiles.push(...successData.invalidFiles);
            }

            resultsWithSuccess.forEach((r) => {
              successCount++;
              totalFilesUploaded += r.filesUploaded || 0;
            });
            totalBalisesProcessed += resultsWithSuccess.length;
          }
        } catch (err) {
          // Network error after all retries exhausted
          const batchBaliseIds = [...new Set(batch.map((f) => f.baliseId).filter((id) => id !== null))];
          batchBaliseIds.forEach((baliseId) => {
            allResults.push({
              baliseId: baliseId!,
              success: false,
              error: err instanceof Error ? err.message : 'Verkkovirhe',
              errorType: 'unknown',
            });
            failureCount++;
          });
        }

        // Update progress
        setProgress({
          currentBatch: batchIndex + 1,
          totalBatches: batches.length,
          filesUploaded: totalFilesUploaded,
          totalFiles,
          balisesProcessed: totalBalisesProcessed,
          successCount,
          failureCount,
          retriedBatches,
        });

        // Delay between batches (except for the last one)
        if (batchIndex < batches.length - 1 && !abortRef.current) {
          await sleep(BATCH_DELAY);
        }
      }

      const result: BatchUploadResult = {
        success: failureCount === 0 && !hasValidationError,
        message: hasValidationError
          ? validationErrorMessage
          : failureCount === 0
            ? 'Kaikki tiedostot ladattu onnistuneesti'
            : successCount > 0
              ? `Osa latauksista epäonnistui (${successCount} onnistui, ${failureCount} epäonnistui)`
              : 'Lataus epäonnistui',
        results: allResults,
        invalidFiles: allInvalidFiles,
        totalFiles: totalFilesUploaded,
        totalBalises: new Set(allResults.map((r) => r.baliseId)).size,
      };

      setUploadResult(result);
      setIsUploading(false);

      return result;
    },
    [resetState],
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return {
    uploadBatches,
    isUploading,
    progress,
    uploadResult,
    error,
    resetState,
    abort,
  };
};
