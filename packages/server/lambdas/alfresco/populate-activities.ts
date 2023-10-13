import { AxiosRequestConfig } from 'axios';
import { alfrescoAxios, alfrescoApiVersion } from '../../utils/axios';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getMockUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { AlfrescoActivityResponse, AlfrescoCombinedResponse } from '../database/get-activities';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { CategoryDataBase, Prisma } from '@prisma/client';

const database = await DatabaseClient.build();
let fileEndpointsCache: Array<CategoryDataBase> = [];

const getActivities = async (options: AxiosRequestConfig, skipCount = 0, maxItems = 50) => {
  try {
    const response = await alfrescoAxios.get(
      `${alfrescoApiVersion}/people/-me-/activities?skipCount=${skipCount}&maxItems=${maxItems}`,
      options,
    );

    const activities = response.data.list.entries as AlfrescoActivityResponse[];
    const nonDownloadActivities = activities.filter(
      (child: { entry: { activityType: string } }) =>
        child.entry.activityType !== 'org.alfresco.documentlibrary.file-downloaded' &&
        child.entry.activityType !== 'org.alfresco.documentlibrary.folder-downloaded',
    );
    console.log('Found ' + nonDownloadActivities.length + ' activities.');
    return nonDownloadActivities;
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
    console.log('Error happened in getNode');
    throw error;
  }
};

async function combineData(childData: AlfrescoActivityResponse[], options: AxiosRequestConfig) {
  const combinedData: AlfrescoCombinedResponse[] = [];
  const nodePromises = [];

  for (const child of childData) {
    const nodeId = child.entry.activitySummary.objectId;

    // get the contents of the node to determine its category
    const nodePromise = await getNode(nodeId, options, ['path']).then((node) => {
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
 * Fetch activies from Alfresco, filter and save to db
 * @returns {Promise<void>}
 */
export async function handleRequest(): Promise<unknown> {
  try {
    const user = getMockUser();
    validateReadUser(user);

    const options = await getAlfrescoOptions(user.uid);

    log.info(`Fetching alfresco activities and populating database..`);

    if (!fileEndpointsCache.length) {
      log.debug('Cache empty');
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }

    const activityList = await getActivities(options, 0, 1000);
    const combinedData = await combineData(activityList, options);

    const activityObjects: Prisma.ActivityCreateManyInput[] = [];

    for (const item of combinedData) {
      const categoryData = findEndpoint(item.categoryName, fileEndpointsCache);
      console.log('Categorydata: ', categoryData);
      if (categoryData) {
        activityObjects.push({
          alfrescoId: item.nodeEntry.id,
          action: item.activityEntry.activityType,
          fileName: item.nodeEntry.name,
          timestamp: new Date(item.activityEntry.postedAt),
          mimeType: item.nodeEntry.content.mimeType,
          categoryId: categoryData?.id,
        });
      }
    }

    await database.activity.createMany({
      data: activityObjects,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
