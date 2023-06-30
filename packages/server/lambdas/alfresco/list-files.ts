import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { searchQueryBuilder } from './searchQueryBuilder';
import {
  AdditionalFields,
  IFolderSearchParameter,
  IParentSearchParameter,
  QueryLanguage,
  SearchParameterName,
  SortingFieldParameter,
} from './searchQueryBuilder/types';
import { get } from 'lodash';
import { validateQueryParameters } from '../../utils/validation';
import { alfrescoApiVersion, alfrescoAxios, alfrescoSearchApiVersion } from '../../utils/axios';

export type TNode = {
  entry: {
    id: string;
    name: string;
    modifiedAt: string;
    nodeType: string;
    content: any;
    parentId: string;
    isFile: boolean;
    isFolder: boolean;
  };
};

const searchByTermWithParent = async (
  uid: string,
  alfrescoParent: string,
  alfrescoChildFolder = '',
  page: number,
  language: QueryLanguage,
) => {
  try {
    const searchParameters = [];
    const parent: IParentSearchParameter = {
      parameterName: SearchParameterName.PARENT,
      parent: alfrescoParent,
    };
    searchParameters.push(parent);
    if (alfrescoChildFolder) {
      const folder: IFolderSearchParameter = {
        parameterName: SearchParameterName.FOLDER,
        name: alfrescoChildFolder,
      };
      searchParameters.push(folder);
    }
    const bodyRequest = searchQueryBuilder({
      searchParameters: searchParameters,
      page: page,
      language: language,
      additionalFields: [AdditionalFields.PROPERTIES],
      sort: [{ field: SortingFieldParameter.name, ascending: true }],
    });
    const url = alfrescoSearchApiVersion;
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });
    const response = await alfrescoAxios.post(url, bodyRequest, options);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getFolder = async (uid: string, nodeId: string) => {
  try {
    const url = `${alfrescoApiVersion}/nodes/${nodeId}?where=(isFolder=true)&include=path`;
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });
    const response = await alfrescoAxios.get(url, options);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const isFolderInCategory = async (folderPath: string, category: string) => {
  // Split the path into its components
  const pathComponents = folderPath.split('/');

  // Check if the parent folder name is among the path components
  // Adjust the index based on given path structure
  // e.g. /Company Home/Sites/ratat-extra/documentLibrary/hallintaraportit -> ['', 'Company Home', 'Sites', 'ratat-extra', 'documentLibrary', 'hallintaraportit']
  return pathComponents[5] === category;
};

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

/**
 * Case 1: Get the list of files and folders embedded to category page.
 * Example: /api/alfresco/files?category=linjakaaviot
 * Case 2: Get the list of files and folders embedded to any folder that is a descendant of category page.
 * Example: /api/alfresco/files?category=linjakaaviot&nestedFolderId=123
 * Case 3: Get the list of files and folders embedded to direct child folder of category page
 * Example: /api/alfresco/files?category=linjakaaviot&childFolderName=vuosi_2023
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
    validateQueryParameters(params, ['category', 'nestedFolderId', 'childFolderName', 'page', 'language']);
    const category = params?.category;
    const nestedFolderId = params?.nestedFolderId;
    const childFolderName = params?.childFolderName;

    log.info(
      user,
      `Fetching files for for page ${category} ${nestedFolderId ? `, nested folder id ${nestedFolderId}` : ''} ${
        childFolderName ? `, category's child folder name ${childFolderName}` : ''
      }`,
    );

    validateReadUser(user);
    if (!category) {
      throw new RataExtraLambdaError('Category missing', 400);
    }

    if (nestedFolderId && childFolderName) {
      throw new RataExtraLambdaError(
        'Both nestedFolderId and childFolderName parameters cannot be present simultaneously. Please use only one.',
        400,
      );
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
      const folderPath = get(foundFolder, 'entry.path.name', '');
      // Check if the nest folder is a descendant of the category
      const isFolderDescendantOfCategory = await isFolderInCategory(folderPath, category);
      if (isFolderDescendantOfCategory) {
        data = await searchByTermWithParent(user.uid, nestedFolderId, '', page, language); // '' as no child folder given
      }
    }

    if (childFolderName) {
      // Check if the folder is a direct child of the category
      const childFolder = await searchByTermWithParent(user.uid, alfrescoParent, childFolderName, 0, language); // direct child folder name is given, default page should be 0
      const childFolderId = get(childFolder, 'list.entries[0].entry.id', -1);
      data = await searchByTermWithParent(user.uid, childFolderId, '', page, language);
    }

    if (!nestedFolderId && !childFolderName) {
      data = await searchByTermWithParent(user.uid, alfrescoParent, '', page, language); // '' as no child folder given
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
