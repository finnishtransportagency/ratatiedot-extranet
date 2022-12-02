import { ALBEvent, Context } from 'aws-lambda';
import AWS from 'aws-sdk';
import { log } from '../utils/logger';
import { getUser } from '../utils/userService';

const CLOUDFRONT_DOMAIN_NAME = process.env.CLOUDFRONT_DOMAIN_NAME;
const CLOUDFRONT_PUBLIC_KEY_ID = process.env.CLOUDFRONT_PUBLIC_KEY_ID || '';
const CLOUDFRONT_PRIVATE_KEY_NAME = process.env.CLOUDFRONT_PRIVATE_KEY_NAME || '';

export async function handleRequest(_event: ALBEvent, _context: Context) {
  const user = await getUser(_event);
  log.info(user, 'Signing frontend cookie.');
  const ssm = new AWS.SSM({ region: process.env.region });
  // TODO: Cache this
  const data = await ssm.getParameter({ Name: CLOUDFRONT_PRIVATE_KEY_NAME, WithDecryption: true }).promise();

  const cloudFrontPrivateKey = data.Parameter?.Value || '';

  const cloudFrontSigner = new AWS.CloudFront.Signer(CLOUDFRONT_PUBLIC_KEY_ID, cloudFrontPrivateKey);

  const cloudFrontPolicy = JSON.stringify({
    Statement: [
      {
        Resource: `https://${CLOUDFRONT_DOMAIN_NAME}/*`,
        Condition: {
          DateLessThan: {
            'AWS:EpochTime': Math.floor(new Date().getTime() / 1000) + 3600, // 1 hour
          },
        },
      },
    ],
  });

  const cookie = cloudFrontSigner.getSignedCookie({
    policy: cloudFrontPolicy,
  });

  const setCookieAttributes = `; Domain=${CLOUDFRONT_DOMAIN_NAME}; Path=/; Secure; HttpOnly; SameSite=Lax`;

  const returnUrlEnd = _event.queryStringParameters?.redirect_url || '/';

  return {
    statusCode: 302,
    multiValueHeaders: {
      Location: [`https://${CLOUDFRONT_DOMAIN_NAME}${returnUrlEnd}`],
      'Set-Cookie': [
        `CloudFront-Key-Pair-Id=${cookie['CloudFront-Key-Pair-Id']}${setCookieAttributes}`,
        `CloudFront-Policy=${cookie['CloudFront-Policy']}${setCookieAttributes}`,
        `CloudFront-Signature=${cookie['CloudFront-Signature']}${setCookieAttributes}`,
      ],
    },
  };
}
