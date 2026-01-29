import { CategoryDataBase } from '../../generated/prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { AdditionalFields, QueryLanguage } from './searchQueryBuilder/types';
import { get } from 'lodash';
import { validateQueryParameters } from '../../utils/validation';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';

export type TNode = {
  entry: {
    id: string;
    name: string;
    modifiedAt: string;
    nodeType: string;
    content: unknown;
    parentId: string;
    isFile: boolean;
    isFolder: boolean;
  };
};

const listFiles = async (uid: string, nodeId: string, page: number, ascending: boolean = true) => {
  try {
    const skipCount = Math.max(page ?? 0, 0) * 50;
    const order = ascending ? 'ASC' : 'DESC';
    const url = `${alfrescoApiVersion}/nodes/${nodeId}/children?skipCount=${skipCount}&maxItems=50&include=${AdditionalFields.PROPERTIES}&orderBy=name ${order}`;
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });
    const response = await alfrescoAxios.get(url, options);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getFolder = async (uid: string, nodeId: string) => {
  try {
    const url = `${alfrescoApiVersion}/nodes/${nodeId}?include=path`;
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });
    const response = await alfrescoAxios.get(url, options);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const isNodeInCategory = (folderPathInfo: unknown, categoryAlfrescoId: string): boolean => {
  // The path object from Alfresco API should contain an array of elements with both id and name
  // We check if any element in the path has the category's Alfresco node ID
  if (folderPathInfo && typeof folderPathInfo === 'object' && 'elements' in folderPathInfo) {
    const pathElements = folderPathInfo.elements;
    if (Array.isArray(pathElements)) {
      return pathElements.some(
        (element: unknown) =>
          element && typeof element === 'object' && 'id' in element && element.id === categoryAlfrescoId,
      );
    }
  }

  // Fallback: if we only have path name string, check if the category node ID is in the path
  if (typeof folderPathInfo === 'string') {
    return folderPathInfo.includes(categoryAlfrescoId);
  }

  return false;
};

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

/**
 * Case 1: Get the list of files and folders embedded to category page.
 * Example: /api/alfresco/files?category=linjakaaviot&order=ascending
 * Case 2: Get the list of files and folders embedded to any folder that is a descendant of category page.
 * Example: /api/alfresco/files?category=linjakaaviot&nestedFolderId=123
 * @param {ALBEvent} event
 * @param {{category: string, page?: number, language?: QueryLanguage }} event.queryStringParameters
 * @param {string} event.queryStringParameters.category Page to be searched for
 * @returns {Promise<ALBResult>} List of files for given page
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    const params = event.queryStringParameters;
    // only listed parameters are accepted
    validateQueryParameters(params, ['category', 'nestedFolderId', 'page', 'language', 'order']);
    const category = params?.category;
    const nestedFolderId = params?.nestedFolderId;
    const order = params?.order;
    let ascendingOrder = true;

    if (order) {
      if (order === 'descending') {
        ascendingOrder = false;
      }
      if (order !== 'ascending' && order !== 'descending') {
        throw new RataExtraLambdaError('Invalid order parameter, allowed params are: "ascending" or "descenting"', 400);
      }
    }

    log.info(
      user,
      `Fetching files for page ${category} ${nestedFolderId ? `, nested folder id ${nestedFolderId}` : ''}`,
    );

    validateReadUser(user);
    if (!category) {
      throw new RataExtraLambdaError('Category missing', 400);
    }

    const page = params?.page ? parseInt(params?.page) : 0;
    const language = (params?.language as QueryLanguage) ?? QueryLanguage.LUCENE;
    if (!Object.values(QueryLanguage).includes(language)) {
      throw new RataExtraLambdaError('Invalid language', 400);
    }
    if (!fileEndpointsCache.length) {
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }
    const endpoint = findEndpoint(category, fileEndpointsCache);
    const alfrescoParent = endpoint?.alfrescoFolder;

    if (!alfrescoParent) {
      throw new RataExtraLambdaError('Category not found', 404);
    }

    let data;
    if (nestedFolderId) {
      const foundFolder = await getFolder(user.uid, nestedFolderId);
      const folderPath = get(foundFolder, 'entry.path', '');
      // Check if the nest folder is a descendant of the category
      const isFolderDescendantOfCategory = isNodeInCategory(folderPath, alfrescoParent);
      if (isFolderDescendantOfCategory) {
        data = await listFiles(user.uid, nestedFolderId, page, ascendingOrder);
      }
    } else {
      data = await listFiles(user.uid, alfrescoParent, page, ascendingOrder);
    }

    const responseBody = {
      hasClassifiedContent: endpoint?.hasClassifiedContent,
      hasConfidentialContent: endpoint?.hasConfidentialContent,
      data: data ?? {
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
