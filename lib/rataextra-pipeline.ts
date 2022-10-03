import { SecretValue, Stack, StackProps, Stage, StageProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { Cache, LocalCacheMode } from 'aws-cdk-lib/aws-codebuild';
import getconfig from '../config';
import { RataExtraStack } from './rataextra-stack';

/**
 * The stack that defines the application pipeline
 */
export class RataExtraPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    const config = getconfig();
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
        commands: ['npm ci', 'npm run synth:pipeline:' + config.env],
      }),
      dockerEnabledForSynth: true,
      codeBuildDefaults: {
        // TODO: Cacheing not working currently
        cache: Cache.local(LocalCacheMode.CUSTOM, LocalCacheMode.SOURCE, LocalCacheMode.DOCKER_LAYER),
      },
    });
    pipeline.addStage(new RataExtraApplication(this, config.env, config));
  }
}
class RataExtraApplication extends Stage {
  // TODO: Typing
  constructor(scope: Construct, id: string, config: any, props?: StageProps) {
    super(scope, id, props);
    const rataExtraStack = new RataExtraStack(this, 'Rataextra', config);
  }
}
