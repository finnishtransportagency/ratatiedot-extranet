import { aws_elasticloadbalancingv2, Duration, NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
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
  readonly applicationVpc: Vpc;
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
    const { rataExtraEnv, rataExtraStackIdentifier, lambdaServiceRole, applicationVpc } = props;
    const dummyFn = this.createDummyLambda({
      rataExtraStackId: rataExtraStackIdentifier,
      name: 'dummy-handler',
      lambdaRole: lambdaServiceRole,
    });

    const dummy2Fn = this.createDummy2Lambda({
      rataExtraStackId: rataExtraStackIdentifier,
      name: 'dummy2-handler',
      lambdaRole: lambdaServiceRole,
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
    });
  }

  private createDummyLambda({
    rataExtraStackId,
    name,
    lambdaRole,
  }: {
    name: string;
    rataExtraStackId: string;
    lambdaRole: Role;
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
    });
  }

  private createDummy2Lambda({
    rataExtraStackId,
    name,
    lambdaRole,
  }: {
    name: string;
    rataExtraStackId: string;
    lambdaRole: Role;
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
    });
  }

  private createlAlb({
    rataExtraStackIdentifier,
    name,
    vpc,
    internetFacing = false,
    listenerTargets,
  }: {
    rataExtraStackIdentifier: string;
    name: string;
    vpc: Vpc;
    listenerTargets: ListenerTargetLambdas[];
    internetFacing?: boolean;
  }) {
    const alb = new aws_elasticloadbalancingv2.ApplicationLoadBalancer(
      this,
      `alb-${rataExtraStackIdentifier}-${name}`,
      {
        vpc,
        internetFacing,
        loadBalancerName: `alb-${rataExtraStackIdentifier}-${name}`,
      },
    );
    const listener = alb.addListener('Listener', {
      port: 80,
      defaultAction: ListenerAction.fixedResponse(404),
    });
    // alb.addRedirect();
    // TODO: Add each Lambda individually with unique paths
    const targets = listenerTargets.map((target, index) =>
      listener.addTargets(`Target-${index}`, {
        targets: [new LambdaTarget(target.lambda)],
        priority: target.priority,
        conditions: [ListenerCondition.pathPatterns(target.path)],
      }),
    );
  }
}
