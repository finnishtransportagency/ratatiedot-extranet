import { DatabaseClient } from '../../database/client';
import { handlePrismaError, PrismaError } from '../error/databaseError';

const database = await DatabaseClient.build();

export const deleteComponent = async (alfrescoId: string) => {
  let response = null;
  try {
    const component = await database.categoryComponent.findFirst({
      where: {
        node: {
          alfrescoNodeId: alfrescoId,
        },
      },
    });

    if (!component) {
      return;
    }

    response = await database.categoryComponent.delete({
      where: {
        id: component?.id,
      },
    });
  } catch (error) {
    handlePrismaError(error as PrismaError);
    response = error;
  }

  return response;
};
