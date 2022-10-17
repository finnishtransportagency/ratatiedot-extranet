import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { RataExtraEnvironment, getRataExtraStackConfig } from './config';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { BlockPublicAccess, Bucket, BucketAccessControl, BucketEncryption, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import { StackProps } from 'aws-cdk-lib';
import { getRemovalPolicy } from './utils';

interface RataExtraStackProps extends StackProps {
  readonly rataExtraEnv: RataExtraEnvironment;
}

export class RataExtraStack extends cdk.Stack {
  #stackId: string;

  constructor(scope: Construct, stackId: string, props: RataExtraStackProps) {
    super(scope, stackId, props);
    this.#stackId = stackId;
    const { rataExtraEnv } = props;
    // As demonstration for now
    const {} = getRataExtraStackConfig();

    const applicationVPC = new ec2.Vpc(this, 'rataextra-application-vpc', {
      enableDnsSupport: false,
      vpcName: `vpc-${this.#stackId}-application`,
    });

    // TODO: Bucket creation as a function?
    const frontendBucket = new Bucket(this, `rataextra-frontend-`, {
      bucketName: `s3-${this.#stackId}-frontend`,
      publicReadAccess: false,
      accessControl: BucketAccessControl.PRIVATE,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: getRemovalPolicy(rataExtraEnv),
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
      // encryption: BucketEncryption.S3_MANAGED,
    });

    const buildDir = '../packages/frontend/build';
    new BucketDeployment(this, 'FrontendDeployment', {
      sources: [Source.asset(path.join(__dirname, buildDir))],
      destinationBucket: frontendBucket,
    });

    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'CloudFrontOriginAccessIdentity');

    frontendBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [frontendBucket.arnForObjects('*')],
        principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      }),
    );

    const cloudfrontDistribution = new cloudfront.Distribution(this, `rataextra-cloudfront`, {
      defaultRootObject: 'index.html',
      comment: `Cloudfront for ${this.#stackId}`,
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket, {
          originAccessIdentity: cloudfrontOAI,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    // ALB for API
    const alb = this.createlAlb({ stackId: this.#stackId, name: 'api', vpc: applicationVPC });
  }
  private createlAlb({
    stackId,
    name,
    vpc,
    internetFacing = false,
    listenerTargets,
  }: {
    stackId: string;
    name: string;
    vpc: ec2.Vpc;
    listenerTargets?: lambda.Function;
    internetFacing?: boolean;
  }) {
    const alb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(this, `alb-${stackId}-${name}`, {
      vpc,
      internetFacing,
      loadBalancerName: `alb-${stackId}-${name}`,
    });
    const listener = alb.addListener('Listener', {
      port: 80,
    });
    alb.addRedirect();
    // TODO: Make not optional
    if (listenerTargets) {
      listener.addTargets('Targets', {
        targets: [new LambdaTarget(listenerTargets)],
      });
    }
  }
}
