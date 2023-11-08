import { ALBEvent } from 'aws-lambda';
import { getRataExtraLambdaError } from '../utils/errors';
import { log } from '../utils/logger';
import { getUser } from '../utils/userService';

const CLOUDFRONT_DOMAIN_NAME = process.env.CLOUDFRONT_DOMAIN_NAME;

/**
 * Returns user back to requested endpoint in the same domain
 * @param {ALBEvent} event
 * @param {string} [event.queryStringParameters.redirect_url] URL encoded endpoint to return user to
 * @returns Redirect with location
 */
export async function handleRequest(event: ALBEvent) {
  try {
    const user = await getUser(event);
    log.info(user, 'Returning user back to frontpage.');

    const returnUrlEnd = event.queryStringParameters?.redirect_url
      ? decodeURIComponent(event.queryStringParameters.redirect_url)
      : '/';
    return {
      statusCode: 302,
      headers: {
        Location: `https://${CLOUDFRONT_DOMAIN_NAME}${returnUrlEnd}`,
      },
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
