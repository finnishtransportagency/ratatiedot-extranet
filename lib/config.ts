import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { getEnvOrFail } from '../utils';
// Inspiration from https://github.com/finnishtransportagency/hassu/blob/main/deployment/lib/config.ts

// Returns token that resolves during deployment to SSM parameter value
const getSSMStringParameter = (scope: Construct, parameterName: string) =>
  ssm.StringParameter.valueForStringParameter(scope, parameterName);

// Returns token that resolves during deployment to SSM parameter value
const getSSMStringListParameter = (scope: Construct, parameterName: string) =>
  ssm.StringListParameter.valueForTypedListParameter(scope, parameterName);

export type RataExtraEnvironment = typeof ENVIRONMENTS[keyof typeof ENVIRONMENTS];

function isRataExtraEnvironment(arg: string): arg is RataExtraEnvironment {
  return !!arg && Object.values(ENVIRONMENTS).includes(arg as any);
}

export const ENVIRONMENTS = {
  dev: 'dev',
  prod: 'prod',
  local: 'local',
} as const;

const PRODUCTION_BRANCH = 'prod';
export const PRODUCTION_STACK_ID = PRODUCTION_BRANCH;
const DEVELOPMENT_MAIN_BRANCH = 'main';
export const DEVELOPMENT_MAIN_STACK_ID = DEVELOPMENT_MAIN_BRANCH;
const SSM_CLOUDFRONT_CERTIFICATE_ARN = 'rataextra-cloudfront-certificate-arn';
const SSM_CLOUDFRONT_DOMAIN_NAME = 'rataextra-cloudfront-domain-name';
const SSM_DMZ_API_DOMAIN_NAME = 'rataextra-dmz-api-domain-name';
const SSM_RATAEXTRA_RDSPG13_RATAEXTRADEV_PASSWORD = 'rataextra-rdspg13-rataextradev-password';
const SSM_DATABASE_DOMAIN = 'rataextra-database-domain';

function getStackId(branch: string): string {
  const stackId = getEnvOrFail('STACK_ID');
  if (branch === DEVELOPMENT_MAIN_BRANCH && stackId !== DEVELOPMENT_MAIN_STACK_ID) {
    throw new Error(`For branch ${DEVELOPMENT_MAIN_BRANCH} stack id must match the branch`);
  }
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
  databasePassword: getSSMStringParameter(scope, SSM_RATAEXTRA_RDSPG13_RATAEXTRADEV_PASSWORD),
  databaseDomain: getSSMStringParameter(scope, SSM_DATABASE_DOMAIN),
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
      tags: {
        Environment: env,
        Project: 'Ratatiedon Extranet',
      },
    };
  }
  throw new Error(`Environment value ${env} for ENVIRONMENT is not valid Raita environment.`);
};
