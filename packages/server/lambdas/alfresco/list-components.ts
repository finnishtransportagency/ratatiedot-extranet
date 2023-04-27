import { ALBEvent, ALBResult } from 'aws-lambda';
import { findEndpoint } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { getComponents } from '../database/components/get-components';

const database = await DatabaseClient.build();

/**
 * Get page components. Example request: GET /api/alfresco/folders/linjakaaviot
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the name of the alfresco folder
 * @returns  {Promise<ALBResult>} JSON stringified object of pages components
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult | undefined> {
  try {
    const paths = event.path.split('/');
    const category = paths.pop();
    const user = await getUser(event);

    validateReadUser(user);

    if (!category) {
      throw new RataExtraLambdaError('Category missing from path', 400);
    }

    const fileEndpointsCache = await database.categoryDataBase.findMany();
    const categoryData = findEndpoint(category, fileEndpointsCache);

    if (!categoryData) {
      throw new RataExtraLambdaError('Category not found', 404);
    }

    const components = await getComponents(categoryData.id);

    log.info(user, `Get components for page id ${categoryData.id}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type:': 'application/json' },
      body: JSON.stringify(components),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
