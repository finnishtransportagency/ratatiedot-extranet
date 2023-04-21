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
    if (body.title) {
      data.title = body.title;
    }
    if (body.alfrescoNodeId) {
      data.alfrescoNodeId = body.alfrescoNodeId;
    }
    return data;
  };

  const asd = updatedData();
  console.log('DATAasd -->>', asd);
  console.log('componentID -->>', componentId);

  let response = null;
  try {
    response = await database.categoryComponent.update({
      where: {
        id: componentId,
      },
      data: {
        node: {
          ...updatedData,
        },
      },
    });
  } catch (error) {
    handlePrismaError(error as PrismaError);
  }

  console.log(response);

  return response;
};
