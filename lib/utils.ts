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
 * Returns whether the stack is one of the two permanent RataExtra stacks
 * - development main stack that corresponds to development main branch in Github
 * - producition stack that corresponds to production branch in Github
 */
export const isPermanentStack = (stackId: string, rataExtraEnv: RataExtraEnvironment) =>
  isDevelopmentMainStack(stackId, rataExtraEnv) || isProductionStack(stackId, rataExtraEnv);
