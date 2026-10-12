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
  errorType?: 'not_locked' | 'locked_by_other' | 'not_found' | 'permission' | 'storage' | 'too_large' | 'unknown';
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

interface ErrorResponse {
  success: false;
  error: string;
}

type BatchResponseData = UploadResponse | ValidationErrorResponse | ErrorResponse;

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

// Lambda (via ALB) request body limit is 1 MB. Binary bodies are base64-encoded (~4/3 size),
// so the raw multipart payload must stay below ~750 KB. Use a safety margin on top of that.
const LAMBDA_PAYLOAD_LIMIT_BYTES = 1024 * 1024;
const MAX_BATCH_PAYLOAD_BYTES = Math.floor((LAMBDA_PAYLOAD_LIMIT_BYTES * 3) / 4) - 64 * 1024;
// Estimated multipart overhead per part (boundary + Content-Disposition/Content-Type headers)
const MULTIPART_PART_OVERHEAD_BYTES = 256;
const BATCH_DELAY_MS = 200;
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE_MS = 1000;

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
 * Estimate the multipart payload size contributed by a single file
 */
function estimateFilePayloadSize(item: FileWithBaliseId): number {
  return item.file.size + item.file.name.length + MULTIPART_PART_OVERHEAD_BYTES;
}

/**
 * Estimate the multipart payload size of the text fields (descriptions) sent for a balise
 */
function estimateDescriptionPayloadSize(description: string | undefined): number {
  const trimmed = description?.trim();
  if (!trimmed) return 0;
  return new TextEncoder().encode(trimmed).length + MULTIPART_PART_OVERHEAD_BYTES;
}

interface OversizedBalise {
  baliseId: number;
  payloadSize: number;
}

function formatKilobytes(bytes: number): string {
  return `${Math.ceil(bytes / 1024)} kt`;
}

/**
 * Split files into batches, keeping all files for each balise together.
 * Batches are sized dynamically so the estimated request payload stays below the Lambda
 * payload limit. A balise is never split across batches; balises too large to fit in any
 * batch are returned separately in `oversized`.
 */
function splitIntoBatches(
  files: FileWithBaliseId[],
  globalDescription: string,
  baliseDescriptions: Record<number, string>,
): { batches: FileWithBaliseId[][]; oversized: OversizedBalise[] } {
  const grouped = groupFilesByBalise(files);
  const baliseEntries = Array.from(grouped.entries());
  const basePayloadSize = estimateDescriptionPayloadSize(globalDescription);

  const batches: FileWithBaliseId[][] = [];
  const oversized: OversizedBalise[] = [];
  let currentBatch: FileWithBaliseId[] = [];
  let currentBatchSize = basePayloadSize;

  for (const [baliseId, baliseFiles] of baliseEntries) {
    const balisePayloadSize =
      baliseFiles.reduce((sum, f) => sum + estimateFilePayloadSize(f), 0) +
      estimateDescriptionPayloadSize(baliseDescriptions[baliseId]);

    if (basePayloadSize + balisePayloadSize > MAX_BATCH_PAYLOAD_BYTES) {
      oversized.push({ baliseId, payloadSize: balisePayloadSize });
      continue;
    }

    // If adding this balise would exceed the payload limit and we have files already, start a new batch
    if (currentBatch.length > 0 && currentBatchSize + balisePayloadSize > MAX_BATCH_PAYLOAD_BYTES) {
      batches.push(currentBatch);
      currentBatch = [];
      currentBatchSize = basePayloadSize;
    }

    // Add all files for this balise to current batch
    currentBatch.push(...baliseFiles);
    currentBatchSize += balisePayloadSize;
  }

  // Don't forget remaining files
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return { batches, oversized };
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
): Promise<{ response: Response; data: BatchResponseData }> {
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

  // Load balancer errors (e.g. payload too large) return HTML instead of JSON
  const data: BatchResponseData = await response.json().catch((): ErrorResponse => {
    if (response.ok) throw new Error('Palvelimen vastaus oli virheellinen');
    return {
      success: false,
      error:
        response.status === 413
          ? `Tiedostojen yhteiskoko on liian suuri (enintään ${formatKilobytes(MAX_BATCH_PAYLOAD_BYTES)} kerralla)`
          : `Palvelinvirhe (${response.status})`,
    };
  });
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
): Promise<{ response: Response; data: BatchResponseData; retried: boolean }> {
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
        const delay = RETRY_DELAY_BASE_MS * Math.pow(2, attempt);
        onRetry?.(attempt + 1);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted - throw the last error
  throw lastError;
}

