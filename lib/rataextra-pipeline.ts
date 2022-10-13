import { SecretValue, Stack, Stage, StageProps } from 'aws-cdk-lib';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Cache, LinuxBuildImage, LocalCacheMode } from 'aws-cdk-lib/aws-codebuild';
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

    const pipeline = new CodePipeline(this, 'Rataextra-Pipeline', {
      pipelineName: 'Rataextra-' + config.env,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('finnishtransportagency/ratatiedot-extranet', config.branch, {
          authentication: SecretValue.secretsManager(config.authenticationToken),
        }),
        installCommands: ['npm run ci --user=root'],
        commands: [
          'npm run build:frontend',
          `npm run pipeline:synth --environment=${config.env} --branch=${config.branch}`,
        ],
      }),
      dockerEnabledForSynth: true,
      codeBuildDefaults: {
        // TODO: Cacheing not working currently
        cache: Cache.local(LocalCacheMode.CUSTOM, LocalCacheMode.SOURCE, LocalCacheMode.DOCKER_LAYER),
        buildEnvironment: {
          buildImage: LinuxBuildImage.STANDARD_6_0,
        },
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
