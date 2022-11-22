#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { RataExtraStack } from '../lib/rataextra-stack';

const app = new cdk.App();
new RataExtraStack(app, 'rataextra', { rataExtraEnv: 'dev', stackId: 'main', tags: {} });
