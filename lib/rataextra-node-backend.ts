import { StackProps, Stack } from 'aws-cdk-lib';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { ApplicationListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Cluster, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { NetworkLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';

interface RatatietoNodeBackendStackProps extends StackProps {
  readonly vpc: IVpc;
  listener: ApplicationListener;
}

export class RatatietoNodeBackendStack extends Stack {
  constructor(scope: Construct, id: string, props: RatatietoNodeBackendStackProps) {
    super(scope, id);

    const { vpc, listener } = props;

    const cluster = new Cluster(this, 'NodeBackendCluster', {
      vpc: vpc,
    });

    const service = new NetworkLoadBalancedFargateService(this, 'NodeFargateService', {
      cluster,
      desiredCount: 1,
      assignPublicIp: false,
      listenerPort: 3000,
      taskImageOptions: {
        image: ContainerImage.fromAsset(__dirname + '/../packages/node-server'),
      },
    });
  }
}
