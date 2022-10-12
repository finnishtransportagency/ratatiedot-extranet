import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { getRataExtraStackConfig } from './config';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';

declare const vpc: ec2.Vpc;

export class RataExtraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    const { config } = getRataExtraStackConfig();
    super(scope, id, props);
    const frontendBucket = new Bucket(this, 'rataextra-frontend-' + config.env, {
      versioned: true,
      // TODO: Environment aware removal, aka don't remove in dev/prod
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    const dir = '../packages/frontend/build';
    new BucketDeployment(this, 'FrontendDeployment', {
      sources: [Source.asset(path.join(__dirname, dir))],
      destinationBucket: frontendBucket,
    });
    // const alb = this.createlAlb({ internetFacing: true });
    // frontendBucket.grantRead(alb);
  }
  private createlAlb({
    internetFacing,
    listenerTargets,
  }: {
    listenerTargets?: lambda.Function;
    internetFacing?: boolean;
  }) {
    const alb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing,
    });
    const listener = alb.addListener('Listener', {
      port: 80,
    });
    // TODO: Make not optional
    if (listenerTargets) {
      listener.addTargets('Targets', {
        targets: [new LambdaTarget(listenerTargets)],
      });
    }
  }
}
