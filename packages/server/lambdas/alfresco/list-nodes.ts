import { ALBEvent, ALBResult } from 'aws-lambda';
import { AxiosRequestConfig } from 'axios';
import { getAlfrescoOptions } from '../../utils/alfresco';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';

export const getNodes = async (id: string, options: AxiosRequestConfig, type?: string) => {
  try {
    let queryParameter = '';
    if (type && type === 'folder') {
      queryParameter = `?where=(isFolder=true)`;
    }
    if (type && type === 'file') {
      queryParameter = `?where=(isFile=true)`;
    }
    const response = await alfrescoAxios.get(`${alfrescoApiVersion}/nodes/${id}/children${queryParameter}`, options);
    return response;
  } catch (error) {
    log.error(error);
  }
};

/**
 * Get the list of files or folders by given ID. Example: /api/alfresco/nodes/abc-123?type=folder
 * @param {ALBEvent} event
 * @param {{id: string, type?: NodeType }} event.queryStringParameters
 * @returns {Promise<ALBResult>} List of nodes for given ID
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const paths = event.path.split('/');
    const nodeId = paths.pop();
    const user = await getUser(event);
    const type = event.queryStringParameters?.type;

    log.info(user, `Getting nodes for id ${nodeId}`);

    validateReadUser(user);

    if (!nodeId) {
      throw new RataExtraLambdaError('node ID missing', 400);
    }

    const options = await getAlfrescoOptions(user.uid);
    const nodes = await getNodes(nodeId, options, type);
    log.info(user, `response: ${JSON.stringify(nodes?.data, null, 2)}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nodes?.data),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
