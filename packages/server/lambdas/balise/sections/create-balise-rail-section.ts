import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../../../utils/logger';
import { getRataExtraLambdaError } from '../../../utils/errors';
import { getUser, validateBaliseAdminUser } from '../../../utils/userService';
import { DatabaseClient } from '../../database/client';
import {
  generateKeyFromName,
  validateRequiredFields,
  validateIdRange,
  validateNameUniqueness,
  createErrorResponse,
} from '../../../utils/balise/sectionValidation';

const database = await DatabaseClient.build();

interface CreateSectionRequest {
  name: string;
  key?: string; // Optional - will be auto-generated if not provided
  description?: string;
  idRangeMin: number;
  idRangeMax: number;
}

/**
 * Create a new section. Example request: POST /api/balise/sections
 * @param {ALBEvent} event
 * @param {{CreateSectionRequest}} event.body JSON stringified
 * @returns  {Promise<ALBResult>} JSON stringified object of created section
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    log.info(user, `Create section. path: ${event.path}`);

    validateBaliseAdminUser(user);

    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const body: CreateSectionRequest = JSON.parse(event.body);

    // Validate required fields
    const requiredFieldsValidation = validateRequiredFields(body);
    if (!requiredFieldsValidation.isValid) {
      return createErrorResponse(requiredFieldsValidation.error!, requiredFieldsValidation.statusCode!);
    }

    // Generate key from name
    const key = body.key || generateKeyFromName(body.name);

    // Validate ID range
    const idRangeValidation = validateIdRange(body.idRangeMin, body.idRangeMax);
    if (!idRangeValidation.isValid) {
      return createErrorResponse(idRangeValidation.error!, idRangeValidation.statusCode!);
    }

    // Check if name is unique
    const nameUniquenessValidation = await validateNameUniqueness(database, body.name);
    if (!nameUniquenessValidation.isValid) {
      return createErrorResponse(nameUniquenessValidation.error!, nameUniquenessValidation.statusCode!);
    }

    // Create the section
    const newSection = await database.section.create({
      data: {
        name: body.name,
        key,
        description: body.description,
        idRangeMin: body.idRangeMin,
        idRangeMax: body.idRangeMax,
        createdBy: user.uid,
        active: true,
      },
    });

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSection),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
