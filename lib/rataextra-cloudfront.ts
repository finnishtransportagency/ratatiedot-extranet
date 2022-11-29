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
  PublicKey,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { RataExtraEnvironment } from './config';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';

interface CloudFrontStackProps extends StackProps {
  readonly rataExtraStackIdentifier: string;
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly cloudfrontCertificateArn: string;
  readonly cloudfrontDomainName: string;
  readonly dmzApiEndpoint: string;
  readonly frontendBucket: Bucket;
  readonly cloudfrontSignerPublicKey: string;
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
      cloudfrontSignerPublicKey,
    } = props;
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'CloudFrontOriginAccessIdentity');

    frontendBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [frontendBucket.arnForObjects('*')],
        principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      }),
    );

    const certificate = Certificate.fromCertificateArn(
      this,
      `certificate-${rataExtraStackIdentifier}`,
      cloudfrontCertificateArn,
    );

    const backendProxyBehavior: BehaviorOptions = {
      origin: new origins.HttpOrigin(dmzApiEndpoint),
      cachePolicy: CachePolicy.CACHING_DISABLED,
      originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
      allowedMethods: AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    };

    const frontendSignerPublicKey = new PublicKey(this, 'FrontendPublicKey', { encodedKey: cloudfrontSignerPublicKey });

    const cloudfrontDistribution = new cloudfront.Distribution(this, `rataextra-cloudfront`, {
      domainNames: [cloudfrontDomainName],
      certificate,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      comment: `Cloudfront for ${rataExtraStackIdentifier}`,
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket, {
          originAccessIdentity: cloudfrontOAI,
        }),
        edgeLambdas: [
          {
            functionVersion: new cloudfront.experimental.EdgeFunction(this, 'FrontendCookieCheckFunction', {
              runtime: Runtime.NODEJS_16_X,
              handler: 'index.handler',
              code: Code.fromAsset(path.join(__dirname, '../packages/server/lambdas/frontendCookieCheck.js')),
              environment: { CLOUDFRONT_DOMAIN_NAME: cloudfrontDomainName },
            }),
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          },
        ],
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        trustedKeyGroups: [new cloudfront.KeyGroup(this, 'FrontendKeyGroup', { items: [frontendSignerPublicKey] })],
      },
      additionalBehaviors: {
        '/api*': backendProxyBehavior,
        '/oauth2*': backendProxyBehavior,
      },
    });
    const frontendRelativeBuildDir = '../packages/frontend/build';
    new BucketDeployment(this, 'FrontendDeployment', {
      sources: [Source.asset(path.join(__dirname, frontendRelativeBuildDir))],
      destinationBucket: frontendBucket,
      distribution: cloudfrontDistribution, // Cache invalidation
    });
  }
}
