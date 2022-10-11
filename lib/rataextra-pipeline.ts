import { SecretValue, Stack, Stage, StageProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
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

    // const buildOutput = new Artifact();
    const pipeline = new CodePipeline(this, 'Rataextra-Pipeline', {
      pipelineName: 'Rataextra-' + config.env,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('finnishtransportagency/ratatiedot-extranet', config.branch, {
          authentication: SecretValue.secretsManager(config.authenticationToken),
        }),
        // TODO: Use when connection is in use
        // input: CodePipelineSource.connection('finnishtransportagency/ratatiedot-extranet', config.branch, {
        //   connectionArn: StringParameter.valueFromLookup(this, config.repoConnectionName),
        // }),
        commands: [
          'echo $USER',
          'npm run ci',
          'ls -lah node_modules/', // TODO: remove
          'npm run build',
          `npm run pipeline:synth --environment=${config.env} --branch=${config.branch}`,
        ],
      }),
      dockerEnabledForSynth: true,
      codeBuildDefaults: {
        // TODO: Cacheing not working currently
        cache: Cache.local(LocalCacheMode.CUSTOM, LocalCacheMode.SOURCE, LocalCacheMode.DOCKER_LAYER),
      },
    });
    // console.log(pipeline.pipeline.artifactBucket);
    // const deployment = new BucketDeployment(this, 'Deploy FrontEnd', {
    //   sources: [pipeline.pipeline.artifactBucket],
    //   destinationBucket: null
    // });
    pipeline.addStage(new RataExtraApplication(this, 'RataExtra'));
  }
}
class RataExtraApplication extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);
    new RataExtraStack(this, 'Rataextra');
  }
}
