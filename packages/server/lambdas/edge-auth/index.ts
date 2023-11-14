import { CloudFrontFunctionsEvent } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';

exports.handler = async (event: CloudFrontFunctionsEvent) => {
  try {
    const request = event.request;
    console.log('Edge function firing on viewer request');
    return request;
  } catch (error) {
    log.error(error);
    return getRataExtraLambdaError(error);
  }
};
