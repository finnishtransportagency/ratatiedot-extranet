import { RemovalPolicy } from 'aws-cdk-lib';
import { DEVELOPMENT_MAIN_STACK_ID, ENVIRONMENTS, PRODUCTION_STACK_ID, RataExtraEnvironment } from './config';

/**
 * Returns RemovalPolicy property value for stack resources based on given RataExtra environment value
 */
export const getRemovalPolicy = (rataExtraEnv: RataExtraEnvironment): RemovalPolicy.RETAIN | RemovalPolicy.DESTROY =>
  rataExtraEnv === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
/**
 * Returns whether the stack is the main development stack
 */
export const isDevelopmentMainStack = (stackId: string, rataExtraEnv: RataExtraEnvironment) =>
  stackId === DEVELOPMENT_MAIN_STACK_ID && rataExtraEnv === ENVIRONMENTS.dev;

/**
 * Returns whether the stack is the production stack
 */
export const isProductionStack = (stackId: string, rataExtraEnv: RataExtraEnvironment) =>
  stackId === PRODUCTION_STACK_ID && rataExtraEnv === ENVIRONMENTS.prod;

/**
 * Returns whether the stack is a feat or local stack
 */
export const isFeatOrLocalStack = (rataExtraEnv: RataExtraEnvironment) =>
  rataExtraEnv === ENVIRONMENTS.feat || rataExtraEnv === ENVIRONMENTS.local;

/**
 * Returns whether the stack is a local stack
 */
export const isLocalStack = (rataExtraEnv: RataExtraEnvironment) => rataExtraEnv === ENVIRONMENTS.local;

/**
 * Returns true if environment is set as prod
 */
export const isProductionEnvirEnvironment = (rataExtraEnv: string) => rataExtraEnv === ENVIRONMENTS.prod;

/**
 * Returns whether the stack is one of the two permanent RataExtra stacks
 * - development main stack that corresponds to development main branch in Github
 * - producition stack that corresponds to production branch in Github
 */
export const isPermanentStack = (stackId: string, rataExtraEnv: RataExtraEnvironment) =>
  isDevelopmentMainStack(stackId, rataExtraEnv) || isProductionStack(stackId, rataExtraEnv);

export const getVpcAttributes = (rataExtraEnv: RataExtraEnvironment) => {
  const vpcId = isProductionEnvirEnvironment(rataExtraEnv) ? 'vpc-0f7ce3c168bc01755' : 'vpc-092f1d064d39ca6a1';
  return {
    vpcId: vpcId,
    availabilityZones: ['eu-west-1a', 'eu-west-1b'],
    privateSubnetIds: ['subnet-05ba766fa5c0f0eb0', 'subnet-019cb289645adae50'],
  };
};

export const getSecurityGroupId = (rataExtraEnv: RataExtraEnvironment) =>
  isProductionEnvirEnvironment(rataExtraEnv) ? 'sg-0fa9cd225ca77951a' : 'sg-04a38c9d8b10a6bbd';
