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
  IFolderSearchParameter,
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

const searchByTermWithParent = async (
  uid: string,
  alfrescoParent: string,
  alfrescoFolder = '',
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
    if (alfrescoFolder) {
      const folder: IFolderSearchParameter = {
        parameterName: SearchParameterName.FOLDER,
        name: alfrescoFolder,
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
    const alfrescoSearchAPIUrl = `${getAlfrescoUrlBase()}/search/versions/1/search`;
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });

    const response = await axios.post(`${alfrescoSearchAPIUrl}`, bodyRequest, options);
    return response.data;
  } catch (err) {
    throw err;
  }
};

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

/**
 * Get the list of files embedded to given page. Example: /api/alfresco/files?category=linjakaaviot&subcategory=kansio_nimi
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
    const subCategory = params?.subcategory ? decodeURI(params?.subcategory) : params?.subcategory;
    log.info(user, `Fetching files for for page ${category} with folder ${subCategory} `);

    validateReadUser(user);
    if (!category) {
      throw new RataExtraLambdaError('Category missing', 400);
    }
    const page = params?.page ? parseInt(params?.page) : 0;
    const categoryPage = subCategory ? 0 : page;
    const language = (params?.language as QueryLanguage) ?? QueryLanguage.LUCENE;
    if (!Object.values(QueryLanguage).includes(language)) {
      throw new RataExtraLambdaError('Invalid language', 400);
    }
    if (!fileEndpointsCache.length) {
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }
    const alfrescoParent = findEndpoint(category, fileEndpointsCache)?.alfrescoFolder;
    if (!alfrescoParent) {
      throw new RataExtraLambdaError('Category not found', 404);
    }

    const categoryData = await searchByTermWithParent(user.uid, alfrescoParent, subCategory, categoryPage, language);
    if (subCategory) {
      const folderId = get(categoryData, 'list.entries[0].entry.id', -1);
      const subCategoryData = await searchByTermWithParent(user.uid, folderId, '', page, language);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subCategoryData),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
