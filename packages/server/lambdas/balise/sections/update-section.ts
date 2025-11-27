import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../../../utils/logger';
import { getRataExtraLambdaError } from '../../../utils/errors';
import { getUser, validateWriteUser } from '../../../utils/userService';
import { DatabaseClient } from '../../database/client';

const database = await DatabaseClient.build();

interface UpdateSectionRequest {
  name: string;
  shortName: string;
  description?: string;
  idRangeMin: number;
  idRangeMax: number;
  color?: string;
}

/**
 * Update a section. Example request: PUT /api/balise/sections/{sectionId}
 * @param {ALBEvent} event
 * @param {{UpdateSectionRequest}} event.body JSON stringified
 * @returns  {Promise<ALBResult>} JSON stringified object of updated section
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    // Extract section ID from path (e.g., /api/balise/sections/{sectionId})
    const pathParts = event.path.split('/').filter((p) => p);
    const sectionId = pathParts[pathParts.indexOf('sections') + 1];

    if (!sectionId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Section ID is required' }),
      };
    }

    log.info(user, `Update section. id: ${sectionId}, path: ${event.path}`);
    validateWriteUser(user, '');

    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const body: UpdateSectionRequest = JSON.parse(event.body);

    // Validate required fields
    if (!body.name || !body.shortName || body.idRangeMin === undefined || body.idRangeMax === undefined) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Name, shortName, idRangeMin, and idRangeMax are required' }),
      };
    }

    // Validate ID range
    if (body.idRangeMin >= body.idRangeMax) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'idRangeMin must be less than idRangeMax' }),
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

    // Check if name is unique (excluding current section)
    if (body.name !== existingSection.name) {
      const existingNameSection = await database.section.findFirst({
        where: {
          name: body.name,
          id: { not: sectionId },
        },
      });

      if (existingNameSection) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: 'Section name already exists' }),
        };
      }
    }

    // Update the section
    const updatedSection = await database.section.update({
      where: { id: sectionId },
      data: {
        name: body.name,
        shortName: body.shortName,
        description: body.description,
        idRangeMin: body.idRangeMin,
        idRangeMax: body.idRangeMax,
        color: body.color,
        updatedBy: user.uid,
        updatedTime: new Date(),
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSection),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
