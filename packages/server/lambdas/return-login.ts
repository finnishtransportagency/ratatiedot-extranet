import { ALBEvent, Context } from 'aws-lambda';
import { log } from '../utils/logger';
import { getUser } from '../utils/userService';

const CLOUDFRONT_DOMAIN_NAME = process.env.CLOUDFRONT_DOMAIN_NAME;

export async function handleRequest(_event: ALBEvent, _context: Context) {
  const user = await getUser(_event);
  log.info(user, 'Returning user back to frontpage.');

  const expires = new Date(Date.now() + 120 * 1000).toUTCString(); // In two minutes
  const setCookieAttributes = `; Domain=${CLOUDFRONT_DOMAIN_NAME}; Path=/; Secure; SameSite=Lax; expires=${expires};`;
  return {
    statusCode: 302,
    headers: {
      Location: `https://${CLOUDFRONT_DOMAIN_NAME}`,
      'Set-Cookie': `Return=true${setCookieAttributes}`,
    },
  };
}
