import { Stack, Fn, aws_codebuild, SecretValue } from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import {
  ISecurityGroup,
  IVpc,
  Instance,
  InstanceType,
  InstanceClass,
  InstanceSize,
  MachineImage,
  UserData,
} from 'aws-cdk-lib/aws-ec2';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { RataExtraEnvironment, getPipelineConfig } from './config';

interface RatatietoNodeBackendStackProps extends StackProps {
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly albDns: string;
  readonly databaseDns?: string | undefined;
  readonly stackId: string;
  readonly vpc: IVpc;
  readonly securityGroup?: ISecurityGroup;
}

export class RatatietoNodeBackendStack extends Stack {
  constructor(scope: Construct, id: string, props: RatatietoNodeBackendStackProps) {
    super(scope, id, props);
    const { albDns, databaseDns, vpc, securityGroup } = props;

    const config = getPipelineConfig();
    const githubAccessToken = SecretValue.secretsManager(config.authenticationToken);

    const serviceRole = new Role(this, 'ec2-bastion-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')],
    });

    // Set Github source access
    new aws_codebuild.GitHubSourceCredentials(this, 'CodeBuildGitHubCreds', {
      accessToken: githubAccessToken,
    });

    const buildProject = new aws_codebuild.Project(this, 'NodeBackendBuild', {
      projectName: 'NodeBackend',
      buildSpec: aws_codebuild.BuildSpec.fromSourceFilename('packages/node-server/buildspec.yml'),
      description: 'Node + express backend, created by CDK.',
      environment: {
        buildImage: aws_codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
        privileged: true,
      },
      source: aws_codebuild.Source.gitHub({ owner: 'finnishtransportagency', repo: 'ratatiedot-extranet' }),
      role: serviceRole,
    });

    const bastionRole = new Role(this, 'ec2-node-backend-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')],
    });

    const bastion = new Instance(this, 'ec2-bastion-instance', {
      vpc,
      securityGroup,
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.SMALL),
      machineImage: MachineImage.genericLinux({ 'eu-west-1': 'ami-0b9b4e1a3d497aefa' }),
      role: bastionRole,
    });
  }
}
