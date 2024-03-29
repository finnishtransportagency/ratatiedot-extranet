import { Construct } from 'constructs';
import { /* StringListParameter */ StringParameter } from 'aws-cdk-lib/aws-ssm';
import { getEnvOrFail } from '../utils';
// Inspiration from https://github.com/finnishtransportagency/hassu/blob/main/deployment/lib/config.ts

// Returns token that resolves during deployment to SSM parameter value
const getSSMStringParameter = (scope: Construct, parameterName: string) =>
  StringParameter.valueForStringParameter(scope, parameterName);

// Returns token that resolves during deployment to SSM parameter value
/* const getSSMStringListParameter = (scope: Construct, parameterName: string) => {
  const parameterList = StringListParameter.valueForTypedListParameter(scope, parameterName);
  return Fn.join(',', parameterList);
}; */

export type RataExtraEnvironment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];

function isRataExtraEnvironment(arg: string): arg is RataExtraEnvironment {
  return !!arg && Object.values(ENVIRONMENTS).includes(arg as RataExtraEnvironment);
}

export const ENVIRONMENTS = {
  dev: 'dev',
  prod: 'prod',
  local: 'local',
  feat: 'feat',
} as const;

const PRODUCTION_BRANCH = 'prod';
export const PRODUCTION_STACK_ID = PRODUCTION_BRANCH;
const DEVELOPMENT_MAIN_BRANCH = 'main';
export const DEVELOPMENT_MAIN_STACK_ID = DEVELOPMENT_MAIN_BRANCH;
const SSM_CLOUDFRONT_CERTIFICATE_ARN = 'rataextra-cloudfront-certificate-arn';
const SSM_CLOUDFRONT_DOMAIN_NAME = 'rataextra-cloudfront-domain-name';
const SSM_DMZ_API_DOMAIN_NAME = 'rataextra-dmz-api-domain-name';
const SSM_JWT_TOKEN_ISSUER = 'rataextra-jwt-token-issuer';
const SSM_JWT_TOKEN_ISSUERS = 'rataextra-jwt-token-issuers';
export const SSM_DATABASE_DOMAIN = 'rataextra-database-domain';
export const SSM_DATABASE_NAME = 'rataextra-database-name';
export const SSM_DATABASE_PASSWORD = 'rataextra-rdspg13-rataextradev-password';
export const SSM_ALFRESCO_API_KEY = 'rataextra-alfresco-api-key';
export const SSM_ALFRESCO_API_URL = 'rataextra-alfresco-api-url';
const SSM_ALFRESCO_DOWNLOAD_URL = 'rataextra-alfresco-download-url';
const SSM_ALFRESCO_API_ANCESTOR = 'rataextra-alfresco-ancestor';
const SSM_MOCK_UID = 'rataextra-static-test-user';
const SSM_ALFRESCO_SITE_PATH = 'rataextra-alfresco-site-path';
const SSM_SONARQUBE_URL = 'rataextra-sonarqube-url';
const SSM_SONARQUBE_TOKEN = 'rataextra-sonarqube-token';
const SSM_SERVICE_USER_UID = 'rataextra-service-user';
const SSM_CLOUDFRONT_SIGNER_PUBLIC_KEY_ID = 'rataextra-cloudfront-signer-public-key-id';
export const SSM_CLOUDFRONT_SIGNER_PRIVATE_KEY = 'rataextra-cloudfront-signer-private-key';

// Minified JS code that is used to make ES modules working
// Also handles __dirname & import.meta.url
export const ESM_REQUIRE_SHIM = `await(async()=>{let{dirname:e}=await import("path"),{fileURLToPath:i}=await import("url");if(typeof globalThis.__filename>"u"&&(globalThis.__filename=i(import.meta.url)),typeof globalThis.__dirname>"u"&&(globalThis.__dirname=e(globalThis.__filename)),typeof globalThis.require>"u"){let{default:a}=await import("module");globalThis.require=a.createRequire(import.meta.url)}})();`;

function getStackId(branch: string): string {
  const stackId = getEnvOrFail('STACK_ID');
  if (branch === PRODUCTION_BRANCH && stackId !== PRODUCTION_STACK_ID) {
    throw new Error(`For branch ${PRODUCTION_BRANCH} stack id must match the branch`);
  }
  return stackId;
}

// Empty example for now
export const getRataExtraStackConfig = (scope: Construct) => ({
  cloudfrontCertificateArn: getSSMStringParameter(scope, SSM_CLOUDFRONT_CERTIFICATE_ARN),
  cloudfrontDomainName: getSSMStringParameter(scope, SSM_CLOUDFRONT_DOMAIN_NAME),
  dmzApiEndpoint: getSSMStringParameter(scope, SSM_DMZ_API_DOMAIN_NAME),
  databaseDomain: getSSMStringParameter(scope, SSM_DATABASE_DOMAIN),
  jwtTokenIssuer: getSSMStringParameter(scope, SSM_JWT_TOKEN_ISSUER),
  jwtTokenIssuers: getSSMStringParameter(scope, SSM_JWT_TOKEN_ISSUERS),
  alfrescoApiUrl: getSSMStringParameter(scope, SSM_ALFRESCO_API_URL),
  alfrescoAPIKey: SSM_ALFRESCO_API_KEY,
  alfrescoDownloadUrl: getSSMStringParameter(scope, SSM_ALFRESCO_DOWNLOAD_URL),
  alfrescoAncestor: getSSMStringParameter(scope, SSM_ALFRESCO_API_ANCESTOR),
  mockUid: getSSMStringParameter(scope, SSM_MOCK_UID),
  alfrescoSitePath: getSSMStringParameter(scope, SSM_ALFRESCO_SITE_PATH),
  sonarQubeUrl: getSSMStringParameter(scope, SSM_SONARQUBE_URL),
  serviceUserUid: getSSMStringParameter(scope, SSM_SERVICE_USER_UID),
  cloudfrontSignerPublicKeyId: getSSMStringParameter(scope, SSM_CLOUDFRONT_SIGNER_PUBLIC_KEY_ID),
});

// Runtime variables from SSM/Parameter Store
export const getPipelineConfig = () => {
  const env = getEnvOrFail('ENVIRONMENT');
  if (isRataExtraEnvironment(env)) {
    const branch = env === ENVIRONMENTS.prod ? PRODUCTION_BRANCH : getEnvOrFail('BRANCH');
    return {
      env,
      branch,
      stackId: getStackId(branch),
      authenticationToken: 'github-token',
      sonarQubeToken: SSM_SONARQUBE_TOKEN,
      tags: {
        Environment: env,
        Project: 'Ratatiedon Extranet',
      },
    };
  }
  throw new Error(`Environment value ${env} for ENVIRONMENT is not valid Raita environment.`);
};