/**
 * Extract unique balise IDs from a batch
 */
function getBatchBaliseIds(batch: FileWithBaliseId[]): number[] {
  return [...new Set(batch.map((f) => f.baliseId).filter((id): id is number => id !== null))];
}

/**
 * Create failure results for a batch when network error occurs
 */
function createNetworkErrorResults(batch: FileWithBaliseId[], errorMessage: string): UploadResult[] {
  return getBatchBaliseIds(batch).map((baliseId) => ({
    baliseId,
    success: false,
    error: errorMessage,
    errorType: 'unknown' as const,
  }));
}

/**
 * Process validation error response
 */
function processValidationError(data: ValidationErrorResponse): {
  results: UploadResult[];
  failureCount: number;
  errorMessage: string;
} {
  const results: UploadResult[] = data.failures.map((f) => ({
    baliseId: f.baliseId,
    success: false,
    error: f.message,
    errorType: f.errorType,
    lockedBy: f.lockedBy,
  }));

  return {
    results,
    failureCount: results.length,
    errorMessage: data.error,
  };
}

/**
 * Process partial failure response (has results array)
 */
function processPartialFailure(data: UploadResponse): {
  results: UploadResult[];
  invalidFiles: string[];
  successCount: number;
  failureCount: number;
  filesUploaded: number;
} {
  let successCount = 0;
  let failureCount = 0;
  let filesUploaded = 0;

  for (const r of data.results) {
    if (r.success) {
      successCount++;
      filesUploaded += r.filesUploaded || 0;
    } else {
      failureCount++;
    }
  }

  return {
    results: data.results,
    invalidFiles: data.invalidFiles || [],
    successCount,
    failureCount,
    filesUploaded,
  };
}

/**
 * Process general error response (no results array)
 */
function processGeneralError(batch: FileWithBaliseId[], data: BatchResponseData): UploadResult[] {
  const errorMessage = 'error' in data ? data.error : 'Baliisien lisäys epäonnistui';
  return getBatchBaliseIds(batch).map((baliseId) => ({
    baliseId,
    success: false,
    error: errorMessage,
    errorType: 'unknown' as const,
  }));
}

/**
 * Process success response
 */
function processSuccessResponse(data: UploadResponse): {
  results: UploadResult[];
  invalidFiles: string[];
  successCount: number;
  filesUploaded: number;
} {
  const results = data.results.map((r) => ({ ...r, success: true }));
  let filesUploaded = 0;

  for (const r of results) {
    filesUploaded += r.filesUploaded || 0;
  }

  return {
    results,
    invalidFiles: data.invalidFiles || [],
    successCount: results.length,
    filesUploaded,
  };
}

/**
 * Determine result message based on counts
 */
function getResultMessage(
  hasValidationError: boolean,
  validationErrorMessage: string,
  successCount: number,
  failureCount: number,
): string {
  if (hasValidationError) return validationErrorMessage;
  if (failureCount === 0) return 'Kaikki tiedostot lisätty onnistuneesti';
  if (successCount > 0) return `Osa lisäyksistä epäonnistui (${successCount} onnistui, ${failureCount} epäonnistui)`;
  return 'Baliisien lisäys epäonnistui';
}

interface BatchProcessingState {
  allResults: UploadResult[];
  allInvalidFiles: string[];
  totalFilesUploaded: number;
  totalBalisesProcessed: number;
  successCount: number;
  failureCount: number;
  retriedBatches: number;
  hasValidationError: boolean;
  validationErrorMessage: string;
}

