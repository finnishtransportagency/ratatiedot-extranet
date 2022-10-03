#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { RataExtraPipelineStack } from '../lib/rataextra-pipeline';

const app = new cdk.App();
new RataExtraPipelineStack(app, 'RataExtraPipelineStack');
