// Do not add any imports here, otherwise esbuild will bundle all that code to lambdas
export const ENVIRONMENTS = {
  dev: 'dev',
  prod: 'prod',
  local: 'local',
  feat: 'feat',
} as const;

export const PRODUCTION_BRANCH = 'prod';
export const PRODUCTION_STACK_ID = PRODUCTION_BRANCH;
export const DEVELOPMENT_MAIN_BRANCH = 'main';
export const DEVELOPMENT_MAIN_STACK_ID = DEVELOPMENT_MAIN_BRANCH;
export const SSM_CLOUDFRONT_CERTIFICATE_ARN = 'rataextra-cloudfront-certificate-arn';
export const SSM_CLOUDFRONT_DOMAIN_NAME = 'rataextra-cloudfront-domain-name';
export const SSM_DMZ_API_DOMAIN_NAME = 'rataextra-dmz-api-domain-name';
export const SSM_JWT_TOKEN_ISSUER = 'rataextra-jwt-token-issuer';
export const SSM_JWT_TOKEN_ISSUERS = 'rataextra-jwt-token-issuers';
export const SSM_DATABASE_DOMAIN = 'rataextra-database-domain';
export const SSM_DATABASE_NAME = 'rataextra-database-name';
export const SSM_DATABASE_PASSWORD = 'rataextra-rdspg13-rataextradev-password';
export const SSM_ALFRESCO_API_KEY = 'rataextra-alfresco-api-key';
export const SSM_ALFRESCO_API_URL = 'rataextra-alfresco-api-url';
export const SSM_ALFRESCO_DOWNLOAD_URL = 'rataextra-alfresco-download-url';
export const SSM_ALFRESCO_API_ANCESTOR = 'rataextra-alfresco-ancestor';
export const SSM_MOCK_UID = 'rataextra-static-test-user';
export const SSM_ALFRESCO_SITE_PATH = 'rataextra-alfresco-site-path';
export const SSM_SONARQUBE_URL = 'rataextra-sonarqube-url';
export const SSM_SONARQUBE_TOKEN = 'rataextra-sonarqube-token';
export const SSM_SERVICE_USER_UID = 'rataextra-service-user';
export const SSM_CLOUDFRONT_SIGNER_PUBLIC_KEY_ID = 'rataextra-cloudfront-signer-public-key-id';
export const SSM_CLOUDFRONT_SIGNER_PRIVATE_KEY = 'rataextra-cloudfront-signer-private-key';
