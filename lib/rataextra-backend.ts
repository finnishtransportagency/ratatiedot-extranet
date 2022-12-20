import { aws_elasticloadbalancingv2, Duration, NestedStack, NestedStackProps, Tags } from 'aws-cdk-lib';
import { IVpc, ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Role, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Construct } from 'constructs';
import {
  RataExtraEnvironment,
  SSM_DATABASE_DOMAIN,
  SSM_DATABASE_NAME,
  SSM_DATABASE_PASSWORD,
  ESM_REQUIRE_SHIM,
  SSM_ALFRESCO_API_KEY,
  SSM_ALFRESCO_API_URL,
} from './config';
import { NodejsFunction, BundlingOptions, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { ListenerAction, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as path from 'path';
import { isDevelopmentMainStack, isLocalStack } from './utils';
import { RataExtraBastionStack } from './rataextra-bastion';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

interface ResourceNestedStackProps extends NestedStackProps {
  readonly rataExtraStackIdentifier: string;
  readonly rataExtraEnv: RataExtraEnvironment;
  readonly stackId: string;
  readonly lambdaServiceRole: Role;
  readonly applicationVpc: IVpc;
  readonly securityGroup?: ISecurityGroup;
  readonly databaseDomain?: string;
  readonly cloudfrontDomainName?: string;
  readonly tags: { [key: string]: string };
  readonly jwtTokenIssuer: string;
  readonly alfrescoAPIKey: string;
  readonly alfrescoAPIUrl: string;
  readonly alfrescoAncestor: string;
}

type ListenerTargetLambdas = {
  lambda: NodejsFunction;
  /** Must be a unique integer for each. Lowest number is prioritized. */
  priority: number;
  path: [string];
  /** Must be a unique string for each. Don't reuse names across different lambdas. */
  targetName: string;
};

interface LambdaParameters extends GeneralLambdaParameters {
  name: string;
  /** Relative path from declaring file to the lambda function file */
  relativePath: string;
  memorySize?: number;
  timeout?: Duration;
  runtime?: Runtime;
  logRetention?: RetentionDays;
  /** Name of the function to be called */
  handler?: string;
  environment?: Record<string, string>;
  bundling?: BundlingOptions;
}

interface GeneralLambdaParameters {
  rataExtraStackIdentifier: string;
  lambdaRole: Role;
  vpc: IVpc;
  securityGroups?: ISecurityGroup[];
  /** Environment variables to be passed to the function */
  environment?: Record<string, string>;
  bundling?: BundlingOptions;
}

export class RataExtraBackendStack extends NestedStack {
  constructor(scope: Construct, id: string, props: ResourceNestedStackProps) {
    super(scope, id, props);
    const {
      rataExtraEnv,
      stackId,
      rataExtraStackIdentifier,
      lambdaServiceRole,
      applicationVpc,
      securityGroup,
      databaseDomain,
      cloudfrontDomainName,
      tags,
      jwtTokenIssuer,
      alfrescoAPIKey,
      alfrescoAPIUrl,
      alfrescoAncestor,
    } = props;

    const securityGroups = securityGroup ? [securityGroup] : undefined;

    // Basic Lambda configs
    // ID and VPC should not be changed
    // Role and SG might need to be customized per Lambda
    const genericLambdaParameters: GeneralLambdaParameters = {
      rataExtraStackIdentifier: rataExtraStackIdentifier,
      vpc: applicationVpc,
      lambdaRole: lambdaServiceRole,
      securityGroups: securityGroups,
      environment: { JWT_TOKEN_ISSUER: jwtTokenIssuer, STACK_ID: stackId, ENVIRONMENT: rataExtraEnv },
    };

    const prismaParameters: GeneralLambdaParameters = {
      ...genericLambdaParameters,
      environment: {
        ...genericLambdaParameters.environment,
        SSM_DATABASE_NAME_ID: SSM_DATABASE_NAME,
        SSM_DATABASE_DOMAIN_ID: SSM_DATABASE_DOMAIN,
        SSM_DATABASE_PASSWORD_ID: SSM_DATABASE_PASSWORD,
        DATABASE_URL: '',
      },
      bundling: {
        nodeModules: ['prisma', '@prisma/client'],
        forceDockerBundling: !isLocalStack(rataExtraEnv),
        format: OutputFormat.ESM,
        target: 'node16',
        mainFields: ['module', 'main'],
        esbuildArgs: {
          '--conditions': 'module',
        },
        banner: ESM_REQUIRE_SHIM, // Workaround for ESM problem. https://github.com/evanw/esbuild/pull/2067#issuecomment-1073039746
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
              'npx prisma generate',
              'rm -rf node_modules/@prisma/engines',
              'rm -rf node_modules/@prisma/client/node_modules node_modules/.bin node_modules/prisma',
            ];
          },
        },
      },
    };

    const alfrescoParameters: GeneralLambdaParameters = {
      ...genericLambdaParameters,
      environment: {
        ...genericLambdaParameters.environment,
        ALFRESCO_API_KEY: alfrescoAPIKey,
        ALFRESCO_API_URL: alfrescoAPIUrl,
        ALFRESCO_ANCESTOR: alfrescoAncestor,
      },
    };

    const prismaAlfrescoCombinedParameters: GeneralLambdaParameters = {
      ...prismaParameters,
      ...alfrescoParameters,
      environment: {
        ...prismaParameters.environment,
        ...alfrescoParameters.environment,
      },
    };

    const ssmDatabaseParameterPolicy = new PolicyStatement({
      actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:DescribeParameters'],
      resources: [
        `arn:aws:ssm:${this.region}:${this.account}:parameter/${SSM_DATABASE_DOMAIN}`,
        `arn:aws:ssm:${this.region}:${this.account}:parameter/${SSM_DATABASE_NAME}`,
        `arn:aws:ssm:${this.region}:${this.account}:parameter/${SSM_DATABASE_PASSWORD}`,
      ],
    });

    const ssmAlfrescoParameterPolicy = new PolicyStatement({
      actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:DescribeParameters'],
      resources: [
        `arn:aws:ssm:${this.region}:${this.account}:parameter/${alfrescoAPIKey}`,
        `arn:aws:ssm:${this.region}:${this.account}:parameter/${SSM_ALFRESCO_API_KEY}`,
        `arn:aws:ssm:${this.region}:${this.account}:parameter/${SSM_ALFRESCO_API_URL}`,
      ],
    });

    const ksmDecryptPolicy = new PolicyStatement({
      actions: ['kms:Decrypt'],
      resources: [`arn:aws:kms:${this.region}:${this.account}:aws/ssm`],
    });

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
      relativePath: '../packages/server/lambdas/database/create-user.ts',
    });

    const listUsers = this.createNodejsLambda({
      ...prismaParameters,
      name: 'list-users',
      relativePath: '../packages/server/lambdas/database/list-users.ts',
    });

    createUser.role?.attachInlinePolicy(
      new Policy(this, 'createUserParametersPolicy', {
        statements: [ssmDatabaseParameterPolicy, ksmDecryptPolicy],
      }),
    );

    listUsers.role?.attachInlinePolicy(
      new Policy(this, 'listUsersParametersPolicy', {
        statements: [ssmDatabaseParameterPolicy, ksmDecryptPolicy],
      }),
    );
    const returnLogin = this.createNodejsLambda({
      ...genericLambdaParameters,
      environment: {
        ...genericLambdaParameters.environment,
        CLOUDFRONT_DOMAIN_NAME: cloudfrontDomainName || '',
      },
      name: 'return-login',
      relativePath: '../packages/server/lambdas/return-login.ts',
    });

    const alfrescoSearch = this.createNodejsLambda({
      ...alfrescoParameters,
      name: 'alfresco-search',
      relativePath: '../packages/server/lambdas/alfresco/search.ts',
    });

    const alfrescoListFiles = this.createNodejsLambda({
      ...prismaAlfrescoCombinedParameters,
      name: 'alfresco-list-files',
      relativePath: '../packages/server/lambdas/alfresco/list-files.ts',
    });

    // TODO: Make this a part of createNodejsLambda
    alfrescoSearch.role?.attachInlinePolicy(
      new Policy(this, 'alfrescoListFilesPermissionPolicy', {
        statements: [ssmDatabaseParameterPolicy, ssmAlfrescoParameterPolicy, ksmDecryptPolicy],
      }),
    );

    // TODO: Add Policy
    const dbGetPageContents = this.createNodejsLambda({
      ...prismaParameters,
      name: 'db-get-page-contents',
      relativePath: '../packages/server/lambdas/database/get-page-contents.ts',
    });

    alfrescoListFiles.role?.attachInlinePolicy(
      new Policy(this, 'alfresoListFilesPermissionPolicy', {
        statements: [ssmDatabaseParameterPolicy, ssmAlfrescoParameterPolicy, ksmDecryptPolicy],
      }),
    );

    alfrescoSearch.role?.attachInlinePolicy(
      new Policy(this, 'alfrescoParametersPolicy', {
        statements: [ssmAlfrescoParameterPolicy, ksmDecryptPolicy],
      }),
    );

    // Add all lambdas here to add as alb targets. Alb forwards requests based on path starting from smallest numbered priority
    // Keep list in order by priority. Don't reuse priority numbers
    const lambdas: ListenerTargetLambdas[] = [
      { lambda: dummy2Fn, priority: 10, path: ['/api/test'], targetName: 'dummy2' },
      { lambda: listUsers, priority: 20, path: ['/api/users'], targetName: 'listUsers' },
      { lambda: createUser, priority: 30, path: ['/api/create-user'], targetName: 'createUser' },
      { lambda: returnLogin, priority: 50, path: ['/api/return-login'], targetName: 'returnLogin' },
      // Alfresco service will reserve 100-150th priority
      { lambda: alfrescoSearch, priority: 100, path: ['/api/alfresco/search'], targetName: 'alfrescoSearch' },
      { lambda: alfrescoListFiles, priority: 110, path: ['/api/alfresco/list-files'], targetName: 'alfrescoListFiles' },
      {
        lambda: dbGetPageContents,
        priority: 200,
        path: ['/api/database/get-page-contents'],
        targetName: 'dbGetPageContents',
      },
      { lambda: dummyFn, priority: 1000, path: ['/*'], targetName: 'dummy' },
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
      const bastionStack = new RataExtraBastionStack(this, 'stack-bastion', {
        rataExtraEnv,
        albDns: alb.loadBalancerDnsName,
        databaseDns: databaseDomain,
      });
      Object.entries(tags).forEach(([key, value]) => Tags.of(bastionStack).add(key, value));
    }
  }

  private createNodejsLambda({
    rataExtraStackIdentifier,
    name,
    lambdaRole,
    relativePath,
    vpc,
    securityGroups,
    memorySize = 1024,
    timeout = Duration.seconds(15),
    runtime = Runtime.NODEJS_16_X,
    logRetention = RetentionDays.SIX_MONTHS,
    handler = 'handleRequest',
    environment = {},
    bundling = {},
  }: LambdaParameters) {
    return new NodejsFunction(this, name, {
      functionName: `lambda-${rataExtraStackIdentifier}-${name}`,
      memorySize: memorySize,
      timeout: timeout,
      // Accepts only Nodejs runtimes
      runtime: runtime,
      logRetention,
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

    const targets = listenerTargets.map((target) =>
      listener.addTargets(`Target-${target.targetName}`, {
        targets: [new LambdaTarget(target.lambda)],
        priority: target.priority,
        conditions: [ListenerCondition.pathPatterns(target.path)],
      }),
    );
    return alb;
  }
}
