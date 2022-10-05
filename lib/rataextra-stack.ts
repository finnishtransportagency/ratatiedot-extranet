import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { getRataExtraStackConfig } from './config';

export class RataExtraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    const { config } = getRataExtraStackConfig();
    super(scope, id, props);

    const frontendBucket = new s3.Bucket(this, 'rata-extra-frontend-' + config.env, {
      versioned: true,
      // TODO: Environment aware removal, aka don't remove dev/prod
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }
}
