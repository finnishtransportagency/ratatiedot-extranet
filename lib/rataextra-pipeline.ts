import { SecretValue, Stack, Stage, StageProps } from 'aws-cdk-lib';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Cache, LocalCacheMode } from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';
import { getPipelineConfig } from './config';
import { RataExtraStack } from './rataextra-stack';

/**
 * The stack that defines the application pipeline
 */
export class RataExtraPipelineStack extends Stack {
  constructor(scope: Construct) {
    const { config } = getPipelineConfig();
    super(scope, 'rataextra-pipeline-' + config.env, {
      env: {
        region: 'eu-west-1',
      },

      tags: config.tags,
    });

    const buildAction = new CodeBuildStep('Build', {
      input: CodePipelineSource.gitHub('finnishtransportagency/ratatiedot-extranet', config.branch, {
        authentication: SecretValue.secretsManager(config.authenticationToken),
      }),
      installCommands: ['npm_config_user=root npm run ci'],
      commands: ['cd packages/frontend && npm i && npm run build', 'cd ../..'],
      primaryOutputDirectory: './',
    });

    const pipeline = new CodePipeline(this, 'Rataextra-Pipeline', {
      pipelineName: 'Rataextra-' + config.env,
      synth: new ShellStep('Synth', {
        input: buildAction,
        // TODO: Use when connection is in use
        // input: CodePipelineSource.connection('finnishtransportagency/ratatiedot-extranet', config.branch, {
        //   connectionArn: StringParameter.valueFromLookup(this, config.repoConnectionName),
        // }),
        commands: [
          'ls -lah',
          // 'npm_config_user=root npm run ci',
          // 'npm_config_user=root npm run build', // TODO: Lerna symlinking doesn't work in CodePipeline
          // 'cd packages/frontend && npm ci && npm run build', // Testing out separate fe build
          // 'ls -lah && cd ../..',
          'ls -lah ./packages/fronted/build',
          'pwd',
          `npm run pipeline:synth --environment=${config.env} --branch=${config.branch}`,
        ],
        primaryOutputDirectory: './cdk.out',
      }),
      dockerEnabledForSynth: true,
      codeBuildDefaults: {
        // TODO: Cacheing not working currently
        cache: Cache.local(LocalCacheMode.CUSTOM, LocalCacheMode.SOURCE, LocalCacheMode.DOCKER_LAYER),
      },
    });
    pipeline.addStage(new RataExtraApplication(this, 'RataExtra'));
  }
}
class RataExtraApplication extends Stage {
  stack: RataExtraStack;
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);
    this.stack = new RataExtraStack(this, 'Rataextra');
  }
}
