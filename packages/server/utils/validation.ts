import { RataExtraLambdaError } from './errors';

/**
 * Validates if there are any unexpected query parameters in the request.
 * @param {Record<string, unknown>} queryParams - Actual query parameters from the request.
 * @param {Array<string>} expectedParams - List of expected query parameters.
 * @throws {RataExtraLambdaError} If unexpected query parameters are found.
 */
export function validateQueryParameters(
  queryParams: Record<string, unknown> = {},
  expectedParams: Array<string>,
): void {
  const actualParams = Object.keys(queryParams);

  actualParams.forEach((param) => {
    if (!expectedParams.includes(param)) {
      throw new RataExtraLambdaError(
        `Unexpected query parameter: ${param}.  Only valid parameters are: ${expectedParams.join(', ')}`,
        400,
      );
    }
  });
}
