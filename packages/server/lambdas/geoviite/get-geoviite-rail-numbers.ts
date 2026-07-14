import { auditLog, log } from '../../utils/logger';
import { getRataExtraLambdaError } from '../../utils/errors';
import { ALBResult } from 'aws-lambda';
import { AxiosRequestConfig } from 'axios';
import { geoviiteAxios } from '../../utils/axios';
import { getGeoviiteOptions } from '../../utils/geoviite';
import { geoviiteEndpoints } from './geoviiteQueryBuilder';

const getGeoviiteRailNumbers = async (options: AxiosRequestConfig) => {
  const response = await geoviiteAxios(options);
  return response.data;
};

export async function handleRequest(): Promise<ALBResult | undefined> {
  try {
    const headers = (await getGeoviiteOptions({ 'Content-Type': 'application/json;charset=UTF-8' })).headers;
    const options: AxiosRequestConfig = {
      url: geoviiteEndpoints.trackNumbers,
      method: 'GET',
      headers: { ...headers },
    };
    const result = await getGeoviiteRailNumbers(options);
    auditLog.info(`fetch from geoviite api`);
    return {
      statusCode: 200,
      headers: { 'Content-Type:': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (error) {
    log.error(error);
    return getRataExtraLambdaError(error);
  }
}
