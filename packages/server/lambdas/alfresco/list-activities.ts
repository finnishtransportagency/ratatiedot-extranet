import { ALBEvent, ALBResult } from 'aws-lambda';
import { AxiosRequestConfig } from 'axios';
import { getAlfrescoOptions } from '../../utils/alfresco';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';
import { getNodes } from './list-nodes';

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
      objectId: string;
    };
    id: string;
    activityType: string;
    parent: unknown;
  };
}

export const getActivities = async (options: AxiosRequestConfig) => {
  try {
    const response = await alfrescoAxios.get(
      `${alfrescoApiVersion}/people/-me-/activities?skipCount=0&maxItems=5`,
      options,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

async function combineChildWithParent(childData: AlfrescoActivityResponse[], options: AxiosRequestConfig) {
  const combinedData: AlfrescoActivityResponse[] = [];
  const parentPromises = [];

  for (const child of childData) {
    const parentId = child.entry.activitySummary.parentObjectId;

    const parentPromise = getNodes(parentId, options).then((parent) => {
      console.log('parent: ', parent);
      if (parent) {
        const combinedItem = {
          ...child,
          parent,
        };
        combinedData.push(combinedItem);
      }
    });

    parentPromises.push(parentPromise);
  }

  await Promise.all(parentPromises);

  return combinedData;
}

/**
 * Get the list of recent activities
 * @param {ALBEvent} event
 * @returns {Promise<ALBResult>} List of activities
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    log.info(user, `Fetching recent Alfresco activity list`);

    validateReadUser(user);

    const options = await getAlfrescoOptions(user.uid);
    const activityList = await getActivities(options);

    const activityEntries = activityList.list.entries;

    const combinedData = await combineChildWithParent(activityEntries, options);

    console.log('combinedData: ', combinedData);
    log.info(user, `response: ${JSON.stringify(activityList, null, 2)}`);

    const responseBody = {
      data: combinedData ?? {
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
