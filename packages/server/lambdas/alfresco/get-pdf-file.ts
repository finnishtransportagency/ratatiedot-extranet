import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getAlfrescoOptions } from '../../utils/alfresco';
import { getUser, validateReadUser } from '../../utils/userService';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';

/**
 * Fetches a specific PDF document from Alfresco
 *
 * @param {string} uid - User ID for authentication
 * @param {string} nodeId - Alfresco node ID of the PDF document
 * @returns {Promise<Buffer>} - PDF document as binary data
 */
const fetchPdfDocument = async (uid: string, nodeId: string): Promise<Buffer> => {
  try {
    const url = `${alfrescoApiVersion}/nodes/${nodeId}/content`;
    const options = await getAlfrescoOptions(uid, {
      Accept: 'application/pdf',
      'Content-Type': 'application/json;charset=UTF-8',
      responseType: 'arraybuffer',
    });

    const response = await alfrescoAxios.get(url, options);
    return Buffer.from(response.data);
  } catch (err) {
    log.error(`Error fetching PDF document with ID ${nodeId}:`, err);
    throw err;
  }
};

/**
 * Handler for retrieving a PDF document from Alfresco for direct embedding in the frontend
 *
 * @param {ALBEvent} event - ALB event
 * @param {Object} event.queryStringParameters
 * @param {string} event.queryStringParameters.nodeId - The Alfresco node ID of the PDF document
 * @returns {Promise<ALBResult>} - PDF document with appropriate headers for embedding
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    const paths = event.path.split('/');
    const nodeId = paths.at(-1);

    log.info(user, `Fetching PDF document with ID: ${nodeId}`);

    validateReadUser(user);

    if (!nodeId) {
      throw new RataExtraLambdaError('Node ID is required', 400);
    }

    const pdfData = await fetchPdfDocument(user.uid, nodeId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="document.pdf"',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors 'self' *",
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
      body: pdfData.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
