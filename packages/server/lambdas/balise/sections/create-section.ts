import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../../utils/logger';
import { getRataExtraLambdaError } from '../../utils/errors';
import { getUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';

const database = await DatabaseClient.build();

interface CreateSectionRequest {
  name: string;
  shortName: string;
  key?: string; // Optional - will be auto-generated if not provided
  description?: string;
  idRangeMin: number;
  idRangeMax: number;
  color?: string;
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

    const body: CreateSectionRequest = JSON.parse(event.body);

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

    // Generate key from name if not provided
    const key =
      body.key ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9äöå]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

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

    // Check if name is unique
    const existingNameSection = await database.section.findFirst({
      where: { name: body.name },
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

    // Create the section
    const newSection = await database.section.create({
      data: {
        name: body.name,
        shortName: body.shortName,
        key,
        description: body.description,
        idRangeMin: body.idRangeMin,
        idRangeMax: body.idRangeMax,
        color: body.color,
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
