/**
 * Error class for RataExtra API lambdas
 */
export class RataExtraEC2Error extends Error {
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
  (err instanceof RataExtraEC2Error && err.message) || 'Pyynnön käsittelyssä tapahtui virhe.';

/**
 * Returns error response object for RataExtra API requests
 */
export const getRataExtraEC2Error = (err: unknown) => ({
  statusCode: (err instanceof RataExtraEC2Error && err.statusCode) || 500,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message: getClientErrorMessage(err) }, null, 2),
});
