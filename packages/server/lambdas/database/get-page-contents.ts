const AWS = require('aws-sdk'); //eslint-disable-line @typescript-eslint/no-var-requires
import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { findEndpoint } from '../../utils/alfresco';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';
import { SSM_CLOUDFRONT_SIGNER_PRIVATE_KEY } from '../../../../lib/config';
import { getSecuredStringParameter } from '../../utils/parameterStore';

const database = await DatabaseClient.build();
const cfKeyPairId = process.env.CLOUDFRONT_SIGNER_PUBLIC_KEY_ID || '';
const cfPrivateKey = await getSecuredStringParameter(SSM_CLOUDFRONT_SIGNER_PRIVATE_KEY);
const cloudfront = new AWS.CloudFront.Signer(cfKeyPairId, cfPrivateKey);

let fileEndpointsCache: Array<CategoryDataBase> = [];

/**
 * Get custom content for page. Example request: /api/database/page-contents/linjakaaviot
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to get the custom content for
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const paths = event.path.split('/');
    const category = paths.pop();

    const user = await getUser(event);
    log.info(user, `Fetching page contents for page ${category}`);
    validateReadUser(user);

    if (!category || paths.pop() !== 'page-contents') {
      throw new RataExtraLambdaError('Category missing from path', 400);
    }
    if (!fileEndpointsCache.length) {
      log.debug('Cache empty');
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }
    log.debug(`Cached ${JSON.stringify(fileEndpointsCache)}`);
    const categoryData = findEndpoint(category, fileEndpointsCache);
    if (!categoryData) {
      throw new RataExtraLambdaError('Category not found', 404);
    }

    const contents = await database.categoryDataContents.findUnique({ where: { baseId: categoryData.id } });

    const imageElement = contents?.fields.find((element) => element.type === 'image');
    if (imageElement) {
      const signedUrl = await cloudfront.getSignedUrl({
        url: `https://dawlcrdphn1az.cloudfront.net/${imageElement.url}`,
        expires: Math.floor(Date.now() / 1000) + 3600,
      });
      imageElement.signedUrl = signedUrl;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: contents?.fields }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
