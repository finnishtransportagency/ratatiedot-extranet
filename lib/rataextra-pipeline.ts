import { SecretValue, Stack, Stage, StageProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Cache, LinuxBuildImage, LocalCacheMode } from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';
import { getPipelineConfig, RataExtraEnvironment } from './config';
import { RataExtraStack } from './rataextra-stack';

/**
 * The stack that defines the application pipeline
 */
export class RataExtraPipelineStack extends Stack {
  constructor(scope: Construct) {
    const config = getPipelineConfig();
    super(scope, 'stack-pipeline-rataextra-' + config.stackId, {
      env: {
        region: 'eu-west-1',
      },

      tags: config.tags,
    });

    const pipeline = new CodePipeline(this, 'Pipeline-RataExtra', {
      pipelineName: 'pr-rataextra-' + config.stackId,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('finnishtransportagency/ratatiedot-extranet', config.branch, {
          authentication: SecretValue.secretsManager(config.authenticationToken),
        }),
        installCommands: ['npm run ci --user=root'],
        commands: [
          'npm run build:frontend',
          `npm run pipeline:synth --environment=${config.env} --branch=${config.branch} --stackid=${config.stackId}`,
        ],
      }),
      codeBuildDefaults: {
        cache: Cache.local(LocalCacheMode.CUSTOM, LocalCacheMode.SOURCE),
        buildEnvironment: {
          buildImage: LinuxBuildImage.STANDARD_6_0,
        },
      },
    });
    pipeline.addStage(
      new RataExtraApplication(this, 'RataExtra', {
        stackId: config.stackId,
        rataExtraEnv: config.env,
      }),
    );
  }
}
interface RataExtraStageProps extends StageProps {
  readonly stackId: string;
  readonly rataExtraEnv: RataExtraEnvironment;
}
class RataExtraApplication extends Stage {
  constructor(scope: Construct, id: string, props: RataExtraStageProps) {
    super(scope, id, props);
    const rataExtraStack = new RataExtraStack(this, `rataextra-${props.env}-${props.stackId}`, {
      rataExtraEnv: props.env as RataExtraEnvironment, // Weirdly thinks this can be undefined
    });
  }
}
