import { AxiosRequestConfig } from 'axios';
import { alfrescoAxios, alfrescoApiVersion } from '../../utils/axios';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getServiceUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { AlfrescoActivityResponse } from '../database/get-activities';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { CategoryDataBase, Prisma } from '@prisma/client';
import { getFolder } from './list-files';

const database = await DatabaseClient.build();
let fileEndpointsCache: Array<CategoryDataBase> = [];

const getActivities = async (options: AxiosRequestConfig, skipCount = 0, maxItems = 50) => {
  try {
    const response = await alfrescoAxios.get(
      `${alfrescoApiVersion}/people/-me-/activities?skipCount=${skipCount}&maxItems=${maxItems}`,
      options,
    );

    const activities = response.data.list.entries as AlfrescoActivityResponse[];
    const nonDownloadActivities = activities.filter((child: { entry: { activityType: string } }) => {
      const allowedTypes = [
        'org.alfresco.documentlibrary.file-added',
        'org.alfresco.documentlibrary.file-deleted',
        'org.alfresco.documentlibrary.folder-added',
        'org.alfresco.documentlibrary.folder-deleted',
        'org.alfresco.documentlibrary.inline-edit',
      ];
      return allowedTypes.includes(child.entry.activityType);
    });
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
    console.log('error at getNode: ', error);
    throw error;
  }
};

async function combineData(childData: AlfrescoActivityResponse[], options: AxiosRequestConfig) {
  const combinedData: Prisma.ActivityCreateManyInput[] = [];
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
        const categoryData = findEndpoint(categoryname, fileEndpointsCache);

        const combinedItem = {
          activityId: child.entry.id,
          alfrescoId: child.entry.activitySummary.objectId,
          action: child.entry.activityType,
          fileName: child.entry.activitySummary.title,
          timestamp: new Date(child.entry.postedAt),
          mimeType: node.entry.isFile ? node.entry.content.mimeType : node.entry.isFolder ? 'folder' : 'other',
          categoryId: categoryData?.id,
        };
        combinedData.push(combinedItem);
      }
    });
    nodePromises.push(nodePromise);
  }

  for (const deletedNode of deletedNodeEntries) {
    const folderPromise = await getFolder(
      options.headers?.['OAM-REMOTE-USER'],
      deletedNode.entry.activitySummary.parentObjectId,
    ).then((folder) => {
      const categoryName = folder.entry?.path.elements[4]?.name || folder.entry?.name;
      let categoryId = null;
      if (categoryName) {
        const category = findEndpoint(categoryName, fileEndpointsCache);
        categoryId = category?.id;
      }

      const mimeType =
        deletedNode.entry.activityType === 'org.alfresco.documentlibrary.folder-deleted' ||
        deletedNode.entry.activityType === 'org.alfresco.documentlibrary.folder-added'
          ? 'folder'
          : 'other';

      const deletedItem = {
        activityId: deletedNode.entry.id,
        alfrescoId: undefined,
        action: deletedNode.entry.activityType,
        fileName: deletedNode.entry.activitySummary.title,
        timestamp: new Date(deletedNode.entry.postedAt),
        mimeType,
        categoryId,
      };
      combinedData.push(deletedItem);
    });
    nodePromises.push(folderPromise);
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
    const serviceUser = getServiceUser();
    log.info(`Fetching alfresco activities and populating database..`);

    const options = await getAlfrescoOptions(serviceUser.uid);

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
      // A filtered list of items that are newer than the ones in DB, only these will be inserted
      filteredActivityList = activityList.filter((activity) => activity.entry.id > latestActivityInDb.activityId);
    }

    let combinedData: Prisma.ActivityCreateManyInput[] = [];
    // If filteredActivitylist, then we have newer entries in API that dont yet exist in db. add those to db.
    if (filteredActivityList.length > 0) {
      combinedData = await combineData(filteredActivityList, options);
    }

    // initial insert to DB
    if (latestActivityInDb === null) {
      combinedData = await combineData(activityList, options);
    }

    await database.activity.createMany({
      data: combinedData,
      skipDuplicates: true,
    });
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
