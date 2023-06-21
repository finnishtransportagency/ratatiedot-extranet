import { StackProps, Stack } from 'aws-cdk-lib';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { ApplicationProtocol, ApplicationListener, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { getPipelineConfig } from './config';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Cluster, FargateTaskDefinition, ContainerImage, LogDrivers, FargateService } from 'aws-cdk-lib/aws-ecs';
import { LinuxBuildImage, Source, FilterGroup, EventAction, Project, BuildSpec } from 'aws-cdk-lib/aws-codebuild';

interface RatatietoNodeBackendStackProps extends StackProps {
  readonly vpc: IVpc;
  listener: ApplicationListener;
}

export class RatatietoNodeBackendStack extends Stack {
  constructor(scope: Construct, id: string, props: RatatietoNodeBackendStackProps) {
    super(scope, id);

    const { vpc, listener } = props;

    const config = getPipelineConfig();

    const repository = new Repository(this, 'node-backend', {
      repositoryName: 'node-backend',
    });

    const cluster = new Cluster(this, 'NodeBackendCluster', {
      vpc: vpc,
    });

    const executionRolePolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ['*'],
      actions: [
        'ecr:GetAuthorizationToken',
        'ecr:BatchCheckLayerAvailability',
        'ecr:GetDownloadUrlForLayer',
        'ecr:BatchGetImage',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
        'codebuild:CreateProject',
        'codebuild:StartBuild',
      ],
    });

    const fargateTaskDefinition = new FargateTaskDefinition(this, 'ApiTaskDefinition', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    fargateTaskDefinition.addToExecutionRolePolicy(executionRolePolicy);

    const container = fargateTaskDefinition.addContainer('backend', {
      // Use an image from Amazon ECR
      image: ContainerImage.fromAsset(__dirname + '/../packages/node-server'),
      logging: LogDrivers.awsLogs({ streamPrefix: 'node-backend' }),
      environment: {
        APP_ID: 'my-app',
      },
    });

    container.addPortMappings({
      containerPort: 3000,
    });

    const sg_service = new SecurityGroup(this, 'MySGService', { vpc: vpc });

    const service = new FargateService(this, 'Service', {
      cluster,
      taskDefinition: fargateTaskDefinition,
      desiredCount: 1,
      assignPublicIp: false,
      securityGroups: [sg_service],
    });

    listener.addTargets('NodeBackendTarget', {
      port: 3000,
      protocol: ApplicationProtocol.HTTP,
      targets: [service],
      conditions: [
        ListenerCondition.pathPatterns(['/api/alfresco/file/*']),
        ListenerCondition.httpRequestMethods(['POST']),
      ],
      priority: 120,
    });

    const gitHubSource = Source.gitHub({
      owner: 'finnishtransportagency',
      repo: 'ratatiedot-extranet',
      webhook: true, // optional, default: true if `webhookfilteres` were provided, false otherwise
      webhookFilters: [FilterGroup.inEventOf(EventAction.PUSH).andBranchIs(config.branch)], // optional, by default all pushes and pull requests will trigger a build
    });

    const project = new Project(this, 'myProject', {
      projectName: `${this.stackName}`,
      source: gitHubSource,
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_2,
        privileged: true,
      },
      environmentVariables: {
        cluster_name: {
          value: `${cluster.clusterName}`,
        },
        ecr_repo_uri: {
          value: `${repository.repositoryUri}`,
        },
      },
      badge: true,
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            /*
            commands: [
              'env',
              'export tag=${CODEBUILD_RESOLVED_SOURCE_VERSION}'
            ]
            */
            commands: ['env', 'export tag=latest'],
          },
          build: {
            commands: [
              'cd packages/node-backend',
              `docker build -t $ecr_repo_uri:$tag .`,
              '$(aws ecr get-login --no-include-email)',
              'docker push $ecr_repo_uri:$tag',
            ],
          },
          post_build: {
            commands: [
              'echo "in post-build stage"',
              'cd ..',
              'printf \'[{"name":"flask-app","imageUri":"%s"}]\' $ecr_repo_uri:$tag > imagedefinitions.json',
              'pwd; ls -al; cat imagedefinitions.json',
            ],
          },
        },
        artifacts: {
          files: ['imagedefinitions.json'],
        },
      }),
    });
  }
}
