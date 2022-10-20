import { NestedStack, StackProps } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import {
  AllowedMethods,
  BehaviorOptions,
  CachePolicy,
  OriginRequestPolicy,
  PriceClass,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { RataExtraEnvironment } from './config';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';

interface CloudFrontStackProps extends StackProps {
  readonly rataExtraStackIdentifier: string;
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly cloudfrontCertificateArn: string;
  readonly cloudfrontDomainName: string;
  readonly dmzApiEndpoint: string;
  readonly frontendBucket: Bucket;
}
export class RataExtraCloudFrontStack extends NestedStack {
  constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id, props);
    const {
      rataExtraEnv,
      rataExtraStackIdentifier,
      dmzApiEndpoint,
      cloudfrontCertificateArn,
      cloudfrontDomainName,
      frontendBucket,
    } = props;
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'CloudFrontOriginAccessIdentity');

    const frontendRelativeBuildDir = '../packages/frontend/build';
    new BucketDeployment(this, 'FrontendDeployment', {
      sources: [Source.asset(path.join(__dirname, frontendRelativeBuildDir))],
      destinationBucket: frontendBucket,
    });
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
      comment: `Cloudfront for ${rataExtraStackIdentifier}`,
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
