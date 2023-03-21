import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import axios from 'axios';
import { get } from 'lodash';

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
} from './searchQueryBuilder/types';

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
    const parent: IParentSearchParameter = {
      parameterName: SearchParameterName.PARENT,
      parent: alfrescoParent,
    };

    const bodyRequest = searchQueryBuilder({
      searchParameters: [parent],
      page: page,
      language: language,
      additionalFields: [AdditionalFields.PROPERTIES],
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

    const categoryData = await searchByTermWithParent(user.uid, alfrescoParent, page, language);
    log.info('categoryData');
    console.log(categoryData);

    if (subCategory) {
      const entries = await get(categoryData, 'list.entries', []);
      log.info('entries');
      console.log(subCategory);
      console.log(entries);
      const folder = (await entries.find((node: TNode) => {
        const { entry } = node;
        const { name, isFolder } = entry;
        return name === subCategory && isFolder === true;
      })) as TNode;
      log.info('folder:');
      console.log(folder);
      const subCategoryData = folder ? await searchByTermWithParent(user.uid, folder.entry.id, page, language) : null;

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
