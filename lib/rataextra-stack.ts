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
import { RemovalPolicy, StackProps } from 'aws-cdk-lib';
import { getRemovalPolicy, isPermanentStack } from './utils';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { SubnetType } from 'aws-cdk-lib/aws-ec2';
import { RataExtraBackendStack } from './rataextra-backend';
import {
  AllowedMethods,
  BehaviorOptions,
  CachePolicy,
  OriginRequestPolicy,
  PriceClass,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

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
    const { cloudfrontCertificateArn, cloudfrontDomainName, dmzApiEndpoint } = getRataExtraStackConfig(this);

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

    const removalPolicy = getRemovalPolicy(rataExtraEnv);
    const autoDeleteObjects = removalPolicy === RemovalPolicy.DESTROY;
    // TODO: Bucket creation as a function?
    const frontendBucket = new Bucket(this, `rataextra-frontend-`, {
      bucketName: `s3-${this.#rataExtraStackIdentifier}-frontend`,
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      accessControl: BucketAccessControl.PRIVATE,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: removalPolicy,
      autoDeleteObjects: autoDeleteObjects,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
      // encryption: BucketEncryption.S3_MANAGED,
    });

    const frontendRelativeBuildDir = '../packages/frontend/build';
    new BucketDeployment(this, 'FrontendDeployment', {
      sources: [Source.asset(path.join(__dirname, frontendRelativeBuildDir))],
      destinationBucket: frontendBucket,
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

    //CloudFront related resources
    // TODO: Move to own nested stack
    // Downside is that CloudFront would be remade which would require DNS Record update
    // One option would be to transfer it, but that would require some extra work
    if (isPermanentStack(stackId, rataExtraEnv)) {
      const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'CloudFrontOriginAccessIdentity');

      frontendBucket.addToResourcePolicy(
        new iam.PolicyStatement({
          actions: ['s3:GetObject'],
          resources: [frontendBucket.arnForObjects('*')],
          principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
        }),
      );

      // const certificate = Certificate.fromCertificateArn(
      //   this,
      //   `certificate-${this.#rataExtraStackIdentifier}`,
      //   cloudfrontCertificateArn,
      // );

      const backendProxyBehavior: BehaviorOptions = {
        origin: new origins.HttpOrigin(dmzApiEndpoint),
        cachePolicy: CachePolicy.CACHING_DISABLED,
        originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      };
      const cloudfrontDistribution = new cloudfront.Distribution(this, `rataextra-cloudfront`, {
        // domainNames: [cloudfrontDomainName],
        // certificate,
        defaultRootObject: 'index.html',
        comment: `Cloudfront for ${this.#rataExtraStackIdentifier}`,
        priceClass: PriceClass.PRICE_CLASS_100,
        defaultBehavior: {
          origin: new origins.S3Origin(frontendBucket, {
            originAccessIdentity: cloudfrontOAI,
          }),
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        additionalBehaviors: {
          '/api': backendProxyBehavior,
        },
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
