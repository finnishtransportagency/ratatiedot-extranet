import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RataExtraEnvironment, getRataExtraStackConfig } from './config';
import { RemovalPolicy, StackProps, Tags } from 'aws-cdk-lib';
import { getRemovalPolicy, isPermanentStack, getVpcAttributes, getSecurityGroupId } from './utils';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { RataExtraBackendStack } from './rataextra-backend';
import { RataExtraCloudFrontStack } from './rataextra-cloudfront';
import { Bucket, BucketAccessControl, BlockPublicAccess, ObjectOwnership, BucketEncryption } from 'aws-cdk-lib/aws-s3';

interface RataExtraStackProps extends StackProps {
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly stackId: string;
  readonly tags: { [key: string]: string };
}

export class RataExtraStack extends Stack {
  #rataExtraStackIdentifier: string;

  constructor(scope: Construct, id: string, props: RataExtraStackProps) {
    super(scope, id, props);
    this.#rataExtraStackIdentifier = id.toLowerCase();
    const { rataExtraEnv, stackId, tags } = props;
    const {
      cloudfrontCertificateArn,
      cloudfrontDomainName,
      dmzApiEndpoint,
      databaseDomain,
      jwtTokenIssuer,
      alfrescoAPIKey,
      alfrescoApiUrl,
      alfrescoAncestor,
      mockUid,
      alfrescoSitePath,
    } = getRataExtraStackConfig(this);

    const vpc = Vpc.fromVpcAttributes(this, 'rataextra-vpc', {
      ...getVpcAttributes(stackId, rataExtraEnv),
    });

    // TODO: Fix import
    const securityGroup = SecurityGroup.fromSecurityGroupId(
      this,
      'rataextra-security-group',
      getSecurityGroupId(stackId, rataExtraEnv),
    );

    const lambdaServiceRole = this.createServiceRole(
      'LambdaServiceRole',
      'lambda.amazonaws.com',
      'service-role/AWSLambdaVPCAccessExecutionRole',
    );
    const backendStack = new RataExtraBackendStack(this, 'stack-backend', {
      rataExtraStackIdentifier: this.#rataExtraStackIdentifier,
      rataExtraEnv: rataExtraEnv,
      stackId: stackId,
      lambdaServiceRole: lambdaServiceRole,
      applicationVpc: vpc,
      securityGroup,
      databaseDomain,
      cloudfrontDomainName: cloudfrontDomainName,
      jwtTokenIssuer,
      tags: tags,
      alfrescoAPIKey: alfrescoAPIKey,
      alfrescoAPIUrl: alfrescoApiUrl,
      alfrescoAncestor,
      mockUid: mockUid,
      alfrescoSitePath: alfrescoSitePath,
    });
    Object.entries(props.tags).forEach(([key, value]) => Tags.of(backendStack).add(key, value));

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
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    });

    if (isPermanentStack(stackId, rataExtraEnv)) {
      const cloudFrontStack = new RataExtraCloudFrontStack(this, 'stack-cf', {
        rataExtraStackIdentifier: this.#rataExtraStackIdentifier,
        rataExtraEnv: rataExtraEnv,
        cloudfrontCertificateArn: cloudfrontCertificateArn,
        cloudfrontDomainName: cloudfrontDomainName,
        dmzApiEndpoint: dmzApiEndpoint,
        frontendBucket: frontendBucket,
      });
      Object.entries(props.tags).forEach(([key, value]) => Tags.of(cloudFrontStack).add(key, value));
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
