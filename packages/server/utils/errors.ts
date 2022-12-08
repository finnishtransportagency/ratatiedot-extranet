/**
 * Error class for RataExtra API lambdas
 */
export class RataExtraLambdaError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Returns error message to be returned to client
 */
export const getClientErrorMessage = (err: unknown) =>
  (err instanceof RataExtraLambdaError && err.message) || 'An error occurred processing the request.';

/**
 * Returns error response object for RataExtra API requests
 */
export const getRataExtraLambdaError = (err: unknown) => ({
  statusCode: (err instanceof RataExtraLambdaError && err.statusCode) || 500,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message: getClientErrorMessage(err) }, null, 2),
});
