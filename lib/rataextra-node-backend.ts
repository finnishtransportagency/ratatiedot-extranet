import { Stack } from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface RatatietoNodeBackendStackProps extends StackProps {
  readonly stackId: string;
  readonly vpc: IVpc;
  readonly securityGroup: ISecurityGroup;
}

export class RatatietoNodeBackendStack extends Stack {
  constructor(scope: Construct, id: string, props: RatatietoNodeBackendStackProps) {
    super(scope, id, props);
  }
}
