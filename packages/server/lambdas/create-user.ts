import { APIGatewayEvent, Context } from 'aws-lambda';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function handleRequest(_event: APIGatewayEvent, _context: Context) {
  // ... you will write your Prisma Client queries here
  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
      profile: true,
    },
  });

  await prisma.user
    .create({
      data: {
        name: 'Alice',
        email: Date.now() + '@email.com',
        posts: {
          create: { title: 'Hello World' },
        },
        profile: {
          create: { bio: 'I like turtles' },
        },
      },
    })
    .then(async (res) => {
      console.log(res);
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
    });
}
