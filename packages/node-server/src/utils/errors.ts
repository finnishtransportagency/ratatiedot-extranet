/**
 * Error class for RataExtra API lambdas
 */
export class RataExtraEC2Error extends Error {
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
  err instanceof RataExtraEC2Error && err.errorTranslationKey;

/**
 * Returns error response object for RataExtra API requests
 */
export const getRataExtraEC2Error = (err: unknown) => ({
  statusCode: (err instanceof RataExtraEC2Error && err.statusCode) || 500,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ errorTranslationKey: getClientErrorTranslationKey(err) }, null, 2),
});
