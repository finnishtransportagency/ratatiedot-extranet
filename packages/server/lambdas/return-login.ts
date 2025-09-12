import { ALBEvent } from 'aws-lambda';
import { log } from '../utils/logger';
import { getUser } from '../utils/userService';

const CLOUDFRONT_DOMAIN_NAME = process.env.CLOUDFRONT_DOMAIN_NAME;

/**
 * Adds Return-cookie and returns user back to requested endpoint in the same domain
 * @param {ALBEvent} event
 * @param {string} [event.queryStringParameters.redirect_url] URL encoded endpoint to return user to
 * @returns Redirect with location and Return-cookie in headers
 */
export async function handleRequest(event: ALBEvent) {
  try {
    const user = await getUser(event);
    log.info(user, 'Returning user back to frontpage.');

    const expires = new Date(Date.now() + 120 * 1000).toUTCString(); // In two minutes
    const setCookieAttributes = `; Domain=${CLOUDFRONT_DOMAIN_NAME}; Path=/; Secure; SameSite=Lax; expires=${expires};`;
    const returnUrlEnd = event.queryStringParameters?.redirect_url
      ? decodeURIComponent(event.queryStringParameters.redirect_url)
      : '/';
    return {
      statusCode: 302,
      headers: {
        Location: `https://${CLOUDFRONT_DOMAIN_NAME}${returnUrlEnd}`,
        'Set-Cookie': `Return=true${setCookieAttributes}`,
      },
    };
  } catch (err) {
    log.error(err, 'Failed to validate user, redirecting to SSO login');

    // If user validation fails (likely expired JWT), redirect to SSO login
    // This handles the case where users have stale sessions
    const loginRedirectUrl = event.queryStringParameters?.redirect_url
      ? `?redirect=${encodeURIComponent(event.queryStringParameters.redirect_url)}`
      : '';

    return {
      statusCode: 302,
      headers: {
        Location: `https://${CLOUDFRONT_DOMAIN_NAME}/sso/logout?auth=1${loginRedirectUrl}`,
      },
    };
  }
}
