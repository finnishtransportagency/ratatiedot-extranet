import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { AlfrescoEntry } from '../alfresco/fileRequestBuilder/types';
import { DatabaseClient } from './client';

const database = await DatabaseClient.build();

export interface AlfrescoActivityResponse {
  entry: {
    postedAt: string;
    feedPersonId: string;
    postPersonId: string;
    siteId: string;
    activitySummary: {
      firstName: string;
      lastName: string;
      parentObjectId: string;
      title: string;
      objectId?: string;
    };
    id: number;
    activityType: string;
    parent: unknown;
  };
}

export interface AlfrescoCombinedResponse {
  activityEntry: {
    postedAt: string;
    feedPersonId: string;
    postPersonId: string;
    siteId: string;
    activitySummary: { firstName: string; lastName: string; parentObjectId: string; title: string; objectId?: string };
    id: number;
    activityType: string;
    parent: unknown;
  };
  nodeEntry: AlfrescoEntry | undefined;
  categoryName: string;
}

/**
 * Get the list of recent activities
 * @param {ALBEvent} event
 * @returns {Promise<ALBResult>} List of activities
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    validateReadUser(user);

    log.info(user, `Fetching recent Alfresco activity list`);

    const activities = await database.activity.findMany({ take: 5 });

    const responseBody = {
      data: activities ?? {
        list: {
          pagination: {
            count: 0,
            hasMoreItems: false,
            totalItems: 0,
            skipCount: 0,
            maxItems: 5,
          },
          context: {},
          entries: [],
        },
      },
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseBody),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
