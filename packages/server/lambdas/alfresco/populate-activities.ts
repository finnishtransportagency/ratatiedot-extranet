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
    console.log('error at getActivities: ', error);
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
    console.log('error at getNode: ', error);
    throw error;
  }
};

async function combineData(childData: AlfrescoActivityResponse[], options: AxiosRequestConfig) {
  const combinedData: AlfrescoCombinedResponse[] = [];
  const nodePromises = [];

  const deletedNodeIds = new Set();
  const deletedNodeEntries: AlfrescoActivityResponse[] = [];

  const nodesToFetch = childData.filter((child) => {
    const nodeDeleted =
      child.entry.activityType === 'org.alfresco.documentlibrary.file-deleted' ||
      child.entry.activityType === 'org.alfresco.documentlibrary.folder-deleted' ||
      ((child.entry.activityType === 'org.alfresco.documentlibrary.file-added' ||
        child.entry.activityType === 'org.alfresco.documentlibrary.folder-added') &&
        deletedNodeIds.has(child.entry.activitySummary.objectId));

    if (nodeDeleted) {
      deletedNodeIds.add(child.entry.activitySummary.objectId);
      deletedNodeEntries.push(child);
    } else {
      return !deletedNodeIds.has(child.entry.activitySummary.objectId);
    }
  });

  // Only fetch additional info for items that are present in Alfresco
  for (const child of nodesToFetch) {
    const nodeId = child.entry.activitySummary.objectId!;
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

  for (const deletedNode of deletedNodeEntries) {
    // item doesn't exist in alfresco, delete its id
    // so we dont route to alfresco to view a non-existent file
    delete deletedNode.entry.activitySummary.objectId;
    combinedData.push({
      activityEntry: deletedNode.entry,
      nodeEntry: undefined,
      categoryName: '',
    });
  }
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

    const activityList = await getActivities(options, 0, 200);
    const latestActivityInDb = await database.activity.findFirst({
      take: 1,
      orderBy: { activityId: 'desc' },
    });

    let filteredActivityList: AlfrescoActivityResponse[] = [];
    if (latestActivityInDb) {
      filteredActivityList = activityList.filter((activity) => activity.entry.id > latestActivityInDb.activityId);
    }

    const combinedData = await combineData(
      filteredActivityList.length > 0 ? filteredActivityList : activityList,
      options,
    );

    const activityObjects: Prisma.ActivityCreateManyInput[] = [];

    for (const item of combinedData) {
      const categoryData = findEndpoint(item.categoryName, fileEndpointsCache);
      const activityEntry = item.activityEntry;
      const nodeEntry = item.nodeEntry;

      activityObjects.push({
        activityId: activityEntry.id,
        alfrescoId: activityEntry.activitySummary.objectId,
        action: activityEntry.activityType,
        fileName: activityEntry.activitySummary.title,
        timestamp: new Date(activityEntry.postedAt),
        mimeType: nodeEntry?.isFile ? nodeEntry.content.mimeType : nodeEntry?.isFolder ? 'folder' : 'other',
        categoryId: categoryData?.id,
      });
    }

    await database.activity.createMany({
      data: activityObjects,
      skipDuplicates: true,
    });
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
