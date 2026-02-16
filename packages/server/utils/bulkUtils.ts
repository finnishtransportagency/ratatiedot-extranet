import { ALBEvent, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from './errors';

// Common result type for bulk operations
export interface BulkOperationResult {
  baliseId: number;
  success: boolean;
  error?: string;
  skipped?: boolean;
}

// Common response type for bulk operations
export interface BulkOperationResponse {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  results: BulkOperationResult[];
}

// Parse balise IDs from request body
export function parseBaliseIds(event: ALBEvent): number[] {
  if (!event.body) {
    throw new Error('MISSING_REQUEST_BODY');
  }

  const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf-8') : event.body;

  let parsed: { baliseIds?: unknown };
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error('INVALID_JSON');
  }

  if (!Array.isArray(parsed.baliseIds) || parsed.baliseIds.length === 0) {
    throw new Error('INVALID_BALISE_IDS');
  }

  // Validate all IDs are numbers
  if (!parsed.baliseIds.every((id) => typeof id === 'number' && !isNaN(id))) {
    throw new Error('INVALID_BALISE_IDS');
  }

  return parsed.baliseIds;
}

// Parse lock reason from request body (for lock operations)
export function parseLockReason(event: ALBEvent): string {
  const body = event.isBase64Encoded ? Buffer.from(event.body!, 'base64').toString('utf-8') : event.body!;
  const parsed = JSON.parse(body);

  if (typeof parsed.lockReason !== 'string' || parsed.lockReason.trim().length === 0) {
    throw new Error('INVALID_LOCK_REASON');
  }

  return parsed.lockReason.trim();
}

// Process bulk operation with concurrency control
export async function processBulkOperation<TContext>(
  baliseIds: number[],
  context: TContext,
  executeOne: (baliseId: number, context: TContext) => Promise<BulkOperationResult>,
): Promise<BulkOperationResponse> {
  const CONCURRENCY_LIMIT = 10;
  const results: BulkOperationResult[] = [];

  for (let i = 0; i < baliseIds.length; i += CONCURRENCY_LIMIT) {
    const chunk = baliseIds.slice(i, i + CONCURRENCY_LIMIT);
    const chunkResults = await Promise.all(chunk.map((baliseId) => executeOne(baliseId, context)));
    results.push(...chunkResults);
  }

  const successCount = results.filter((r) => r.success).length;
  const skippedCount = results.filter((r) => r.skipped).length;
  const failureCount = results.filter((r) => !r.success && !r.skipped).length;

  return {
    totalRequested: baliseIds.length,
    successCount,
    failureCount,
    skippedCount,
    results,
  };
}

// Common error messages
const ERROR_MESSAGES: Record<string, string> = {
  MISSING_REQUEST_BODY: 'Pyyntö on tyhjä',
  INVALID_JSON: 'Virheellinen JSON-muoto',
  INVALID_BALISE_IDS: 'Virheelliset baliisi-tunnukset',
  INVALID_LOCK_REASON: 'Lukitsemisen syy on pakollinen',
};

// Handle common bulk operation errors
export function handleBulkOperationError(err: unknown): ALBResult {
  const errorMessage = err instanceof Error ? err.message : String(err);

  if (ERROR_MESSAGES[errorMessage]) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: ERROR_MESSAGES[errorMessage] }),
    };
  }

  return getRataExtraLambdaError(err);
}
