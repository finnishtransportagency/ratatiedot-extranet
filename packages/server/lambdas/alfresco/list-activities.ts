import { ALBEvent, ALBResult } from 'aws-lambda';
import { AxiosRequestConfig } from 'axios';
import { getAlfrescoOptions } from '../../utils/alfresco';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';
import { AlfrescoEntry } from './fileRequestBuilder/types';

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

interface AlfrescoCombinedResponse {
  activityEntry: {
    postedAt: string;
    feedPersonId: string;
    postPersonId: string;
    siteId: string;
    activitySummary: { firstName: string; lastName: string; parentObjectId: string; title: string; objectId: string };
    id: string;
    activityType: string;
    parent: unknown;
  };
  nodeEntry: AlfrescoEntry;
  categoryName: string;
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

export const getNode = async (nodeId: string, options: AxiosRequestConfig, include: string[]) => {
  try {
    let queryParameter = '';
    if (include.length) {
      queryParameter = `?include=${include.join(',')}`;
    }
    const response = await alfrescoAxios.get(`${alfrescoApiVersion}/nodes/${nodeId}${queryParameter}`, options);
    return response.data;
  } catch (error) {
    throw error;
  }
};

async function combineData(childData: AlfrescoActivityResponse[], options: AxiosRequestConfig) {
  const combinedData: AlfrescoCombinedResponse[] = [];
  const nodePromises = [];

  const filteredChildData = childData.filter(
    (child) =>
      child.entry.activityType !== 'org.alfresco.documentlibrary.file-downloaded' &&
      child.entry.activityType !== 'org.alfresco.documentlibrary.folder-downloaded',
  );

  for (const child of filteredChildData) {
    const nodeId = child.entry.activitySummary.objectId;

    // get the contents of the node to determine its category
    const nodePromise = getNode(nodeId, options, ['path']).then((node) => {
      // eg. "/Company Home/Sites/site/root/category1"
      // where category1 is the actual categoryName we want to know
      const categoryname: string = node.entry.path.elements[4]?.name;
      // If node has a category and category is not the root page
      if (categoryname && categoryname !== 'documentLibrary') {
        const combinedItem = {
          activityEntry: child.entry,
          nodeEntry: node.entry,
          categoryName: categoryname,
        };
        combinedData.push(combinedItem);
      }
    });
    nodePromises.push(nodePromise);
  }

  await Promise.all(nodePromises);
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
    const combinedData = await combineData(activityEntries, options);

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
