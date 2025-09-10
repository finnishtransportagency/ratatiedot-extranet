import * as Sentry from '@sentry/aws-serverless';
import { Handler } from 'aws-lambda';
import { ENVIRONMENTS } from '../../../lib/config';

if (process.env.ENVIRONMENT !== ENVIRONMENTS.local) {
  Sentry.init({
    dsn: 'https://992023a881caa64f7a5a41026b4ddf7b@o1193385.ingest.us.sentry.io/4509672722006016',
    environment: process.env.ENVIRONMENT || 'dev',
    tracesSampleRate: process.env.ENVIRONMENT == ENVIRONMENTS.prod ? 0.1 : 1.0,
  });
}

export const handlerWrapper = <T extends Handler>(handler: T): T => {
  if (process.env.ENVIRONMENT === ENVIRONMENTS.local) {
    return handler;
  }
  return Sentry.wrapHandler(handler) as T;
};
