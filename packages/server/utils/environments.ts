// Copied from lib/config
export const ENVIRONMENTS = {
  dev: 'dev',
  prod: 'prod',
  local: 'local',
  feat: 'feat',
} as const;

export type RataExtraEnvironment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];

// Copied from lib/utils
export const isFeatOrLocalStack = (rataExtraEnv: RataExtraEnvironment) =>
  rataExtraEnv === ENVIRONMENTS.feat || rataExtraEnv === ENVIRONMENTS.local;
