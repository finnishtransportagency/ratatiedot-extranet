import { APIGatewayEvent, Context } from 'aws-lambda';
import { DatabaseClient } from './database-client/index.js';

const database = await DatabaseClient.build();

export async function handleRequest(_event: APIGatewayEvent, _context: Context) {
  await database.user
    .findMany({ take: 10 })
    .then((res) => {
      const response = {
        statusCode: 200,
        headers: {
          my_header: 'my_value',
        },
        body: JSON.stringify(res),
        isBase64Encoded: false,
      };
      console.log('USERS: ', response.body);
      return response;
    })
    .catch(async (e) => {
      console.error(e);
    });
}
