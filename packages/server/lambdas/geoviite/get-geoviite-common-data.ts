import { auditLog, log } from '../../utils/logger';
import { getRataExtraLambdaError } from '../../utils/errors';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { AxiosRequestConfig } from 'axios';
import { geoviiteAxios } from '../../utils/axios';
import { getGeoviiteOptions } from '../../utils/geoviite';
import { GeoViiteEndpointProps, geoviiteEndpoints } from './geoviiteQueryBuilder';

const getGeoviiteCommonData = async (options: AxiosRequestConfig) => {
  const response = await geoviiteAxios(options);
  auditLog.info(`axios response: ${response.status}, ${response.headers['content-type']}`);
  return response.data;
};

export async function handleRequest(event: ALBEvent): Promise<ALBResult | undefined> {
  try {
    const { queryStringParameters } = event;

    if (!queryStringParameters || !queryStringParameters.endpoint) {
      throw new Error('Missing query endpoint parameter');
    }
    if (!(queryStringParameters.endpoint in geoviiteEndpoints)) {
      throw new Error('Unrecognized query endpoint parameter');
    }

    const headers = (await getGeoviiteOptions({ 'Content-Type': 'application/json;charset=UTF-8' })).headers;
    const options: AxiosRequestConfig = {
      url: geoviiteEndpoints[queryStringParameters.endpoint as keyof GeoViiteEndpointProps],
      method: 'GET',
      headers: { ...headers },
    };
    const result = await getGeoviiteCommonData(options);
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
