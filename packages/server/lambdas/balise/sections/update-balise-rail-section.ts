import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../../../utils/logger';
import { getRataExtraLambdaError } from '../../../utils/errors';
import { getUser, validateWriteUser } from '../../../utils/userService';
import { DatabaseClient } from '../../database/client';
import {
  generateKeyFromName,
  validateRequiredFields,
  validateIdRange,
  validateNameUniqueness,
  validateKeyUniqueness,
  createErrorResponse,
} from '../../../utils/sectionValidation';

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
    const requiredFieldsValidation = validateRequiredFields(body);
    if (!requiredFieldsValidation.isValid) {
      return createErrorResponse(requiredFieldsValidation.error!, requiredFieldsValidation.statusCode!);
    }

    // Validate ID range
    const idRangeValidation = validateIdRange(body.idRangeMin, body.idRangeMax);
    if (!idRangeValidation.isValid) {
      return createErrorResponse(idRangeValidation.error!, idRangeValidation.statusCode!);
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
      const nameUniquenessValidation = await validateNameUniqueness(database, body.name, sectionId);
      if (!nameUniquenessValidation.isValid) {
        return createErrorResponse(nameUniquenessValidation.error!, nameUniquenessValidation.statusCode!);
      }
    }

    // Generate new key from name
    const key = generateKeyFromName(body.name);

    // Check if key would conflict with another section (excluding current section)
    if (key !== existingSection.key) {
      const keyUniquenessValidation = await validateKeyUniqueness(database, key, sectionId);
      if (!keyUniquenessValidation.isValid) {
        return createErrorResponse(keyUniquenessValidation.error!, keyUniquenessValidation.statusCode!);
      }
    }

    // Update the section
    const updatedSection = await database.section.update({
      where: { id: sectionId },
      data: {
        name: body.name,
        shortName: body.shortName,
        key,
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
