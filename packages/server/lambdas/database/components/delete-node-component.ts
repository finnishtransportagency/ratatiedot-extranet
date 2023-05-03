import { DatabaseClient } from '../../database/client';
import { handlePrismaError, PrismaError } from '../error/databaseError';

const database = await DatabaseClient.build();

export const deleteComponent = async (componentId: string) => {
  let response = null;
  try {
    response = await database.categoryComponent.delete({
      where: {
        id: componentId,
      },
    });
  } catch (error) {
    handlePrismaError(error as PrismaError);
    response = error;
  }

  return response;
};
