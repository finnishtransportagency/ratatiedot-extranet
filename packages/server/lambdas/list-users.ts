import { APIGatewayEvent, Context } from 'aws-lambda';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function handleRequest(_event: APIGatewayEvent, _context: Context) {
  // ... you will write your Prisma Client queries here
  await prisma.user
    .findMany({
      include: {
        posts: true,
        profile: true,
      },
    })
    .then((res) => {
      console.log(res);
    })
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
    });
}
