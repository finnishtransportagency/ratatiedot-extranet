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
  ISecurityGroup,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { ManagedPolicy, ServicePrincipal, Role, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { AutoScalingGroup, CfnAutoScalingGroup, HealthCheck, Signals, UpdatePolicy } from 'aws-cdk-lib/aws-autoscaling';
import { ApplicationProtocol, ApplicationListener, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {
  RataExtraEnvironment,
  getPipelineConfig,
  SSM_DATABASE_DOMAIN,
  SSM_DATABASE_NAME,
  SSM_DATABASE_PASSWORD,
} from './config';
import { readFileSync } from 'fs';

interface RatatietoNodeBackendStackProps extends StackProps {
  readonly rataExtraStackIdentifier: string;
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly stackId: string;
  readonly region: string;
  readonly parentStackName: string;
  readonly jwtTokenIssuer: string;
  readonly jwtTokenIssuers: string;
  readonly alfrescoAPIKey: string;
  readonly alfrescoAPIUrl: string;
  readonly alfrescoAncestor: string;
  readonly mockUid?: string;
  readonly vpc: IVpc;
  listener: ApplicationListener;
  readonly securityGroup?: ISecurityGroup;
}

// TODO: env parameters
export class RatatietoNodeBackendConstruct extends Construct {
  constructor(scope: Construct, id: string, props: RatatietoNodeBackendStackProps) {
    super(scope, id);

    const {
      rataExtraEnv,
      rataExtraStackIdentifier,
      stackId,
      vpc,
      listener,
      securityGroup,
      region,
      parentStackName,
      jwtTokenIssuers,
      alfrescoAPIKey,
      alfrescoAPIUrl,
      alfrescoAncestor,
      mockUid,
    } = props;

    const config = getPipelineConfig();

    const asgRole = new Role(this, 'ec2-nodeserver-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
      ],
    });
    const logGroupName = `/aws/ec2/${rataExtraStackIdentifier}-${rataExtraEnv}-${stackId}-node-server`;

    asgRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [`arn:aws:logs:::log-group:${logGroupName}`],
        actions: ['logs:PutRetentionPolicy'],
      }),
    );
    const userDataScript = readFileSync('./lib/userdata.sh', 'utf8');

    const autoScalingGroup = new AutoScalingGroup(this, 'AutoScalingGroup', {
      vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.SMALL),
      machineImage: MachineImage.genericLinux({ 'eu-west-1': 'ami-0137a96c6096da076' }),
      allowAllOutbound: true,
      role: asgRole,
      healthCheck: HealthCheck.elb({ grace: Duration.minutes(10) }),
      minCapacity: 1,
      maxCapacity: 1,
      signals: Signals.waitForMinCapacity({ timeout: Duration.minutes(15) }),
      updatePolicy: UpdatePolicy.rollingUpdate(),
      securityGroup: securityGroup,
    });
    const autoScalingGroupCfn = <CfnAutoScalingGroup>autoScalingGroup.node.tryFindChild('ASG');

    const init = CloudFormationInit.fromConfigSets({
      configSets: {
        // Applies the configs below in this order
        default: ['getSource', 'loggingSetup', 'nodeInstall', 'signalSuccess'],
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
        loggingSetup: new InitConfig([
          InitFile.fromString(
            '/home/ec2-user/cloudwatch-agent-config.json',
            `{"logs":{"logs_collected":{"files":{"collect_list":[{"file_path":"/var/log/nodeserver/logs.log","log_group_name":"${logGroupName}","log_stream_name":"{instance_id}","timezone":"UTC","retention_in_days":180}]}},"log_stream_name":"logs"}}`,
          ),
          InitCommand.shellCommand('dnf install amazon-cloudwatch-agent -y'),
          InitCommand.shellCommand(
            'sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/home/ec2-user/cloudwatch-agent-config.json',
          ),
        ]),
        nodeInstall: new InitConfig([
          InitFile.fromString('/home/ec2-user/userdata.sh', userDataScript),
          InitCommand.shellCommand('chmod +x /home/ec2-user/userdata.sh'),
          InitCommand.shellCommand('cd /home/ec2-user && ./userdata.sh'),
        ]),
        // TODO: Should be redundant, but this or the other isn't running
        signalSuccess: new InitConfig([
          InitCommand.shellCommand(
            `sudo /opt/aws/bin/cfn-signal -e 0 --stack ${parentStackName} --resource ${autoScalingGroupCfn.logicalId} --region ${region}`,
          ),
        ]),
      },
    });

    autoScalingGroup.applyCloudFormationInit(init, {
      // Optional, which configsets to activate (['default'] by default)
      configSets: ['default'],
      // TODO: Remove once ready
      ignoreFailures: true,
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
      priority: 121,
      healthCheck: {
        healthyThresholdCount: 2,
      },
    });
    // Hack to replace old instance by modifying asg init configuration file.
    autoScalingGroup.addUserData(`# instance created at: ${new Date()}`);
    autoScalingGroup.addUserData(
      `export "ENVIRONMENT=${rataExtraEnv}" "SSM_DATABASE_NAME_ID=${SSM_DATABASE_NAME}" SSM_DATABASE_DOMAIN_ID="${SSM_DATABASE_DOMAIN}" "SSM_DATABASE_PASSWORD_ID=${SSM_DATABASE_PASSWORD}" "ALFRESCO_API_KEY_NAME=${alfrescoAPIKey}" "ALFRESCO_API_URL=${alfrescoAPIUrl}" "ALFRESCO_API_ANCESTOR=${alfrescoAncestor}" "JWT_TOKEN_ISSUERS=${jwtTokenIssuers}" "MOCK_UID=${mockUid}"`,
    );
    autoScalingGroup.addUserData('sudo ln -s /home/ec2-user/.nvm/versions/node/v22.16.0/bin/node /usr/bin/node');
    autoScalingGroup.addUserData('sudo ln -s /home/ec2-user/.nvm/versions/node/v22.16.0/bin/npm /usr/bin/npm');
    autoScalingGroup.addUserData('exec >> /var/log/nodeserver/logs.log 2>&1');
    autoScalingGroup.addUserData('cd /home/ec2-user/source/packages/node-server && su ec2-user -c "npm run start"');

    return autoScalingGroup;
  }
}
