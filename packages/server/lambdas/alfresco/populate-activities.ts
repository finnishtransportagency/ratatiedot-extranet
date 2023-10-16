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
    console.log('Fetching node info for node: ', nodeId);
    const response = await alfrescoAxios.get(`${alfrescoApiVersion}/nodes/${nodeId}${queryParameter}`, options);
    console.log('response: ', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

async function combineData(childData: AlfrescoActivityResponse[], options: AxiosRequestConfig) {
  const combinedData: AlfrescoCombinedResponse[] = [];
  const nodePromises = [];

  for (const child of childData) {
    const nodeId = child.entry.activitySummary.objectId;
    const isNotDeleted =
      child.entry.activityType !== 'org.alfresco.documentlibrary.file-deleted' &&
      child.entry.activityType !== 'org.alfresco.documentlibrary.folder-deleted';

    // get the contents of the node to determine its category if node is not deleted
    if (isNotDeleted) {
      console.log('Node is not deleted, continue');
      console.log('getNode: ', nodeId);
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

    const activityList = await getActivities(options, 0, 100);
    const combinedData = await combineData(activityList, options);

    const activityObjects: Prisma.ActivityCreateManyInput[] = [];

    for (const item of combinedData) {
      const categoryData = findEndpoint(item.categoryName, fileEndpointsCache);
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
