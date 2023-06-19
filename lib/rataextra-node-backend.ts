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
    userData.addCommands(
      'exec > /tmp/userdata.log 2>&1',
      'yum -y update',
      'yum install -y aws-cfn-bootstrap',
      'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash',
      '. /home/ec2-user/.nvm/nvm.sh',
      '. /home/ec2-user/.bashrc',
      'nvm alias default v16.20.0',
      'nvm install v16.20.0',
      'nvm use v16.20.0',
      'npm install pm2 -g',
      'chown ec2-user:ec2-user /home/ec2-user/install_script.sh && chown -R ec2-user:ec2-user /ratatieto-source && chmod a+x /home/ec2-user/install_script.sh',
      'cp -R /ratatieto-source/temp/packages/node-server/* /ratatieto-source',
      'rm -rf /ratatieto-source/temp',
      'cd /ratatieto-source',
      'npm ci',
      'npm run build',
      'npm run start',
    );

    const asgRole = new Role(this, 'ec2-bastion-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')],
    });

    const init = CloudFormationInit.fromElements(
      InitSource.fromGitHub('/ratatieto-source/temp', 'finnishtransportagency', 'ratatiedot-extranet', config.branch),
    );

    const autoScalingGroup = new AutoScalingGroup(this, 'AutoScalingGroup', {
      vpc,
      init,
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
