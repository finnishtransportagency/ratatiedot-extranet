import { auditLog, log } from '../../utils/logger';
import { getRataExtraLambdaError } from '../../utils/errors';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { AxiosRequestConfig } from 'axios';
import { geoviiteAxios } from '../../utils/axios';
import { getGeoviiteOptions } from '../../utils/geoviite';
import { geoviiteEndpoints } from './geoviiteQueryBuilder';

const validEndpoints: string[] = ['geometria', 'pystygeometria'];

const getGeoviiteLocationTracksGeometry = async (options: AxiosRequestConfig) => {
  const response = await geoviiteAxios(options);
  return response.data;
};

export async function handleRequest(event: ALBEvent): Promise<ALBResult | undefined> {
  try {
    const { queryStringParameters } = event;

    if (!queryStringParameters || !queryStringParameters.oid || !queryStringParameters.endpoint) {
      throw new Error('Missing query parameter');
    }

    if (!validEndpoints.includes(queryStringParameters.endpoint)) {
      throw new Error('Wrong endpoint parameter');
    }

    const headers = (await getGeoviiteOptions({ 'Content-Type': 'application/json;charset=UTF-8' })).headers;
    const options: AxiosRequestConfig = {
      url: `${geoviiteEndpoints.locationtracks}/${queryStringParameters.oid}/${queryStringParameters.endpoint}`,
      method: 'GET',
      headers: { ...headers },
    };
    const result = await getGeoviiteLocationTracksGeometry(options);
    auditLog.info(`fetch from geoviite api`);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (error) {
    log.error(error);
    return getRataExtraLambdaError(error);
  }
}
