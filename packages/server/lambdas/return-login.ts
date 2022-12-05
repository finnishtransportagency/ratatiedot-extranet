import { ALBEvent, Context } from 'aws-lambda';
import { log } from '../utils/logger';
import { getUser } from '../utils/userService';

const CLOUDFRONT_DOMAIN_NAME = process.env.CLOUDFRONT_DOMAIN_NAME;

export async function handleRequest(_event: ALBEvent, _context: Context) {
  const user = await getUser(_event);
  log.info(user, 'Returning back to frontpage.');

  return {
    statusCode: 302,
    headers: {
      Location: `https://${CLOUDFRONT_DOMAIN_NAME}`,
      Return: 'true',
    },
  };
}
