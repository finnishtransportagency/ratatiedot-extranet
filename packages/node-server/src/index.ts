import express, { Request, Response } from 'express';
import { CategoryDataBase } from '@prisma/client';
import { ALBResult } from 'aws-lambda';
import { isEmpty } from 'lodash';
import { findEndpoint, getAlfrescoOptions, getAlfrescoUrlBase } from '../../server/utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../server/utils/errors';
import { log, auditLog } from '../../server/utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../server/utils/userService';
import { DatabaseClient } from '../../server/lambdas/database/client';
import { fileRequestBuilder } from '../../server/lambdas/alfresco/fileRequestBuilder';
import fetch from 'node-fetch';
import { RequestInit } from 'node-fetch';
import { AlfrescoResponse } from '../../server/lambdas/alfresco/fileRequestBuilder/types';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

const postFile = async (options: RequestInit, nodeId: string): Promise<AlfrescoResponse | undefined> => {
  const alfrescoCoreAPIUrl = `${getAlfrescoUrlBase()}/alfresco/versions/1`;
  const url = `${alfrescoCoreAPIUrl}/nodes/${nodeId}/children`;
  const res = await fetch(url, options);
  const result = (await res.json()) as AlfrescoResponse;
  return result;
};

/**
 * Upload custom content for page. Example request: /api/alfresco/file/linjakaaviot
 * @param {FileUploadRequest} event
 * @param {{string}} event.path Path should end with the page to upload the file to
 * @param {{string}} event.body File contents and metadata to upload
 * @returns  {Promise<ALBResult>} JSON stringified object of uploaded file metadata
 */
async function handleRequest(event: any): Promise<ALBResult | undefined> {
  try {
    const paths = event.path.split('/');
    const category = paths.pop();

    const user = await getUser(event);
    log.info(user, `Uploading files for page ${category}`);
    validateReadUser(user);

    if (!category || paths.pop() !== 'file') {
      throw new RataExtraLambdaError('Category missing from path', 400);
    }
    if (isEmpty(event.body)) {
      throw new RataExtraLambdaError('Request body missing', 400);
    }
    if (!fileEndpointsCache.length) {
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }
    const categoryData = findEndpoint(category, fileEndpointsCache);
    if (!categoryData) {
      throw new RataExtraLambdaError('Category not found', 404);
    }

    const hasClassifiedContent = categoryData.hasClassifiedContent;
    if (hasClassifiedContent) {
      throw new RataExtraLambdaError('File cannot be uploaded', 403);
    }

    const writeRole = categoryData.writeRights;
    validateWriteUser(user, writeRole);

    const headers = (await getAlfrescoOptions(user.uid)).headers;
    const requestOptions = (await fileRequestBuilder(event, headers)) as RequestInit;

    const result = await postFile(requestOptions, categoryData.alfrescoFolder);
    auditLog.info(
      user,
      `Uploaded file ${result?.entry.name} with id ${result?.entry.id} to ${categoryData.alfrescoFolder}`,
    );
    return {
      statusCode: 200,
      headers: { 'Content-Type:': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}

const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  handleRequest(req);
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
