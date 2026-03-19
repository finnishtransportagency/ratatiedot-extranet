import { ALBEvent, ALBResult } from 'aws-lambda';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { RataExtraLambdaError, getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { validateQueryParameters } from '../../utils/validation';
import type { CategoryDataBase } from '../../generated/prisma/client';
import { DatabaseClient } from '../database/client';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';
import { TNode } from './list-files';

const database = await DatabaseClient.build();
let fileEndpointsCache: Array<CategoryDataBase> = [];

const listFolders = async (uid: string, nodeId: string) => {
  try {
    const url = `${alfrescoApiVersion}/nodes/${nodeId}/children?where=(isFolder=true)`;
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });
    const response = await alfrescoAxios.get(url, options);
    const folders = response.data.list.entries;

    const childPromises = folders.map((folder: TNode) => listFolders(uid, folder.entry.id));
    const childArrays = await Promise.all(childPromises);

    for (let i = 0; i < folders.length; i++) {
      if (childArrays[i].length > 0) {
        folders[i].entry.children = childArrays[i];
      }
    }
    return folders;
  } catch (err) {
    throw err;
  }
};

/**
 * @param {ALBEvent} event
 * @param {{category: string, folderId: string }} event.queryStringParameters
 * @param {string} event.queryStringParameters.category Get folders for given root page
 * @param {string} event.queryStringParameters.folderId Get folders for given folder inside the root page
 * @returns {Promise<ALBResult>} List of folders for given page or folder
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    const params = event.queryStringParameters;
    // only listed parameters are accepted
    validateQueryParameters(params, ['category', 'folderId']);
    const category = params?.category;

    validateReadUser(user);
    if (!category) {
      throw new RataExtraLambdaError('Category missing', 400);
    }

    log.info(user, `Fetching folders for page ${category}`);
    if (!fileEndpointsCache.length) {
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }
    const endpoint = findEndpoint(category, fileEndpointsCache);
    const alfrescoParent = endpoint?.alfrescoFolder;

    if (!alfrescoParent) {
      throw new RataExtraLambdaError('Category or folder not found', 404);
    }

    const folders = await listFolders(user.uid, alfrescoParent);

    const folderStructure = [
      {
        entry: {
          id: alfrescoParent,
          name: endpoint.rataextraRequestPage,
          children: folders,
        },
      },
    ];

    const responseBody = {
      data: folderStructure ?? {
        list: {
          pagination: {
            count: 0,
            hasMoreItems: false,
            totalItems: 0,
            skipCount: 0,
            maxItems: 50,
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
