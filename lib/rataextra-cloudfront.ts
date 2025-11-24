import { Duration, NestedStack, StackProps } from 'aws-cdk-lib';
import {
  Function,
  OriginAccessIdentity,
  Distribution,
  FunctionCode,
  FunctionEventType,
  CachedMethods,
  KeyGroup,
  PublicKey,
  OriginRequestHeaderBehavior,
  OriginRequestCookieBehavior,
  OriginRequestQueryStringBehavior,
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
  readonly cloudfrontSignerPublicKeyId: string;
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
      cloudfrontSignerPublicKeyId,
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

    const cloudfrontSignerPublicKey = PublicKey.fromPublicKeyId(
      this,
      'rataextra-cloudfront-public-key-id',
      cloudfrontSignerPublicKeyId,
    );

    const keyGroup = new KeyGroup(this, 'rataextra-cloudfront-key-group', {
      items: [cloudfrontSignerPublicKey],
    });

    const certificate = Certificate.fromCertificateArn(
      this,
      `certificate-${rataExtraStackIdentifier}`,
      cloudfrontCertificateArn,
    );

    const trueClientIp = new OriginRequestPolicy(this, 'TrueClientIp', {
      originRequestPolicyName: 'TrueClientIp',
      comment: 'Include true client ip in origin requests',
      headerBehavior: OriginRequestHeaderBehavior.allowList('CloudFront-Viewer-Address'),
      cookieBehavior: OriginRequestCookieBehavior.none(),
      queryStringBehavior: OriginRequestQueryStringBehavior.none(),
    });

    const allViewerAndtrueClientIp = new OriginRequestPolicy(this, 'AllViewerAndtrueClientIp', {
      originRequestPolicyName: 'AllViewerAndtrueClientIp',
      comment: 'Include true client ip and all viewer headers in origin requests',
      headerBehavior: OriginRequestHeaderBehavior.all('CloudFront-Viewer-Address'),
      cookieBehavior: OriginRequestCookieBehavior.all(),
      queryStringBehavior: OriginRequestQueryStringBehavior.all(),
    });

    const clientIpCFFunction = new Function(this, 'ClientIpCFFunction', {
      code: FunctionCode.fromFile({
        filePath: join(__dirname, '../packages/server/cloudfront/trueClientIp.js'),
      }),
    });

    const backendProxyBehavior: BehaviorOptions = {
      origin: new HttpOrigin(dmzApiEndpoint, { readTimeout: Duration.seconds(60) }),
      cachePolicy: CachePolicy.CACHING_DISABLED,
      originRequestPolicy: allViewerAndtrueClientIp,
      allowedMethods: AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      functionAssociations: [
        {
          function: clientIpCFFunction,
          eventType: FunctionEventType.VIEWER_REQUEST,
        },
      ],
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
        originRequestPolicy: trueClientIp,
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
        '/jwtclaims': backendProxyBehavior, // Test EntraID
        '/images*': {
          origin: new S3Origin(imageBucket, { originAccessIdentity: cloudfrontOAI }),
          originRequestPolicy: trueClientIp,
          cachePolicy: CachePolicy.CACHING_OPTIMIZED,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          trustedKeyGroups: [keyGroup],
          functionAssociations: [
            {
              function: clientIpCFFunction,
              eventType: FunctionEventType.VIEWER_REQUEST,
            },
          ],
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
