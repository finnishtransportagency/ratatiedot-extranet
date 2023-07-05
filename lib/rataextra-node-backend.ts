import { StackProps, Duration, NestedStack } from 'aws-cdk-lib';
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
  ISecurityGroup,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { ManagedPolicy, ServicePrincipal, Role } from 'aws-cdk-lib/aws-iam';
import { AutoScalingGroup, HealthCheck, Signals, UpdatePolicy } from 'aws-cdk-lib/aws-autoscaling';
import { ApplicationProtocol, ApplicationListener, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { RataExtraEnvironment, getPipelineConfig } from './config';

interface RatatietoNodeBackendStackProps extends StackProps {
  readonly rataExtraStackIdentifier: string;
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly stackId: string;
  readonly databaseDomain?: string;
  readonly jwtTokenIssuer: string;
  readonly alfrescoAPIKey: string;
  readonly alfrescoAPIUrl: string;
  readonly alfrescoAncestor: string;
  readonly mockUid?: string;
  readonly vpc: IVpc;
  listener: ApplicationListener;
  readonly securityGroup?: ISecurityGroup;
}

// TODO: env parameters
export class RatatietoNodeBackendConstruct extends NestedStack {
  constructor(scope: Construct, id: string, props: RatatietoNodeBackendStackProps) {
    super(scope, id);

    const {
      rataExtraEnv,
      stackId,
      rataExtraStackIdentifier,
      vpc,
      listener,
      securityGroup,
      databaseDomain,
      jwtTokenIssuer,
      alfrescoAPIKey,
      alfrescoAPIUrl,
      alfrescoAncestor,
      mockUid,
    } = props;

    const config = getPipelineConfig();

    const asgRole = new Role(this, 'ec2-bastion-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')],
    });

    // InitCommand.shellCommand('cd /source/packages/node-server && npm ci && npm run build && npm run start'),
    const init = CloudFormationInit.fromConfigSets({
      configSets: {
        // Applies the configs below in this order
        default: ['getSource', 'nodeInstall'],
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
          // Hack to replace old instance by modifying asg init configuration file.
          InitCommand.shellCommand(`echo instance created at: ${new Date()}`),
          InitService.systemdConfigFile('nodeserver', {
            command: '/home/ec2-user/source/userdata.sh',
            afterNetwork: true,
            keepRunning: true,
            // TODO: user
            description: 'Ratatieto nodejs backend server',
          }),
          InitService.enable('nodeserver', {
            serviceManager: ServiceManager.SYSTEMD,
          }),
        ]),
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
      machineImage: MachineImage.genericLinux({ 'eu-west-1': 'ami-09c13919869e4af37' }),
      allowAllOutbound: true,
      role: asgRole,
      healthCheck: HealthCheck.ec2(),
      minCapacity: 1,
      maxCapacity: 1,
      signals: Signals.waitForMinCapacity({ timeout: Duration.minutes(15) }),
      updatePolicy: UpdatePolicy.rollingUpdate(),
      securityGroup: securityGroup,
    });

    listener.addTargets('NodeBackendTarget', {
      port: 8080,
      protocol: ApplicationProtocol.HTTP,
      targets: [autoScalingGroup],
      // Also documented in rataextra-backend
      conditions: [
        ListenerCondition.pathPatterns(['/api/alfresco/file/*']),
        ListenerCondition.httpRequestMethods(['POST']),
      ],
      priority: 120,
    });

    return autoScalingGroup;
  }
}