function createInitialState(): BatchProcessingState {
  return {
    allResults: [],
    allInvalidFiles: [],
    totalFilesUploaded: 0,
    totalBalisesProcessed: 0,
    successCount: 0,
    failureCount: 0,
    retriedBatches: 0,
    hasValidationError: false,
    validationErrorMessage: '',
  };
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

  const processBatchResponse = useCallback(
    (response: Response, data: BatchResponseData, batch: FileWithBaliseId[], state: BatchProcessingState): void => {
      // Success response
      if (response.ok) {
        const processed = processSuccessResponse(data as UploadResponse);
        state.allResults.push(...processed.results);
        state.allInvalidFiles.push(...processed.invalidFiles);
        state.successCount += processed.successCount;
        state.totalFilesUploaded += processed.filesUploaded;
        state.totalBalisesProcessed += processed.results.length;
        return;
      }

      // Validation error
      if ('errorType' in data && data.errorType === 'validation_failed' && 'failures' in data) {
        const processed = processValidationError(data);
        state.allResults.push(...processed.results);
        state.failureCount += processed.failureCount;
        state.hasValidationError = true;
        state.validationErrorMessage = processed.errorMessage;
        return;
      }

      // Partial failure with results
      if ('results' in data && Array.isArray(data.results)) {
        const processed = processPartialFailure(data as UploadResponse);
        state.allResults.push(...processed.results);
        state.allInvalidFiles.push(...processed.invalidFiles);
        state.successCount += processed.successCount;
        state.failureCount += processed.failureCount;
        state.totalFilesUploaded += processed.filesUploaded;
        state.totalBalisesProcessed += processed.results.length;
        return;
      }

      // General error
      const errorResults = processGeneralError(batch, data);
      state.allResults.push(...errorResults);
      state.failureCount += errorResults.length;
    },
    [],
  );

  const uploadBatches = useCallback(
    async (
      files: FileWithBaliseId[],
      globalDescription: string,
      baliseDescriptions: Record<number, string>,
    ): Promise<BatchUploadResult | null> => {
      resetState();
      setIsUploading(true);
      abortRef.current = false;

      const { batches, oversized } = splitIntoBatches(files, globalDescription, baliseDescriptions);
      const totalFiles = files.filter((f) => f.isValid).length;

      if (batches.length === 0 && oversized.length === 0) {
        setError('Ei lisättäviä tiedostoja');
        setIsUploading(false);
        return null;
      }

      setProgress({ ...INITIAL_PROGRESS, totalBatches: batches.length, totalFiles });

      const state = createInitialState();

      for (const { baliseId, payloadSize } of oversized) {
        state.allResults.push({
          baliseId,
          success: false,
          error: `Baliisin tiedostot ovat yhteensä liian suuria (${formatKilobytes(payloadSize)}, enintään ${formatKilobytes(MAX_BATCH_PAYLOAD_BYTES)})`,
          errorType: 'too_large',
        });
        state.failureCount++;
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        if (abortRef.current) break;

        const batch = batches[batchIndex];

        const batchResult = await uploadBatchWithRetry(batch, globalDescription, baliseDescriptions, () => {
          state.retriedBatches++;
        }).catch((err): null => {
          const errorMessage = err instanceof Error ? err.message : 'Verkkovirhe';
          const errorResults = createNetworkErrorResults(batch, errorMessage);
          state.allResults.push(...errorResults);
          state.failureCount += errorResults.length;
          return null;
        });

        if (batchResult) {
          if (batchResult.retried) state.retriedBatches++;
          processBatchResponse(batchResult.response, batchResult.data, batch, state);
        }

        setProgress({
          currentBatch: batchIndex + 1,
          totalBatches: batches.length,
          filesUploaded: state.totalFilesUploaded,
          totalFiles,
          balisesProcessed: state.totalBalisesProcessed,
          successCount: state.successCount,
          failureCount: state.failureCount,
          retriedBatches: state.retriedBatches,
        });

        const isLastBatch = batchIndex >= batches.length - 1;
        if (!isLastBatch && !abortRef.current) {
          await sleep(BATCH_DELAY_MS);
        }
      }

      const result: BatchUploadResult = {
        success: state.failureCount === 0 && !state.hasValidationError,
        message: getResultMessage(
          state.hasValidationError,
          state.validationErrorMessage,
          state.successCount,
          state.failureCount,
        ),
        results: state.allResults,
        invalidFiles: state.allInvalidFiles,
        totalFiles: state.totalFilesUploaded,
        totalBalises: new Set(state.allResults.map((r) => r.baliseId)).size,
      };

      setUploadResult(result);
      setIsUploading(false);

      return result;
    },
    [resetState, processBatchResponse],
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
