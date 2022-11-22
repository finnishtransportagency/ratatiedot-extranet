#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';
import { RataExtraPipelineStack } from '../lib/rataextra-pipeline';
import { getPipelineConfig } from '../lib/config';

const app = new cdk.App();
new RataExtraPipelineStack(app);
const tags = getPipelineConfig().tags;
Object.entries(tags).forEach(([key, value]) => Tags.of(app).add(key, value));
