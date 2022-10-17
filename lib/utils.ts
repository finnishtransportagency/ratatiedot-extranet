import { RemovalPolicy } from 'aws-cdk-lib';
import { RataExtraEnvironment } from './config';

/**
 * Returns RemovalPolicy property value for stack resources based on given raita environment value
 */
export const getRemovalPolicy = (rataExtraEnv: RataExtraEnvironment) =>
  rataExtraEnv === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
