import { getEnvOrFail } from '../utils';
// Inspiration from https://github.com/finnishtransportagency/hassu/blob/main/deployment/lib/config.ts

export type RataExtraEnvironment = typeof environments[keyof typeof environments];

function isRataExtraEnvironment(arg: string): arg is RataExtraEnvironment {
  return !!arg && Object.values(environments).includes(arg as any);
}

const environments = {
  dev: 'dev',
  prod: 'prod',
} as const;

const productionBranch = 'prod';
const productionStackId = productionBranch;
const developmentMainBranch = 'main';
const developmentMainStackId = developmentMainBranch;

function getStackId(branch: string): string {
  const stackId = getEnvOrFail('STACK_ID');
  if (branch === developmentMainBranch && stackId !== developmentMainStackId) {
    throw new Error(`For branch ${developmentMainBranch} stack id must match the branch`);
  }
  if (branch === productionBranch && stackId !== productionStackId) {
    throw new Error(`For branch ${productionBranch} stack id must match the branch`);
  }
  return stackId;
}

// Empty example for now
export const getRataExtraStackConfig = () => ({});

// Runtime variables from SSM/Parameter Store
export const getPipelineConfig = () => {
  const env = getEnvOrFail('ENVIRONMENT');
  if (isRataExtraEnvironment(env)) {
    const branch = env === environments.prod ? productionBranch : getEnvOrFail('BRANCH');
    return {
      env,
      branch,
      stackId: getStackId(branch),
      authenticationToken: 'github-token',
      tags: {
        Environment: env,
        Project: 'Ratatiedot Extranet',
      },
    };
  }
  throw new Error(`Environment value ${env} for ENVIRONMENT is not valid Raita environment.`);
};
