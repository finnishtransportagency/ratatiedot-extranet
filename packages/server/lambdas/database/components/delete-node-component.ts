import { DatabaseClient } from '../../database/client';
import { handlePrismaError, PrismaError } from '../error/databaseError';

const database = await DatabaseClient.build();

export const deleteComponent = async (alfrescoId: string) => {
  let response = null;
  try {
    const node = await database.node.findFirst({
      where: {
        alfrescoNodeId: alfrescoId,
      },
    });

    if (!node) {
      return;
    }

    response = await database.node.delete({
      where: {
        categoryComponentId: node?.categoryComponentId,
      },
    });

    response = await database.categoryComponent.delete({
      where: {
        id: node?.categoryComponentId,
      },
    });
  } catch (error) {
    handlePrismaError(error as PrismaError);
    response = error;
  }

  return response;
};
