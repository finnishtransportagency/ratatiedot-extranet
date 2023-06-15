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

    // Hack to make CloudFormation init working
    const amiInstallScript = `apt-get update -y`;
    const userData = UserData.forLinux();
    userData.addCommands(amiInstallScript);

    const asgRole = new Role(this, 'ec2-bastion-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')],
    });

    const init = CloudFormationInit.fromElements(
      InitSource.fromGitHub('/testdir/code', 'finnishtransportagency', 'ratatiedot-extranet', config.branch),
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
      signals: Signals.waitForAll({
        timeout: Duration.minutes(10),
      }),
      userData: userData,
    });

    listener.addTargets('NodeBackendTarget', {
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      targets: [autoScalingGroup],
      conditions: [
        ListenerCondition.pathPatterns(['/api/alfresco/file/*']),
        ListenerCondition.httpRequestMethods(['POST']),
      ],
      healthCheck: {
        path: '/file-upload-health',
        port: '80',
        healthyHttpCodes: '200',
      },
    });

    return autoScalingGroup;
  }
}
