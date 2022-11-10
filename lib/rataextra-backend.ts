import { aws_elasticloadbalancingv2, Duration, NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { IVpc, ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Role } from 'aws-cdk-lib/aws-iam';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Construct } from 'constructs';
import { RataExtraEnvironment } from './config';
import { ICommandHooks, NodejsFunction, BundlingOptions } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { ListenerAction, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as path from 'path';
import { isDevelopmentMainStack } from './utils';
import { RataExtraBastionStack } from './rataextra-bastion';

interface ResourceNestedStackProps extends NestedStackProps {
  readonly rataExtraStackIdentifier: string;
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly lambdaServiceRole: Role;
  readonly applicationVpc: IVpc;
  readonly securityGroup?: ISecurityGroup;
  readonly databaseDomain?: string;
  readonly databasePassword?: string;
  readonly databaseName?: string;
}

type ListenerTargetLambdas = {
  lambda: NodejsFunction;
  /** Must be a unique integer for each. Lowest number is prioritized */
  priority: number;
  path: [string];
};

type LambdaParameters = {
  name: string;
  rataExtraStackId: string;
  lambdaRole: Role;
  /** Relative path from declaring file to the lambda function file */
  relativePath: string;
  vpc: IVpc;
  securityGroups?: ISecurityGroup[];
  memorySize?: number;
  timeout?: Duration;
  runtime?: Runtime;
  /** Name of the function to be called */
  handler?: string;
  /** Environment variables to be passed to the function */
  environment?: Record<string, string>;
  bundling?: BundlingOptions;
};

export class RataExtraBackendStack extends NestedStack {
  constructor(scope: Construct, id: string, props: ResourceNestedStackProps) {
    super(scope, id, props);
    const {
      rataExtraEnv,
      rataExtraStackIdentifier,
      lambdaServiceRole,
      applicationVpc,
      securityGroup,
      databaseDomain,
      databasePassword,
      databaseName,
    } = props;

    const securityGroups = securityGroup ? [securityGroup] : undefined;

    // Basic Lambda configs
    // ID and VPC should not be changed
    // Role and SG might need to be customized per Lambda
    const genericLambdaParameters = {
      rataExtraStackId: rataExtraStackIdentifier,
      vpc: applicationVpc,
      lambdaRole: lambdaServiceRole,
      securityGroups: securityGroups,
    };

    const prismaParameters = {
      ...genericLambdaParameters,
      environment: {
        DATABASE_URL: `postgresql://${databaseName}:${databasePassword}@${databaseDomain}:5432${databaseName}?schema=public`,
      },
      bundling: {
        nodeModules: ['prisma', '@prisma/client'],
        commandHooks: {
          beforeInstall(inputDir: string, outputDir: string) {
            return [`cp -R ${inputDir}/packages/server/prisma ${outputDir}/`];
          },
          beforeBundling(_inputDir: string, _outputDir: string) {
            return [];
          },
          afterBundling(_inputDir: string, outputDir: string) {
            return [
              `cd ${outputDir}`,
              `npx prisma generate`,
              `rm -rf node_modules/@prisma/engines`,
              `rm -rf node_modules/@prisma/client/node_modules node_modules/.bin node_modules/prisma`,
            ];
          },
        },
      },
    };

    const dummyFn = this.createNodejsLambda({
      ...genericLambdaParameters,
      name: 'dummy-handler',
      relativePath: '../packages/server/lambdas/dummy.ts',
    });

    const dummy2Fn = this.createNodejsLambda({
      ...genericLambdaParameters,
      name: 'dummy2-handler',
      relativePath: '../packages/server/lambdas/dummy2.ts',
    });

    const createUser = this.createNodejsLambda({
      ...prismaParameters,
      name: 'create-user',
      relativePath: '../packages/server/lambdas/create-user.ts',
    });

    const listUsers = this.createNodejsLambda({
      ...prismaParameters,
      name: 'list-users',
      relativePath: '../packages/server/lambdas/list-users.ts',
    });

    // Add all lambdas here to add as alb targets
    const lambdas: ListenerTargetLambdas[] = [
      { lambda: listUsers, priority: 70, path: ['/api/users'] },
      { lambda: createUser, priority: 80, path: ['/api/create-user'] },
      { lambda: dummy2Fn, priority: 90, path: ['/api/test'] },
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

    if (isDevelopmentMainStack(rataExtraStackIdentifier, rataExtraEnv)) {
      new RataExtraBastionStack(this, 'stack-bastion', {
        rataExtraEnv,
        albDns: alb.loadBalancerDnsName,
        databaseDns: databaseDomain,
      });
    }
  }

  private createNodejsLambda({
    rataExtraStackId,
    name,
    lambdaRole,
    relativePath,
    vpc,
    securityGroups,
    memorySize = 1024,
    timeout = Duration.seconds(5),
    runtime = Runtime.NODEJS_16_X,
    handler = 'handleRequest',
    environment = {},
    bundling = {},
  }: LambdaParameters) {
    return new NodejsFunction(this, name, {
      functionName: `lambda-${rataExtraStackId}-${name}`,
      memorySize: memorySize,
      timeout: timeout,
      // Accepts only Nodejs runtimes
      runtime: runtime,
      handler: handler,
      entry: path.join(__dirname, relativePath),
      environment: environment,
      role: lambdaRole,
      vpc,
      securityGroups: securityGroups,
      bundling: bundling,
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
    return alb;
  }
}
