import { aws_elasticloadbalancingv2, Duration, NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Role } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
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

export class RataExtraBackendStack extends NestedStack {
  constructor(scope: Construct, id: string, props: ResourceNestedStackProps) {
    super(scope, id, props);
    const { rataExtraEnv, rataExtraStackIdentifier, lambdaServiceRole, applicationVpc } = props;
    const urlGeneratorFn = this.createDummyLambda({
      rataExtraStackId: rataExtraStackIdentifier,
      name: 'dummy-handler',
      lambdaRole: lambdaServiceRole,
    });
    // ALB for API
    const alb = this.createlAlb({
      rataExtraStackIdentifier: rataExtraStackIdentifier,
      name: 'api',
      vpc: applicationVpc,
      listenerTargets: [urlGeneratorFn],
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
    listenerTargets: [lambda.Function];
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
    alb.addRedirect();
    const targets = listenerTargets.map((target) => new LambdaTarget(target));
    listener.addTargets('Targets', {
      targets: targets,
      priority: 1,
      conditions: [ListenerCondition.pathPatterns(['/'])],
    });
  }
}
