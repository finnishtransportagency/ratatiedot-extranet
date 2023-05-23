/* eslint-disable prettier/prettier */
import { DatabaseClient } from '../../database/client';
import { handlePrismaError, PrismaError } from '../error/databaseError';
import { Node } from '@prisma/client';

const database = await DatabaseClient.build();

export const updateFolderComponent = async (componentId: string, body: Partial<Node>) => {
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
  } catch (error) {
    handlePrismaError(error as PrismaError);
  }

  return response;
};

export const getAlfrescoId = async (componentId: string) => {
  let response = null;
  try {
    response = await database.node.findUnique({
      where: {
        categoryComponentId: componentId,
      },
    });
  } catch (error) {
    handlePrismaError(error as PrismaError);
  }

  return response?.alfrescoNodeId;
};
