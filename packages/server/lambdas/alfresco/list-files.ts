import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import axios from 'axios';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { findEndpoint, getAlfrescoOptions, getAlfrescoUrlBase } from '../../utils/alfresco';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { searchQueryBuilder } from './searchQueryBuilder';
import {
  AdditionalFields,
  IParentSearchParameter,
  QueryLanguage,
  SearchParameterName,
  SortingFieldParameter,
} from './searchQueryBuilder/types';
import { get } from 'lodash';

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

const searchByTermWithParent = async (uid: string, alfrescoParent: string, page: number, language: QueryLanguage) => {
  try {
    const searchParameters = [];
    const parent: IParentSearchParameter = {
      parameterName: SearchParameterName.PARENT,
      parent: alfrescoParent,
    };
    searchParameters.push(parent);
    const bodyRequest = searchQueryBuilder({
      searchParameters: searchParameters,
      page: page,
      language: language,
      additionalFields: [AdditionalFields.PROPERTIES],
      sort: [{ field: SortingFieldParameter.name, ascending: true }],
    });
    const alfrescoSearchAPIUrl = `${getAlfrescoUrlBase()}/search/versions/1/search`;
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });
    log.info(alfrescoSearchAPIUrl, 'alfrescoSearchAPIUrl');
    log.info(`bodyRequest ${bodyRequest} is stringified`);
    const response = await axios.post(`${alfrescoSearchAPIUrl}`, bodyRequest, options);
    return response.data;
  } catch (err) {
    throw err;
  }
};

const getFolder = async (uid: string, nodeId: string) => {
  try {
    const alfrescoCoreAPIUrl = `${getAlfrescoUrlBase()}/alfresco/versions/1`;
    const url = `${alfrescoCoreAPIUrl}/nodes/${nodeId}?where=(isFolder=true)&include=path`;
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });
    const response = await axios.get(url, options);
    return response.data;
  } catch (error: any) {
    log.info(`Error ${JSON.stringify(error)} is stringified`);
    // In case nodeId doesn't exist, Alfresco throws 404
    if (error.err && (error.err.status === 404 || error.err.statusCode === 404)) {
      return null;
    } else {
      throw error;
    }
  }
};

const isFolderInCategory = async (folderPath: string, category: string) => {
  // Split the path into its components
  const pathComponents = folderPath.split('/');

  // Check if the parent folder name is among the path components
  return pathComponents.includes(category);
};

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

/**
 * Get the list of files embedded to given page. Example: /api/alfresco/files?category=linjakaaviot&folderid=123
 * @param {ALBEvent} event
 * @param {{category: string, page?: number, language?: QueryLanguage }} event.queryStringParameters
 * @param {string} event.queryStringParameters.category Page to be searched for
 * @returns {Promise<ALBResult>} List of files for given page
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    const params = event.queryStringParameters;
    const category = params?.category;
    const folderId = params?.folderid;
    log.info(user, `Fetching files for for page ${category} with folder id ${folderId} `);
    // Default response
    const responseBody = {
      hasClassifiedContent: true,
      data: {
        list: {
          pagination: {
            count: 0,
            hasMoreItems: false,
            totalItems: 0,
            skipCount: 0,
            maxItems: 25,
          },
          context: {},
          entries: [],
        },
      },
    };

    validateReadUser(user);
    if (!category) {
      throw new RataExtraLambdaError('Category missing', 400);
    }
    const page = params?.page ? parseInt(params?.page) : 0;
    const categoryPage = folderId ? 0 : page;
    const language = (params?.language as QueryLanguage) ?? QueryLanguage.LUCENE;
    if (!Object.values(QueryLanguage).includes(language)) {
      throw new RataExtraLambdaError('Invalid language', 400);
    }
    if (!fileEndpointsCache.length) {
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }
    const endpoint = findEndpoint(category, fileEndpointsCache);
    const alfrescoParent = endpoint?.alfrescoFolder;
    responseBody.hasClassifiedContent = endpoint?.hasClassifiedContent || true;

    if (!alfrescoParent) {
      throw new RataExtraLambdaError('Category not found', 404);
    }
    if (!folderId) {
      responseBody.data = await searchByTermWithParent(user.uid, alfrescoParent, page, language);
    } else {
      const foundFolder = await getFolder(user.uid, folderId);
      const folderPath = get(foundFolder, 'entry.path.name', '');
      const isFolderDescendantOfCategory = await isFolderInCategory(folderPath, category);
      if (isFolderDescendantOfCategory) {
        responseBody.data = await searchByTermWithParent(user.uid, folderId, categoryPage, language);
      }
    }

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
