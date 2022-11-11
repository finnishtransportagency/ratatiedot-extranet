import { APIGatewayEvent, Context } from 'aws-lambda';
import prisma from './database-client';

export async function handleRequest(_event: APIGatewayEvent, _context: Context) {
  // ... you will write your Prisma Client queries here

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
    .then((res) => {
      const response = {
        statusCode: 200,
        headers: {
          my_header: 'my_value',
        },
        body: JSON.stringify(res),
        isBase64Encoded: false,
      };
      return response;
    })
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
    });
}
