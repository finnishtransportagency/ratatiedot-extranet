import { DatabaseClient } from '../../database/client';
import { handlePrismaError, PrismaError } from '../error/databaseError';

const database = await DatabaseClient.build();

export const getComponents = async (categoryId: string) => {
  let response = null;
  try {
    response = await database.categoryDataBase.findFirst({
      where: {
        id: categoryId,
      },
    });
  } catch (error) {
    handlePrismaError(error as PrismaError);
    response = error;
  }

  return response;
};
