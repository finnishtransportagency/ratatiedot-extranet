// Inspiration from https://github.com/finnishtransportagency/hassu/blob/main/deployment/lib/config.ts

export function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(name + '-environment variable has not been set');
  }
  return value;
}

const permanentEnvironments = ['dev', 'prod'] as const;

const env = getEnv('ENVIRONMENT');
const branch = getEnv('BRANCH');
// Used any as otherwise includes isn't allowed
const isPermanentEnvironment = (environment: string) => permanentEnvironments.includes(environment as any);

// Runtime variables from SSM/Parameter Store
const baseConfig = {
  env,
  isPermanentEnvironment,
  region: 'eu-west-1',
  tags: {
    Environment: env,
    Project: 'Ratatiedot Extranet',
  },
};

export const getRataExtraStackConfig = () => ({
  config: {
    ...baseConfig,
  },
});

export const getPipelineConfig = () => ({
  config: {
    ...baseConfig,
    branch,
    repoConnectionName: 'rata-extra-github-connection',
    // TODO: Remove once changed to connection
    authenticationToken: 'github-token',
  },
});
