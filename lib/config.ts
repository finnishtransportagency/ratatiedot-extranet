import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { Construct } from 'constructs';
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
import {
  PRODUCTION_BRANCH,
  DEVELOPMENT_MAIN_BRANCH,
  SSM_CLOUDFRONT_CERTIFICATE_ARN,
  SSM_CLOUDFRONT_DOMAIN_NAME,
  SSM_DMZ_API_DOMAIN_NAME,
  SSM_JWT_TOKEN_ISSUER,
  SSM_JWT_TOKEN_ISSUERS,
  SSM_ALFRESCO_DOWNLOAD_URL,
  SSM_ALFRESCO_API_ANCESTOR,
  SSM_MOCK_UID,
  SSM_ALFRESCO_SITE_PATH,
  SSM_SONARQUBE_URL,
  SSM_SONARQUBE_TOKEN,
  SSM_SERVICE_USER_UID,
  SSM_CLOUDFRONT_SIGNER_PUBLIC_KEY_ID,
  SSM_DATABASE_DOMAIN,
  SSM_ALFRESCO_API_KEY,
  SSM_ALFRESCO_API_URL,
} from './constants';

export const PRODUCTION_STACK_ID = PRODUCTION_BRANCH;
export const DEVELOPMENT_MAIN_STACK_ID = DEVELOPMENT_MAIN_BRANCH;

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
