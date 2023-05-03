import { DatabaseClient } from '../../database/client';
import { handlePrismaError, PrismaError } from '../error/databaseError';

const database = await DatabaseClient.build();

export const getComponents = async (categoryId: string) => {
  let result = null;
  try {
    result = await database.categoryDataBase.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        categoryComponents: {
          include: {
            node: true,
          },
        },
      },
    });
    result = result?.categoryComponents;
  } catch (error) {
    handlePrismaError(error as PrismaError);
    result = error;
  }
  return result;
};
