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
const branch = getEnv('BRANCH'); // TODO: Not always from env? Main as default?
// Used any as otherwise includes isn't allowed
const isPermanentEnvironment = (environment: string) => permanentEnvironments.includes(environment as any);

// Runtime variables from SSM/Parameter Store
// TODO: Configuration file now hardcoded
// TODO: Typing
const getConfig = () => {
  const config = {
    env,
    isPermanentEnvironment,
    branch,
    region: 'eu-west-1',
    authenticationToken: 'github-token',
    tags: {
      Environment: env,
      Project: 'Ratatiedot Extranet',
    },
  };
  return config;
};

export default getConfig;
