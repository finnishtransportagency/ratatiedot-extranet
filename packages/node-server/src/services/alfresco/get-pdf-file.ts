import { log } from '../../utils/logger.js';
import { Request } from 'express';
import { getAlfrescoOptions } from '../../utils/alfresco.js';
import { getUser, validateReadUser } from '../../utils/userService.js';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios.js';
import { RataExtraEC2Error } from '../../utils/errors.js';

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
      responseType: 'arraybuffer',
    });

    const response = await alfrescoAxios.get(url, options);
    console.log(`Fetched pdf data size: ${response.data.byteLength} bytes`);
    return response.data;
  } catch (err) {
    log.error(`Error fetching PDF document with ID ${nodeId}:`, err);
    throw err;
  }
};

/**
 * Handler for retrieving a PDF document from Alfresco for direct embedding in the frontend
 *
 * @param {ALBEvent} request
 * @param {{string}} event.path Path should end with the page to upload the file to
 * @param {string} event.queryStringParameters.nodeId - The Alfresco node ID of the PDF document
 * @returns {Promise<void>}
 */
export async function handleRequest(req: Request): Promise<{ pdfData: Buffer; headers: Record<string, string> }> {
  try {
    const user = await getUser(req);

    const nodeId = req.params.nodeId;

    log.info(user, `Fetching PDF document with ID: ${nodeId}`);

    validateReadUser(user);

    if (!nodeId) {
      throw new RataExtraEC2Error('Node ID is required', 400);
    }

    const pdfData = await fetchPdfDocument(user.uid, nodeId);

    console.log(`Sending PDF data size: ${pdfData.byteLength} bytes`);
    return {
      pdfData: Buffer.from(pdfData),
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="document.pdf"',
        'Cache-Control': 'public, max-age=3600',
      },
    };
  } catch (err) {
    log.error(err);
    throw new RataExtraEC2Error('Error occurred:', err);
  }
}

export default handleRequest;
