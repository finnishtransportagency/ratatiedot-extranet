import { APIGatewayEvent, Context } from 'aws-lambda';
import { DatabaseClient } from './database-client/index.js';

const database = await DatabaseClient.build();

export async function handleRequest(_event: APIGatewayEvent, _context: Context) {
  await database.user
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
      console.log('res: ', response.body);
      return response;
    })
    .catch(async (e) => {
      console.error(e);
    });
}
