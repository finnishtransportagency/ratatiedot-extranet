import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { RataExtraEnvironment, getRataExtraStackConfig } from './config';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import { StackProps } from 'aws-cdk-lib';

declare const vpc: ec2.Vpc;

interface RataExtraStackProps extends StackProps {
  readonly rataExtraEnv: RataExtraEnvironment;
}

export class RataExtraStack extends cdk.Stack {
  #stackId: string;

  constructor(scope: Construct, stackId: string, props: RataExtraStackProps) {
    super(scope, stackId, props);
    // As demonstration for now
    const {} = getRataExtraStackConfig();
    this.#stackId = stackId;
    // TODO: Bucket creation as a function
    const frontendBucket = new Bucket(this, `s3-${this.#stackId}-rataextra-frontend-`, {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    const buildDir = '../packages/frontend/build';
    new BucketDeployment(this, 'FrontendDeployment', {
      sources: [Source.asset(path.join(__dirname, buildDir))],
      destinationBucket: frontendBucket,
    });
    // const alb = this.createlAlb({ internetFacing: false });
  }
  private createlAlb({
    stackId,
    name,
    internetFacing,
    listenerTargets,
  }: {
    stackId: string;
    name: string;
    listenerTargets?: lambda.Function;
    internetFacing?: boolean;
  }) {
    const alb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(this, `alb-${stackId}-${name}`, {
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
