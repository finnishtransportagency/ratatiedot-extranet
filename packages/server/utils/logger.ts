import { S3EventRecord } from 'aws-lambda/trigger/s3';

class Logger {
  log = (data: unknown) => {
    const message =
      (typeof data === 'string' && data) || (data instanceof Error && data.message) || JSON.stringify(data);
    try {
      console.log(message);
    } catch (error) {
      console.log(`Logger failed to log a given message: ${error instanceof Error && error.message}`);
    }
  };

  logS3EventRecord = (eventRecord: S3EventRecord) => {
    this.log(`File arn: ${eventRecord.s3.bucket.arn}`);
    this.log(`File object key: ${eventRecord.s3.object.key}`);
    this.log(`File bucket: ${eventRecord.s3.bucket.name}`);
    this.log(`File path: ${eventRecord.s3.object.key.split('/')}`);
  };
}

export const logger = new Logger();
