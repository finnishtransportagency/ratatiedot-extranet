import { aws_elasticloadbalancingv2, Duration, NestedStack, NestedStackProps, Tags } from 'aws-cdk-lib';
import { IVpc, ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Role, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Construct } from 'constructs';
import {
  RataExtraEnvironment,
  SSM_DATABASE_DOMAIN,
  SSM_DATABASE_NAME,
  SSM_DATABASE_PASSWORD,
  ESM_REQUIRE_SHIM,
} from './config';
import { NodejsFunction, BundlingOptions, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { ListenerAction, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { join } from 'path';
import { isPermanentStack, isFeatOrLocalStack } from './utils';
import { RataExtraBastionStack } from './rataextra-bastion';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { IAutoScalingGroup, AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import { RatatietoNodeBackendConstruct, RatatietoNodeBackendStack } from './rataextra-node-backend';

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
  readonly mockUid?: string;
  readonly alfrescoSitePath: string;
}

type ListenerTargetLambdas = {
  lambda: NodejsFunction;
  /** Must be a unique integer for each. Lowest number is prioritized. */
  priority: number;
  path: string[];
  httpRequestMethods: string[];
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
}

interface GeneralLambdaParameters {
  rataExtraStackIdentifier: string;
  lambdaRole: Role;
  vpc: IVpc;
  securityGroups?: ISecurityGroup[];
  /** Environment variables to be passed to the function */
  environment?: Record<string, string>;
  bundling?: BundlingOptions;
  initialPolicy: PolicyStatement[];
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
      mockUid,
      alfrescoSitePath,
    } = props;

    const securityGroups = securityGroup ? [securityGroup] : undefined;

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
        `arn:aws:ssm:${this.region}:${this.account}:parameter/${alfrescoSitePath}`,
      ],
    });

    const kmsDecryptPolicy = new PolicyStatement({
      actions: ['kms:Decrypt'],
      resources: [`arn:aws:kms:${this.region}:${this.account}:aws/ssm`],
    });
    // Basic Lambda configs
    // ID and VPC should not be changed
    // Role and SG might need to be customized per Lambda
    const genericLambdaParameters: GeneralLambdaParameters = {
      rataExtraStackIdentifier: rataExtraStackIdentifier,
      vpc: applicationVpc,
      lambdaRole: lambdaServiceRole,
      securityGroups: securityGroups,
      environment: {
        JWT_TOKEN_ISSUER: jwtTokenIssuer,
        STACK_ID: stackId,
        ENVIRONMENT: rataExtraEnv,
        LOG_LEVEL: isFeatOrLocalStack(rataExtraEnv) ? 'debug' : 'info',
        MOCK_UID: mockUid || '',
      },
      initialPolicy: [],
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
      initialPolicy: [ssmDatabaseParameterPolicy, kmsDecryptPolicy],
    };

    const alfrescoParameters: GeneralLambdaParameters = {
      ...genericLambdaParameters,
      environment: {
        ...genericLambdaParameters.environment,
        ALFRESCO_API_KEY_NAME: alfrescoAPIKey,
        ALFRESCO_API_URL: alfrescoAPIUrl,
        ALFRESCO_ANCESTOR: alfrescoAncestor,
        ALFRESCO_SITE_PATH: alfrescoSitePath,
      },
      initialPolicy: [ssmAlfrescoParameterPolicy, kmsDecryptPolicy],
    };

    const prismaAlfrescoCombinedParameters: GeneralLambdaParameters = {
      ...prismaParameters,
      ...alfrescoParameters,
      environment: {
        ...prismaParameters.environment,
        ...alfrescoParameters.environment,
      },
      initialPolicy: [...prismaParameters.initialPolicy, ...alfrescoParameters.initialPolicy],
    };

    const dummy2Fn = this.createNodejsLambda({
      ...genericLambdaParameters,
      name: 'dummy2-handler',
      relativePath: '../packages/server/lambdas/dummy2.ts',
    });

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
      ...prismaAlfrescoCombinedParameters,
      name: 'alfresco-search',
      relativePath: '../packages/server/lambdas/alfresco/search.ts',
    });

    const alfrescoListFiles = this.createNodejsLambda({
      ...prismaAlfrescoCombinedParameters,
      name: 'alfresco-list-files',
      relativePath: '../packages/server/lambdas/alfresco/list-files.ts',
    });

    const alfrescoUploadFile = this.createNodejsLambda({
      ...prismaAlfrescoCombinedParameters,
      name: 'alfresco-upload-file',
      timeout: Duration.minutes(2),
      relativePath: '../packages/server/lambdas/alfresco/upload-file.ts',
    });

    const alfrescoUpdateFile = this.createNodejsLambda({
      ...prismaAlfrescoCombinedParameters,
      name: 'alfresco-update-file',
      relativePath: '../packages/server/lambdas/alfresco/update-file.ts',
    });

    const alfrescoUpdateFileMetadata = this.createNodejsLambda({
      ...prismaAlfrescoCombinedParameters,
      name: 'alfresco-update-file-metadata',
      relativePath: '../packages/server/lambdas/alfresco/update-file-metadata.ts',
    });

    const alfrescoDeleteFile = this.createNodejsLambda({
      ...prismaAlfrescoCombinedParameters,
      name: 'alfresco-delete-file',
      relativePath: '../packages/server/lambdas/alfresco/delete-file.ts',
    });

    const alfrescoCreateFolder = this.createNodejsLambda({
      ...prismaAlfrescoCombinedParameters,
      name: 'alfresco-create-folder',
      relativePath: '../packages/server/lambdas/alfresco/create-folder.ts',
    });

    const alfrescoUpdateFolder = this.createNodejsLambda({
      ...prismaAlfrescoCombinedParameters,
      name: 'alfresco-update-folder',
      relativePath: '../packages/server/lambdas/alfresco/update-folder.ts',
    });

    const alfrescoDeleteFolder = this.createNodejsLambda({
      ...prismaAlfrescoCombinedParameters,
      name: 'alfresco-delete-folder',
      relativePath: '../packages/server/lambdas/alfresco/delete-folder.ts',
    });

    const getComponents = this.createNodejsLambda({
      ...prismaAlfrescoCombinedParameters,
      name: 'get-components',
      relativePath: '../packages/server/lambdas/alfresco/list-components.ts',
    });

    const getNodesById = this.createNodejsLambda({
      ...prismaAlfrescoCombinedParameters,
      name: 'get-nodes',
      relativePath: '../packages/server/lambdas/alfresco/list-nodes.ts',
    });

    const dbGetPageContents = this.createNodejsLambda({
      ...prismaParameters,
      name: 'db-get-page-contents',
      relativePath: '../packages/server/lambdas/database/get-page-contents.ts',
    });

    const dbEditPageContents = this.createNodejsLambda({
      ...prismaParameters,
      name: 'db-edit-page-contents',
      relativePath: '../packages/server/lambdas/database/edit-page-contents.ts',
    });

    const checkUserRightOnPageContents = this.createNodejsLambda({
      ...prismaParameters,
      name: 'check-user-right',
      relativePath: '../packages/server/lambdas/database/check-user-right.ts',
    });

    const dbGetFavoritePages = this.createNodejsLambda({
      ...prismaParameters,
      name: 'db-get-favorite-pages',
      relativePath: '../packages/server/lambdas/database/get-favorite-pages.ts',
    });

    const dbPostFavoritePage = this.createNodejsLambda({
      ...prismaParameters,
      name: 'db-post-favorite-page',
      relativePath: '../packages/server/lambdas/database/post-favorite-page.ts',
    });

    const dbDeleteFavoritePage = this.createNodejsLambda({
      ...prismaParameters,
      name: 'db-delete-favorite-page',
      relativePath: '../packages/server/lambdas/database/delete-favorite-page.ts',
    });

    // Add all lambdas here to add as alb targets. Alb forwards requests based on path starting from smallest numbered priority
    // Keep list in order by priority. Don't reuse priority numbers
    const lambdas: ListenerTargetLambdas[] = [
      { lambda: dummy2Fn, priority: 10, path: ['/api/test'], httpRequestMethods: ['GET'], targetName: 'dummy2' },
      {
        lambda: returnLogin,
        priority: 50,
        path: ['/api/return-login'],
        httpRequestMethods: ['GET'],
        targetName: 'returnLogin',
      },
      // Alfresco service will reserve 100-150th priority
      {
        lambda: alfrescoSearch,
        priority: 100,
        path: ['/api/alfresco/search'],
        httpRequestMethods: ['POST'],
        targetName: 'alfrescoSearch',
      },
      {
        lambda: alfrescoListFiles,
        priority: 110,
        path: ['/api/alfresco/files'],
        httpRequestMethods: ['GET'],
        targetName: 'alfrescoListFiles',
      },
      {
        lambda: alfrescoUploadFile,
        priority: 120,
        path: ['/api/alfresco/file/*'],
        httpRequestMethods: ['POST'],
        targetName: 'alfrescoUploadFile',
      },
      {
        lambda: alfrescoCreateFolder,
        priority: 125,
        path: ['/api/alfresco/folder/*'],
        httpRequestMethods: ['POST'],
        targetName: 'alfrescoCreateFolder',
      },
      {
        lambda: alfrescoUpdateFile,
        priority: 130,
        path: ['/api/alfresco/file/*/content'],
        httpRequestMethods: ['PUT'],
        targetName: 'alfrescoUpdateFile',
      },
      {
        lambda: alfrescoUpdateFileMetadata,
        priority: 132,
        path: ['/api/alfresco/file/*'],
        httpRequestMethods: ['PUT'],
        targetName: 'alfrescoUpdateFileMetadata',
      },
      {
        lambda: alfrescoUpdateFolder,
        priority: 134,
        path: ['/api/alfresco/folder/*'],
        httpRequestMethods: ['PUT'],
        targetName: 'alfrescoUpdateFolder',
      },
      {
        lambda: alfrescoDeleteFile,
        priority: 140,
        path: ['/api/alfresco/file/*'],
        httpRequestMethods: ['DELETE'],
        targetName: 'alfrescoDeleteFile',
      },
      {
        lambda: alfrescoDeleteFolder,
        priority: 142,
        path: ['/api/alfresco/folder/*'],
        httpRequestMethods: ['DELETE'],
        targetName: 'alfrescoDeleteFolder',
      },
      {
        lambda: getNodesById,
        priority: 144,
        path: ['/api/alfresco/nodes/*'],
        httpRequestMethods: ['GET'],
        targetName: 'getNodesById',
      },
      {
        lambda: dbGetPageContents,
        priority: 200,
        path: ['/api/database/page-contents/*'],
        httpRequestMethods: ['GET'],
        targetName: 'dbGetPageContents',
      },
      {
        lambda: dbEditPageContents,
        priority: 205,
        path: ['/api/database/page-contents/*'],
        httpRequestMethods: ['PUT'],
        targetName: 'dbEditPageContents',
      },
      {
        lambda: checkUserRightOnPageContents,
        priority: 210,
        path: ['/api/database/user-right'],
        httpRequestMethods: ['GET'],
        targetName: 'checkUserRightOnPageContents',
      },
      {
        lambda: getComponents,
        priority: 220,
        path: ['/api/database/components/*'],
        httpRequestMethods: ['GET'],
        targetName: 'getComponents',
      },
      {
        lambda: dbGetFavoritePages,
        priority: 230,
        path: ['/api/database/favorites'],
        httpRequestMethods: ['GET'],
        targetName: 'dbGetFavoritePages',
      },
      {
        lambda: dbPostFavoritePage,
        priority: 235,
        path: ['/api/database/favorites'],
        httpRequestMethods: ['POST'],
        targetName: 'dbPostFavoritePage',
      },
      {
        lambda: dbDeleteFavoritePage,
        priority: 240,
        path: ['/api/database/favorites'],
        httpRequestMethods: ['DELETE'],
        targetName: 'dbDeleteFavoritePage',
      },
    ];

    // ALB for API
    const alb = this.createlAlb({
      rataExtraStackIdentifier: rataExtraStackIdentifier,
      name: 'api',
      vpc: applicationVpc,
      listenerTargets: lambdas,
      securityGroup,
    });

    const nodeBackend = new RatatietoNodeBackendConstruct(this, 'NodeBackend', {
      vpc: applicationVpc,
      listener: alb.listener,
    });

    if (isPermanentStack(stackId, rataExtraEnv)) {
      const bastionStack = new RataExtraBastionStack(this, 'stack-bastion', {
        rataExtraEnv,
        albDns: alb.alb.loadBalancerDnsName,
        databaseDns: databaseDomain,
        stackId: stackId,
        vpc: applicationVpc,
        securityGroup: securityGroup,
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
    timeout = Duration.seconds(30),
    runtime = Runtime.NODEJS_16_X,
    logRetention = RetentionDays.SIX_MONTHS,
    handler = 'handleRequest',
    environment = {},
    bundling = {},
    initialPolicy,
  }: LambdaParameters) {
    return new NodejsFunction(this, name, {
      functionName: `lambda-${rataExtraStackIdentifier}-${name}`,
      memorySize: memorySize,
      timeout: timeout,
      // Accepts only Nodejs runtimes
      runtime: runtime,
      logRetention,
      handler: handler,
      entry: join(__dirname, relativePath),
      environment: environment,
      role: lambdaRole,
      vpc,
      securityGroups: securityGroups,
      bundling: bundling,
      initialPolicy,
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

    listenerTargets.map((target) =>
      listener.addTargets(`Target-${target.targetName}`, {
        targets: [new LambdaTarget(target.lambda)],
        priority: target.priority,
        conditions: [
          ListenerCondition.pathPatterns(target.path),
          ListenerCondition.httpRequestMethods(target.httpRequestMethods),
        ],
      }),
    );

    return { alb, listener };
  }
}
