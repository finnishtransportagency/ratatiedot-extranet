import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyResult } from 'aws-lambda';

const prisma = new PrismaClient();

export async function handleRequest(): Promise<APIGatewayProxyResult> {
  try {
    const areas = await prisma.area.findMany({
      orderBy: {
        key: 'asc',
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(areas),
    };
  } catch (error) {
    console.error('Error fetching areas:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}
