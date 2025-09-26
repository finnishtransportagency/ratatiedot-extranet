import * as Sentry from '@sentry/aws-serverless';
import { CloudFront } from 'aws-sdk';
import { ALBEvent, ALBResult } from 'aws-lambda';

import { RataExtraLambdaError, getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateAdminUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';
import { SSM_CLOUDFRONT_SIGNER_PRIVATE_KEY } from '../../../../lib/config';
import { getSecuredStringParameter } from '../../utils/parameterStore';
import { handlerWrapper } from '../handler-wrapper';

const database = await DatabaseClient.build();
const cfKeyPairId = process.env.CLOUDFRONT_SIGNER_PUBLIC_KEY_ID || '';
const cfPrivateKey = await getSecuredStringParameter(SSM_CLOUDFRONT_SIGNER_PRIVATE_KEY);
const cloudfront = new CloudFront.Signer(cfKeyPairId, cfPrivateKey);
const CLOUDFRONT_DOMAIN_NAME = process.env.CLOUDFRONT_DOMAIN_NAME;

/**
 * Get single notice by id. Example request: /api/notice/:id
 * @param {ALBEvent} event
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export const handleRequest = handlerWrapper(async (event: ALBEvent): Promise<ALBResult> => {
  try {
    const paths = event.path.split('/');
    const noticeId = paths.pop();
    const user = await getUser(event);

    if (!noticeId || noticeId === 'notice') {
      throw new RataExtraLambdaError('Notice ID missing from path', 400);
    }

    log.info(user, 'Get notice by id' + noticeId);
    validateReadUser(user);

    const notice = await database.notice.findUnique({ where: { id: noticeId } });
    const imageElement = notice.content.find((element) => element.type === 'image');
    if (imageElement) {
      const encodedUrl = encodeURIComponent(imageElement.url);
      const signedUrl = await cloudfront.getSignedUrl({
        url: `https://${CLOUDFRONT_DOMAIN_NAME}/${encodedUrl}`,
        expires: Math.floor(Date.now() / 1000) + 3600,
      });
      imageElement.signedUrl = signedUrl;
    }

    if ((notice?.publishTimeStart as Date) > new Date()) {
      validateAdminUser(user);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notice),
    };
  } catch (err) {
    log.error(err);
    Sentry.captureException(err);
    return getRataExtraLambdaError(err);
  }
});
