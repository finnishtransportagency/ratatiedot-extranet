import { StackProps, Duration } from 'aws-cdk-lib';
import {
  MachineImage,
  InstanceType,
  InstanceClass,
  InstanceSize,
  IVpc,
  CloudFormationInit,
  InitSource,
  InitCommand,
  InitConfig,
  InitFile,
  InitService,
  ServiceManager,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { ManagedPolicy, ServicePrincipal, Role } from 'aws-cdk-lib/aws-iam';
import { AutoScalingGroup, HealthCheck, Signals, UpdatePolicy } from 'aws-cdk-lib/aws-autoscaling';
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

    const asgRole = new Role(this, 'ec2-bastion-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')],
    });

    // InitCommand.shellCommand('cd /source/packages/node-server && npm ci && npm run build && npm run start'),
    const init = CloudFormationInit.fromConfigSets({
      configSets: {
        // Applies the configs below in this order
        default: ['getSource', 'nodeInstall', 'nodeBuild'],
      },
      configs: {
        getSource: new InitConfig([
          InitSource.fromGitHub(
            '/home/ec2-user/source',
            'finnishtransportagency',
            'ratatiedot-extranet',
            config.branch,
          ),
        ]),
        nodeInstall: new InitConfig([
          InitFile.fromFileInline('/home/ec2-user/source/userdata.sh', './lib/userdata.sh'),
          InitCommand.shellCommand('chmod +x /home/ec2-user/source/userdata.sh'),
          InitCommand.shellCommand('pwd'),
          InitCommand.shellCommand('ls -la; cd /home/ec2-user/source; ls -la; cat userdata.sh'),
          InitService.systemdConfigFile('nodeserver', {
            command: '/home/ec2-user/source/userdata.sh',
            afterNetwork: true,
            keepRunning: true,
            description: 'Ratatieto nodejs backend server',
          }),
          InitService.enable('nodeserver', {
            serviceManager: ServiceManager.SYSTEMD,
          }),
        ]),
        nodeBuild: new InitConfig([InitCommand.shellCommand('echo hello!')]),
      },
    });

    const autoScalingGroup = new AutoScalingGroup(this, 'AutoScalingGroup', {
      vpc,
      init,
      initOptions: {
        // Optional, which configsets to activate (['default'] by default)
        configSets: ['default'],
        ignoreFailures: true,
      },
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.SMALL),
      machineImage: MachineImage.genericLinux({ 'eu-west-1': 'ami-0b9b4e1a3d497aefa' }),
      allowAllOutbound: true,
      role: asgRole,
      healthCheck: HealthCheck.ec2(),
      minCapacity: 1,
      maxCapacity: 1,
      signals: Signals.waitForMinCapacity({ timeout: Duration.minutes(15) }),
      updatePolicy: UpdatePolicy.rollingUpdate(),
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

    // Hack to replace old instance by modifying asg init configuration file.
    autoScalingGroup.addUserData(`instance created at: ${new Date()}`);

    return autoScalingGroup;
  }
}
