import { APIGatewayEvent, Context } from 'aws-lambda';
import { DatabaseClient } from './database-client/index.js';

export async function handleRequest(_event: APIGatewayEvent, _context: Context) {
  const database = await DatabaseClient.build();
  await database.user
    .findMany({
      include: {
        posts: true,
        profile: true,
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
      await database.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await database.$disconnect();
    });
}
