import { SecretValue, Stack, Stage, StageProps, Tags } from 'aws-cdk-lib';
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
        account: config.account,
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
          `npm run pipeline:synth --environment=${config.env} --branch=${config.branch} --stackid=${config.stackId} --awsaccount=${config.account}`,
        ],
      }),
      dockerEnabledForSynth: true,
      codeBuildDefaults: {
        cache: Cache.local(LocalCacheMode.DOCKER_LAYER, LocalCacheMode.SOURCE),
        buildEnvironment: {
          buildImage: LinuxBuildImage.STANDARD_6_0,
        },
      },
    });
    pipeline.addStage(
      new RataExtraApplication(this, 'RataExtra', {
        stackId: config.stackId,
        rataExtraEnv: config.env,
        tags: config.tags,
        env: {
          region: 'eu-west-1',
          account: config.account,
        },
      }),
    );
  }
}
interface RataExtraStageProps extends StageProps {
  readonly stackId: string;
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly tags: { [key: string]: string };
}
class RataExtraApplication extends Stage {
  constructor(scope: Construct, id: string, props: RataExtraStageProps) {
    super(scope, id, props);
    const rataExtraStack = new RataExtraStack(this, `rataextra-${props.rataExtraEnv}-${props.stackId}`, {
      rataExtraEnv: props.rataExtraEnv,
      stackId: props.stackId,
      tags: props.tags,
    });
    Object.entries(props.tags).forEach(([key, value]) => Tags.of(rataExtraStack).add(key, value));
  }
}
