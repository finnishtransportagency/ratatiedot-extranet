import { aws_elasticloadbalancingv2, Duration, NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { IVpc, ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Role } from 'aws-cdk-lib/aws-iam';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Construct } from 'constructs';
import { RataExtraEnvironment } from './config';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { ListenerAction, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as path from 'path';

interface ResourceNestedStackProps extends NestedStackProps {
  readonly rataExtraStackIdentifier: string;
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly lambdaServiceRole: Role;
  readonly applicationVpc: IVpc;
  readonly securityGroup?: ISecurityGroup;
}

type ListenerTargetLambdas = {
  lambda: NodejsFunction;
  /** Must be a unique integer for each. Lowest number is prioritized */
  priority: number;
  path: [string];
};

export class RataExtraBackendStack extends NestedStack {
  constructor(scope: Construct, id: string, props: ResourceNestedStackProps) {
    super(scope, id, props);
    const { rataExtraEnv, rataExtraStackIdentifier, lambdaServiceRole, applicationVpc, securityGroup } = props;

    const securityGroups = securityGroup ? [securityGroup] : undefined;
    const dummyFn = this.createDummyLambda({
      rataExtraStackId: rataExtraStackIdentifier,
      name: 'dummy-handler',
      lambdaRole: lambdaServiceRole,
      vpc: applicationVpc,
      securityGroups: securityGroups,
    });

    const dummy2Fn = this.createDummy2Lambda({
      rataExtraStackId: rataExtraStackIdentifier,
      name: 'dummy2-handler',
      lambdaRole: lambdaServiceRole,
      vpc: applicationVpc,
      securityGroups: securityGroups,
    });

    // Add all lambdas here to add as alb targets
    const lambdas: ListenerTargetLambdas[] = [
      { lambda: dummy2Fn, priority: 90, path: ['/test'] },
      { lambda: dummyFn, priority: 100, path: ['/*'] },
    ];
    // ALB for API
    const alb = this.createlAlb({
      rataExtraStackIdentifier: rataExtraStackIdentifier,
      name: 'api',
      vpc: applicationVpc,
      listenerTargets: lambdas,
      securityGroup,
    });
  }

  private createDummyLambda({
    rataExtraStackId,
    name,
    lambdaRole,
    vpc,
    securityGroups,
  }: {
    name: string;
    rataExtraStackId: string;
    lambdaRole: Role;
    vpc: IVpc;
    securityGroups?: ISecurityGroup[];
  }) {
    return new NodejsFunction(this, name, {
      functionName: `lambda-${rataExtraStackId}-${name}`,
      memorySize: 1024,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_16_X,
      handler: 'handleRequest',
      entry: path.join(__dirname, `../packages/server/lambdas/dummy.ts`),
      environment: {},
      role: lambdaRole,
      vpc,
      securityGroups: securityGroups,
    });
  }

  private createDummy2Lambda({
    rataExtraStackId,
    name,
    lambdaRole,
    vpc,
    securityGroups,
  }: {
    name: string;
    rataExtraStackId: string;
    lambdaRole: Role;
    vpc: IVpc;
    securityGroups?: ISecurityGroup[];
  }) {
    return new NodejsFunction(this, name, {
      functionName: `lambda-${rataExtraStackId}-${name}`,
      memorySize: 1024,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_16_X,
      handler: 'handleRequest',
      entry: path.join(__dirname, `../packages/server/lambdas/dummy2.ts`),
      environment: {},
      role: lambdaRole,
      vpc: vpc,
      securityGroups: securityGroups,
    });
  }

  private createlAlb({
    rataExtraStackIdentifier,
    name,
    vpc,
    internetFacing = false,
    listenerTargets,
    securityGroup,
  }: {
    rataExtraStackIdentifier: string;
    name: string;
    vpc: IVpc;
    listenerTargets: ListenerTargetLambdas[];
    internetFacing?: boolean;
    securityGroup?: ISecurityGroup;
  }) {
    const alb = new aws_elasticloadbalancingv2.ApplicationLoadBalancer(
      this,
      `alb-${rataExtraStackIdentifier}-${name}`,
      {
        vpc,
        securityGroup,
        internetFacing,
        loadBalancerName: `alb-${rataExtraStackIdentifier}-${name}`,
      },
    );
    const listener = alb.addListener('Listener', {
      port: 80,
      defaultAction: ListenerAction.fixedResponse(404),
    });

    const targets = listenerTargets.map((target, index) =>
      listener.addTargets(`Target-${index}`, {
        targets: [new LambdaTarget(target.lambda)],
        priority: target.priority,
        conditions: [ListenerCondition.pathPatterns(target.path)],
      }),
    );
  }
}
