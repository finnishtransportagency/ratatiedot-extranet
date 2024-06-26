import { Stack, Fn } from 'aws-cdk-lib';
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
import { RataExtraEnvironment } from './config';

interface RataExtraBastionStackProps extends StackProps {
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly albDns: string;
  readonly databaseDns?: string | undefined;
  readonly stackId: string;
  readonly vpc: IVpc;
  readonly securityGroup?: ISecurityGroup;
}

export class RataExtraBastionStack extends Stack {
  constructor(scope: Construct, id: string, props: RataExtraBastionStackProps) {
    super(scope, id, props);
    const { albDns, databaseDns, vpc, securityGroup } = props;

    const bastionRole = new Role(this, 'ec2-bastion-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')],
    });

    const userData = UserData.forLinux();
    const userDataCommands = [
      'sudo dnf -y update',
      'sudo dnf install socat -y',
      `nohup socat TCP4-LISTEN:80,reuseaddr,fork TCP:${albDns}:80 &`,
    ];
    if (databaseDns) {
      userDataCommands.push(
        `nohup socat TCP4-LISTEN:5432,reuseaddr,fork TCP:${Fn.sub('${databaseDns}', {
          databaseDns: databaseDns,
        })}:5432 &`,
      );
    }
    userData.addCommands(...userDataCommands);

    new Instance(this, 'ec2-bastion-instance', {
      vpc,
      securityGroup,
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.SMALL),
      machineImage: MachineImage.genericLinux({ 'eu-west-1': 'ami-0137a96c6096da076' }),
      role: bastionRole,
      userData,
    });
  }
}
