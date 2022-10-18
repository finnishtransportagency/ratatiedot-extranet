import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { RataExtraEnvironment, getRataExtraStackConfig } from './config';
import { BlockPublicAccess, Bucket, BucketAccessControl, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import { StackProps } from 'aws-cdk-lib';
import { getRemovalPolicy } from './utils';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { SubnetType } from 'aws-cdk-lib/aws-ec2';
import { RataExtraBackendStack } from './rataextra-backend';

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

    const privateApplicationVpc = new ec2.Vpc(this, 'rataextra-application-vpc', {
      vpcName: `vpc-${this.#rataExtraStackIdentifier}-application`,
      enableDnsSupport: false,
      enableDnsHostnames: false,
      subnetConfiguration: [
        {
          name: 'PrivateApplicationSubnet',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
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
    new RataExtraBackendStack(this, 'stack-backend', {
      rataExtraStackIdentifier: this.#rataExtraStackIdentifier,
      rataExtraEnv: rataExtraEnv,
      lambdaServiceRole: lambdaServiceRole,
      applicationVpc: privateApplicationVpc,
    });
  }
  private createServiceRole(name: string, servicePrincipal: string, policyName: string) {
    return new Role(this, name, {
      roleName: `${name}-${this.#rataExtraStackIdentifier}`,
      assumedBy: new ServicePrincipal(servicePrincipal),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName(policyName)],
    });
  }
}
