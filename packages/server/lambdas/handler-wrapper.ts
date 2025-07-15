import * as Sentry from '@sentry/aws-serverless';
import { Handler } from 'aws-lambda';

if (process.env.NODE_ENV !== 'test') {
  Sentry.init({
    dsn: 'https://992023a881caa64f7a5a41026b4ddf7b@o1193385.ingest.us.sentry.io/4509672722006016',
    environment: process.env.ENVIRONMENT || 'dev',
    tracesSampleRate: 1.0,
  });
}

export const handlerWrapper = <T extends Handler>(handler: T): T => {
  if (process.env.NODE_ENV === 'test') {
    return handler;
  }
  return Sentry.wrapHandler(handler) as T;
};
