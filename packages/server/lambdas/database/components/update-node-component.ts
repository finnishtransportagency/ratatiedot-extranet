/* eslint-disable prettier/prettier */
import { DatabaseClient } from '../../database/client';
import { handlePrismaError, PrismaError } from '../error/databaseError';
import { Node } from '@prisma/client';
import { devLog } from '../../../utils/logger';

const database = await DatabaseClient.build();

export const updateFolderComponent = async (componentId: string, body: Partial<Node>) => {
  devLog.debug('body: ' + JSON.stringify(body));
  const updatedData = () => {
    const data: Partial<Node> = {
      type: 'Folder',
    };
    if (body.alfrescoNodeId) {
      data.alfrescoNodeId = body.alfrescoNodeId;
    }
    if (body.title) {
      data.title = body.title;
    }
    return data;
  };

  devLog.debug('data: ' + JSON.stringify(updatedData()));

  let response = null;
  try {
    response = await database.node.update({
      where: {
        categoryComponentId: componentId,
      },
      data: {
        ...updatedData(),
      },
    });
    devLog.debug('updateddata: ' + JSON.stringify(updatedData()));
  } catch (error) {
    handlePrismaError(error as PrismaError);
  }

  return response;
};

export const getAlfrescoId = async (componentId: string) => {
  let response = null;
  devLog.debug('ID: ' + componentId);
  try {
    response = await database.node.findUnique({
      where: {
        categoryComponentId: componentId,
      },
    });
    devLog.debug('response: ' + JSON.stringify(response));
  } catch (error) {
    devLog.debug(error);
    handlePrismaError(error as PrismaError);
  }

  return response?.alfrescoNodeId;
};
