import { StackProps, Duration } from 'aws-cdk-lib';
import {
  MachineImage,
  InstanceType,
  InstanceClass,
  InstanceSize,
  IVpc,
  CloudFormationInit,
  InitSource,
  UserData,
  InitCommand,
  InitConfig,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { ManagedPolicy, ServicePrincipal, Role } from 'aws-cdk-lib/aws-iam';
import { AutoScalingGroup, HealthCheck, Signals } from 'aws-cdk-lib/aws-autoscaling';
import { ApplicationProtocol, ApplicationListener, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { getPipelineConfig } from './config';

interface RatatietoNodeBackendStackProps extends StackProps {
  readonly vpc: IVpc;
  listener: ApplicationListener;
}

export class RatatietoNodeBackendConstruct extends Construct {
  constructor(scope: Construct, id: string, props: RatatietoNodeBackendStackProps) {
    super(scope, id);

    const { vpc, listener } = props;

    const config = getPipelineConfig();

    const userData = UserData.forLinux();

    const commands = [
      'exec > /tmp/userdata.log 2>&1',
      'yum -y update',
      'yum install -y aws-cfn-bootstrap git',
      'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash',
      'cat <<EOF >> /home/ec2-user/.bashrc; export NVM_DIR="/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; EOF',
      'nvm install v16.20.0',
      'nvm use v16.20.0',
      'nvm -v',
      'node -v',
      'npm -v',
      // 'npm install pm2 -g',
      'pwd',
      'ls -la',
    ];

    userData.addCommands(...commands.map((command: string) => command));

    const asgRole = new Role(this, 'ec2-bastion-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')],
    });

    // InitCommand.shellCommand('cd /source/packages/node-server && npm ci && npm run build && npm run start'),

    const autoScalingGroup = new AutoScalingGroup(this, 'AutoScalingGroup', {
      vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.SMALL),
      machineImage: MachineImage.genericLinux({ 'eu-west-1': 'ami-0b9b4e1a3d497aefa' }),
      allowAllOutbound: true,
      role: asgRole,
      healthCheck: HealthCheck.ec2(),
      minCapacity: 1,
      maxCapacity: 1,
      signals: Signals.waitForMinCapacity({ timeout: Duration.minutes(15) }),
      userData: userData,
    });

    listener.addTargets('NodeBackendTarget', {
      port: 8080,
      protocol: ApplicationProtocol.HTTP,
      targets: [autoScalingGroup],
      conditions: [
        ListenerCondition.pathPatterns(['/api/alfresco/file/*']),
        ListenerCondition.httpRequestMethods(['POST']),
      ],
      priority: 120,
    });

    return autoScalingGroup;
  }
}
