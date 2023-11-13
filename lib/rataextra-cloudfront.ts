import { Duration, NestedStack, StackProps } from 'aws-cdk-lib';
import {
  Function,
  OriginAccessIdentity,
  Distribution,
  FunctionCode,
  FunctionEventType,
  CachedMethods,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin, S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { PolicyStatement, CanonicalUserPrincipal } from 'aws-cdk-lib/aws-iam';
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
import { join } from 'path';

interface CloudFrontStackProps extends StackProps {
  readonly rataExtraStackIdentifier: string;
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly cloudfrontCertificateArn: string;
  readonly cloudfrontDomainName: string;
  readonly dmzApiEndpoint: string;
  readonly frontendBucket: Bucket;
  readonly imageBucket: Bucket;
}
export class RataExtraCloudFrontStack extends NestedStack {
  constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id, props);
    const {
      rataExtraStackIdentifier,
      dmzApiEndpoint,
      cloudfrontCertificateArn,
      cloudfrontDomainName,
      frontendBucket,
      imageBucket,
    } = props;
    const cloudfrontOAI = new OriginAccessIdentity(this, 'CloudFrontOriginAccessIdentity');

    frontendBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [frontendBucket.arnForObjects('*')],
        principals: [new CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      }),
    );

    imageBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [imageBucket.arnForObjects('*')],
        principals: [new CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      }),
    );

    const certificate = Certificate.fromCertificateArn(
      this,
      `certificate-${rataExtraStackIdentifier}`,
      cloudfrontCertificateArn,
    );

    const backendProxyBehavior: BehaviorOptions = {
      origin: new HttpOrigin(dmzApiEndpoint, { readTimeout: Duration.seconds(60) }),
      cachePolicy: CachePolicy.CACHING_DISABLED,
      originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
      allowedMethods: AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    };

    const cloudfrontDistribution = new Distribution(this, `rataextra-cloudfront`, {
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
      enableLogging: true,
      defaultBehavior: {
        origin: new S3Origin(frontendBucket, {
          originAccessIdentity: cloudfrontOAI,
        }),
        functionAssociations: [
          {
            function: new Function(this, 'FrontendRedirectCFFunction', {
              code: FunctionCode.fromFile({
                filePath: join(__dirname, '../packages/server/cloudfront/frontendRedirect.js'),
              }),
            }),
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ],
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS,
      },
      additionalBehaviors: {
        '/api*': backendProxyBehavior,
        '/oauth2*': backendProxyBehavior,
        '/sso*': backendProxyBehavior,
        '/images*': {
          origin: new S3Origin(imageBucket),
          cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        },
      },
    });

    const frontendRelativeBuildDir = '../packages/frontend/build';
    new BucketDeployment(this, 'FrontendDeployment', {
      sources: [Source.asset(join(__dirname, frontendRelativeBuildDir))],
      destinationBucket: frontendBucket,
      distribution: cloudfrontDistribution, // Cache invalidation
    });
  }
}
