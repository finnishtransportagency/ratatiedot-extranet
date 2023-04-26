/* eslint-disable prettier/prettier */
import { DatabaseClient } from '../../database/client';
import { handlePrismaError, PrismaError } from '../error/databaseError';
import { Node } from '@prisma/client';
import { devLog } from '../../../utils/logger';

const database = await DatabaseClient.build();

export const updateFolderComponent = async (componentId: string, body: Partial<Node>) => {
  const updatedData = () => {
    const data: Partial<Node> = {
      type: 'Folder',
    };
    if (body.alfrescoNodeId) {
      data.alfrescoNodeId = body.alfrescoNodeId;
    }
    return data;
  };

  const asd = updatedData();
  devLog.debug('DATAasd -->>\n' + JSON.stringify(asd, null, 2));
  devLog.debug('componentID -->>\n' + componentId);

  let response = null;
  try {
    response = await database.node.update({
      where: {
        id: componentId,
      },
      data: {
        ...updatedData,
      },
    });
  } catch (error) {
    handlePrismaError(error as PrismaError);
  }

  devLog.debug('response: \n' + JSON.stringify(response, null, 2));

  return response;
};

export const getAlfrescoId = async (componentId: string) => {
  let response = null;
  try {
    response = await database.node.findUnique({
      where: {
        id: componentId,
      },
    });
  } catch (error) {
    handlePrismaError(error as PrismaError);
  }

  devLog.debug('response: \n' + JSON.stringify(response, null, 2));
  return response?.alfrescoNodeId;
};
