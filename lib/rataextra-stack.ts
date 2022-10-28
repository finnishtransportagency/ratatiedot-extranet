import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RataExtraEnvironment, getRataExtraStackConfig } from './config';
import { RemovalPolicy, StackProps } from 'aws-cdk-lib';
import { getRemovalPolicy, isPermanentStack, getVpcAttributes } from './utils';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { RataExtraBackendStack } from './rataextra-backend';
import { RataExtraCloudFrontStack } from './rataextra-cloudfront';
import { Bucket, BucketAccessControl, BlockPublicAccess, ObjectOwnership } from 'aws-cdk-lib/aws-s3';

interface RataExtraStackProps extends StackProps {
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly stackId: string;
}

export class RataExtraStack extends cdk.Stack {
  #rataExtraStackIdentifier: string;

  constructor(scope: Construct, id: string, props: RataExtraStackProps) {
    super(scope, id, props);
    this.#rataExtraStackIdentifier = id.toLowerCase();
    const { rataExtraEnv, stackId } = props;
    const { cloudfrontCertificateArn, cloudfrontDomainName, dmzApiEndpoint } = getRataExtraStackConfig(this);

    const vpc = Vpc.fromVpcAttributes(this, 'rataextra-vpc', {
      ...getVpcAttributes(rataExtraEnv),
    });

    const lambdaServiceRole = this.createServiceRole(
      'LambdaServiceRole',
      'lambda.amazonaws.com',
      'service-role/AWSLambdaVPCAccessExecutionRole',
    );
    new RataExtraBackendStack(this, 'stack-backend', {
      rataExtraStackIdentifier: this.#rataExtraStackIdentifier,
      rataExtraEnv: rataExtraEnv,
      lambdaServiceRole: lambdaServiceRole,
      applicationVpc: vpc,
    });

    const removalPolicy = getRemovalPolicy(rataExtraEnv);
    const autoDeleteObjects = removalPolicy === RemovalPolicy.DESTROY;

    // TODO: Bucket creation as a function?
    const frontendBucket = new Bucket(this, `rataextra-frontend-`, {
      bucketName: `s3-${this.#rataExtraStackIdentifier}-frontend`,
      publicReadAccess: false,
      accessControl: BucketAccessControl.PRIVATE,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: removalPolicy,
      autoDeleteObjects: autoDeleteObjects,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
      // encryption: BucketEncryption.S3_MANAGED,
    });

    if (isPermanentStack(stackId, rataExtraEnv)) {
      new RataExtraCloudFrontStack(this, 'stack-cf', {
        rataExtraStackIdentifier: this.#rataExtraStackIdentifier,
        rataExtraEnv: rataExtraEnv,
        cloudfrontCertificateArn: cloudfrontCertificateArn,
        cloudfrontDomainName: cloudfrontDomainName,
        dmzApiEndpoint: dmzApiEndpoint,
        frontendBucket: frontendBucket,
      });
    }
  }
  private createServiceRole(name: string, servicePrincipal: string, policyName: string) {
    return new Role(this, name, {
      roleName: `${name}-${this.#rataExtraStackIdentifier}`,
      assumedBy: new ServicePrincipal(servicePrincipal),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName(policyName)],
    });
  }
}
