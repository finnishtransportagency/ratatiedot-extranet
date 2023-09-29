import { ALBEvent, ALBResult } from 'aws-lambda';
import { AxiosRequestConfig } from 'axios';
import { getAlfrescoOptions } from '../../utils/alfresco';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';
import { getNodes } from './list-nodes';

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

    const combinedData = [];
    const parentNodePromises = [];
    const activityEntries = activityList.list.entries;
    console.log('activityList: ', activityEntries);

    for (const child of activityEntries) {
      console.log('child: ', child);
      const parentNodePromise = await getNodes(child.entry.activitySummary.parentObjectId, options).then((parent) => {
        console.log('parent: ', parent);
        if (parent) {
          const combinedItem = {
            ...child.entry,
            parentNodeCategory: parent.name,
          };

          console.log('combinedItem: ', combinedItem);
          combinedData.push(combinedItem);
        }
      });
      parentNodePromises.push(parentNodePromise);
    }

    const response = await Promise.all(parentNodePromises);

    log.info(user, `response: ${JSON.stringify(activityList, null, 2)}`);

    const responseBody = {
      data: response ?? {
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
