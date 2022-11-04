import * as cdk from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import {
  SecurityGroup,
  Vpc,
  Instance,
  InstanceType,
  InstanceClass,
  InstanceSize,
  MachineImage,
  UserData,
} from 'aws-cdk-lib/aws-ec2';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { RataExtraEnvironment } from './config';
import { getSecurityGroupId, getVpcAttributes } from './utils';

interface RataExtraBastionStackProps extends StackProps {
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly albDns: string;
}

export class RataExtraBastionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: RataExtraBastionStackProps) {
    super(scope, id, props);
    const { rataExtraEnv, albDns } = props;

    const vpc = Vpc.fromVpcAttributes(this, 'rataextra-vpc', {
      ...getVpcAttributes(rataExtraEnv),
    });

    const securityGroup = SecurityGroup.fromSecurityGroupId(
      this,
      'rataextra-security-group',
      getSecurityGroupId(rataExtraEnv),
    );

    const bastionRole = new Role(this, 'ec2-bastion-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')],
    });

    const userData = UserData.forLinux();
    userData.addCommands(
      'sudo yum update -y',
      'sudo yum install socat -y',
      `sudo socat TCP4-LISTEN:80,reuseaddr,fork TCP:${albDns}:80`,
    );

    const bastion = new Instance(this, 'ec2-bastion-instance', {
      vpc,
      securityGroup,
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.SMALL),
      machineImage: MachineImage.genericLinux({ 'eu-west-1': 'ami-0b9b4e1a3d497aefa' }),
      role: bastionRole,
      userData,
    });
  }
}
