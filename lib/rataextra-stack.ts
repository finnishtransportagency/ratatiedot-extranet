import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { RataExtraEnvironment, getRataExtraStackConfig } from './config';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { BlockPublicAccess, Bucket, BucketAccessControl, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import { Duration, StackProps } from 'aws-cdk-lib';
import { getRemovalPolicy } from './utils';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

interface RataExtraStackProps extends StackProps {
  readonly rataExtraEnv: RataExtraEnvironment;
}

export class RataExtraStack extends cdk.Stack {
  #rataExtraStackIdentifier: string;

  constructor(scope: Construct, stackId: string, props: RataExtraStackProps) {
    super(scope, stackId, props);
    this.#rataExtraStackIdentifier = stackId.toLowerCase();
    const { rataExtraEnv } = props;
    // As demonstration for now
    const {} = getRataExtraStackConfig();

    const applicationVPC = new ec2.Vpc(this, 'rataextra-application-vpc', {
      enableDnsSupport: false,
      vpcName: `vpc-${this.#rataExtraStackIdentifier}-application`,
    });

    // TODO: Bucket creation as a function?
    const frontendBucket = new Bucket(this, `rataextra-frontend-`, {
      bucketName: `s3-${this.#rataExtraStackIdentifier}-frontend`,
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
      comment: `Cloudfront for ${this.#rataExtraStackIdentifier}`,
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket, {
          originAccessIdentity: cloudfrontOAI,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    const lambdaServiceRole = this.createServiceRole(
      'LambdaServiceRole',
      'lambda.amazonaws.com',
      'service-role/AWSLambdaBasicExecutionRole',
    );

    const urlGeneratorFn = this.createDummyLambda({
      rataExtraStackId: this.#rataExtraStackIdentifier,
      name: 'dummy-handler',
      lambdaRole: lambdaServiceRole,
    });

    // ALB for API
    const alb = this.createlAlb({
      rataExtraStackIdentifier: this.#rataExtraStackIdentifier,
      name: 'api',
      vpc: applicationVPC,
      listenerTargets: [urlGeneratorFn],
    });
  }

  private createServiceRole(name: string, servicePrincipal: string, policyName: string) {
    return new Role(this, name, {
      roleName: `${name}-${this.#rataExtraStackIdentifier}`,
      assumedBy: new ServicePrincipal(servicePrincipal),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName(policyName)],
    });
  }

  private createDummyLambda({
    rataExtraStackId,
    name,
    lambdaRole,
  }: {
    name: string;
    rataExtraStackId: string;
    lambdaRole: Role;
  }) {
    return new NodejsFunction(this, name, {
      functionName: `lambda-${rataExtraStackId}-${name}`,
      memorySize: 1024,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_16_X,
      handler: 'handleRequest',
      entry: path.join(__dirname, `../packages/server/lambdas/dummy.ts`),
      environment: {},
      role: lambdaRole,
    });
  }

  private createlAlb({
    rataExtraStackIdentifier,
    name,
    vpc,
    internetFacing = false,
    listenerTargets,
  }: {
    rataExtraStackIdentifier: string;
    name: string;
    vpc: ec2.Vpc;
    listenerTargets: [lambda.Function];
    internetFacing?: boolean;
  }) {
    const alb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(
      this,
      `alb-${rataExtraStackIdentifier}-${name}`,
      {
        vpc,
        internetFacing,
        loadBalancerName: `alb-${rataExtraStackIdentifier}-${name}`,
      },
    );
    const listener = alb.addListener('Listener', {
      port: 443,
    });
    alb.addRedirect();
    const targets = listenerTargets.map((target) => new LambdaTarget(target));
    listener.addTargets('Targets', {
      targets: targets,
      priority: 1,
      conditions: [ListenerCondition.pathPatterns(['/'])],
    });
  }
}
