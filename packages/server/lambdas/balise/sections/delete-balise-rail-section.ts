import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../../../utils/logger';
import { getRataExtraLambdaError } from '../../../utils/errors';
import { getUser, validateBaliseAdminUser } from '../../../utils/userService';
import { DatabaseClient } from '../../database/client';

const database = await DatabaseClient.build();

/**
 * Delete a section by ID. Example request: DELETE /api/balise/sections/{id}
 * @param {ALBEvent} event
 * @returns  {Promise<ALBResult>} JSON response with success message
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    // Extract section ID from path
    const pathParts = event.path.split('/');
    const sectionId = pathParts[pathParts.length - 1];

    log.info(user, `Delete section. id: ${sectionId}, path: ${event.path}`);

    // TODO: Specify validation requirements later
    validateBaliseAdminUser(user);

    if (!sectionId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Section ID is required' }),
      };
    }

    // Check if section exists
    const existingSection = await database.section.findUnique({
      where: { id: sectionId },
    });

    if (!existingSection) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Section not found' }),
      };
    }

    // Delete the section
    await database.section.delete({
      where: { id: sectionId },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Section deleted successfully' }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
