/**
 * Error class for RataExtra API lambdas
 */
export class RataExtraLambdaError extends Error {
  statusCode: number;
  errorTranslationKey?: string;
  constructor(message: string, statusCode: number, errorTranslationKey?: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorTranslationKey = errorTranslationKey;
  }
}

/**
 * Returns error translation key that gets translated on client
 */
export const getClientErrorTranslationKey = (err: unknown) =>
  (err instanceof RataExtraLambdaError && err.errorTranslationKey) || 'Pyynnön käsittelyssä tapahtui virhe.';

/**
 * Returns error response object for RataExtra API requests
 */
export const getRataExtraLambdaError = (err: unknown) => ({
  statusCode: (err instanceof RataExtraLambdaError && err.statusCode) || 500,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ errorTranslationKey: getClientErrorTranslationKey(err) }, null, 2),
});
