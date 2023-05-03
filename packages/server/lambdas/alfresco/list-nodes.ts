import { ALBEvent, ALBResult } from 'aws-lambda';
import axios from 'axios';
import { getAlfrescoOptions, getAlfrescoUrlBase } from '../../utils/alfresco';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, RataExtraUser, validateReadUser } from '../../utils/userService';

const getNodes = async (id: string, user: RataExtraUser, type?: string) => {
  const alfrescoCoreAPIUrl = `${getAlfrescoUrlBase()}/alfresco/versions/1`;
  try {
    let queryParameter = '';
    if (type && type === 'folder') {
      queryParameter = `?where=(isFolder=true)`;
    }
    if (type && type === 'file') {
      queryParameter = `?where=(isFile=true)`;
    }
    const options = await getAlfrescoOptions(user.uid);
    const response = await axios.get(`${alfrescoCoreAPIUrl}/nodes/${id}/children${queryParameter}`, options);
    return response;
  } catch (error) {
    return error;
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
    const params = event.queryStringParameters;
    const type = params?.type;

    log.info(user, `Getting nodes for id ${nodeId}`);

    validateReadUser(user);
    if (!nodeId) {
      throw new RataExtraLambdaError('node ID missing', 400);
    }

    const nodes = await getNodes(nodeId, user, type);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nodes),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
