import { Prisma } from '@prisma/client';
import { RataExtraLambdaError } from '../../../utils/errors';

export type PrismaError = Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientUnknownRequestError;

export const handlePrismaError = (error: PrismaError) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    throw new RataExtraLambdaError(
      `Prisma error: \n${error.message} \nhttps://www.prisma.io/docs/reference/api-reference/error-reference#${error.code}`,
      500,
    );
  }
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    throw new RataExtraLambdaError(`Unknown Prisma client error \n${error.message}`, 500);
  }

  throw new RataExtraLambdaError(`Unknown error`, 500);
};
