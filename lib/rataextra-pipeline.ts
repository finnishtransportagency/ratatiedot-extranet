import { SecretValue, Stack, Stage, StageProps, Tags } from 'aws-cdk-lib';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Cache, LinuxBuildImage, LocalCacheMode } from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';
import { getPipelineConfig, RataExtraEnvironment } from './config';
import { RataExtraStack } from './rataextra-stack';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';

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

    const oauth = SecretValue.secretsManager(config.authenticationToken);

    const pipeline = new CodePipeline(this, 'Pipeline-RataExtra', {
      pipelineName: 'pr-rataextra-' + config.stackId,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('finnishtransportagency/ratatiedot-extranet', config.branch, {
          authentication: oauth,
        }),
        installCommands: ['npm run ci --user=root'],
        commands: [
          'npm run build:frontend',
          `npm run pipeline:synth --environment=${config.env} --branch=${config.branch} --stackid=${config.stackId}`,
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

    const strip = new CodeBuildStep('StripAssetsFromAssembly', {
      input: pipeline.cloudAssemblyFileSet,
      commands: [
        "cross_region_replication_buckets=$(grep BucketName cross-region-stack-* | awk -F 'BucketName' '{print $2}' | tr -d ': ' | tr -d '\"' | tr -d ',')",
        'S3_PATH=${CODEBUILD_SOURCE_VERSION#"arn:aws:s3:::"}',
        'ZIP_ARCHIVE=$(basename $S3_PATH)',
        'rm -rf asset.*',
        'zip -r -q -A $ZIP_ARCHIVE *',
        'aws s3 cp $ZIP_ARCHIVE s3://$S3_PATH',
        'object_location=${S3_PATH#*/}',
        'for bucket in $cross_region_replication_buckets; do aws s3 cp $ZIP_ARCHIVE s3://$bucket/$object_location; done',
      ],
      rolePolicyStatements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: ['arn:aws:s3:::*'],
          actions: ['s3:GetObject', 's3:ListBucket', 's3:PutObject'],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: [`arn:aws:kms:${this.region}:${this.account}:aws/ssm`],
          actions: ['kms:GenerateDataKey'],
        }),
      ],
    });

    pipeline.addWave('BeforeStageDeploy', {
      pre: [strip],
    });

    pipeline.addStage(
      new RataExtraApplication(this, 'RataExtra', {
        stackId: config.stackId,
        rataExtraEnv: config.env,
        tags: config.tags,
        env: {
          region: 'eu-west-1',
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
