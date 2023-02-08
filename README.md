# RATATIETO

Ratatieto is an extranet service of the Finnish Railways Agency, which distributes track maintenance documents to internal and external stakeholders.

_(To-do: Demo link will be published here...)_

## Table of Content

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Rules](#rules)
- [Getting Started](#getting-started)

## Project Structure

- It is monorepo architecture
- Monorepo uses a single repository for the source code management version control system
- Monorepo standardizes styling, code and tooling accross the team

## Tech Stack:

In Ratatiedot Extranet, we use:

1. React for user interface
2. Lambda for server-side implementation
3. AWS services: Cognito, Lambda, IAM, CodePipeline, CodeBuild and CodeDeploy, CloudWatch _(To-do: other AWS services to be decided)_
4. [aws-cdk](https://github.com/aws/aws-cdk) for defining and managing infrastructure and CI/CD Pipeline
5. Typescript to enforce type-checking

## Rules

### Branch management and naming

Based on GitLab Flow (see: https://docs.gitlab.com/ee/topics/gitlab_flow.html). Feature branches are branched from `main`.

Feature branchers should be name with the following naming convention:
commit_type/project_code-issue_number-feature_descriptive_name
E.g. `feature/RTENU-12345-awesome-new-feature`
If there is no issue, skip that part.

### Commit naming

Conventional commits (see: https://www.conventionalcommits.org/en/v1.0.0/), with the addition of a ticketing issue (if applicable/available).
E.g.

```
feat(api)!: RTENU-12345 Awesome new feature
Remade API to be more awesome, but with breaking changes
```

### Pull request

Feature branches are to be merged to `main` via Pull Requests. Use squash merging by default. If you need to retain intermittent commits for some reason, use regular merging in such case.

Naming: commit_type: PROJECT_CODE-ISSUE_NUMBER Description
E.g. `feat: RTENU-12345 Awesome new feature`

## Getting started

### Installation

Check node version. You can use `nvm use` to automatically set the right version.

```
npm run bootstrap
```

Create `.env.development` file in server package and copy from `.env.example` to `.env.development`.

To install dependencies that only frontend or backend use, run command in the root repository:

```
npx lerna add <npm_package> [--dev] --scope=[frontend/server]
```

To install a common dependency that both frontend and server can use, run command in the root repository:

```
npm install <npm_package>
```

Install AWS SAM CLI
Example for MacOs with pre-installed brew, check https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html for further instructions and other platforms

```
brew tap aws/tap
brew install aws-sam-cli
```

Note! AWS SAM CLI requires Docker to run functions locally. If you are using a Docker Desktop alternative, remember to set DOCKER_HOST to env. MacOs example:

```
export DOCKER_HOST="unix://$HOME/.colima/docker.sock"
```

After installing SAM, you need to synth a separate rataextra stack locally to be invoked. Note that `handler-name` below is the name given to createNodejsLambda, e.g. dummy-handler. Replace `myFavouriteAWSProfile` with your AWS profile.

```
npm run local:synth
npm run sam:invoke --handler=handler-name --profile=myFavouriteAWSProfile
```

If you have not run the frontend build locally, synth might complain about no `packages/frontend/build`. In that case, you can either run the build script or manually add an empty `build` folder.

Each time you make code changes, you need to run synth. There's also a script that combines both

```
npm run sam:synthinvoke --handler=handler-name
```

As doing synth is a slower process, it's recommended to use basic `sam:invoke` whenever you can.

### Usage

- Run `npm run dev-client` to run React app locally (http://localhost:3000)

### Connecting to AWS dev environment

Install AWS CLI and Session Manager plugin. Example for MacOS:

```
brew install awscli
brew install --cask session-manager-plugin
```

Copy `.env.bastion.example` as `.env.bastion` and fill the parameters. Refresh your local AWS access credentials in ~/.aws/credentials (if you haven't done so already) and run

```
./bastion-backend-pipe.sh
```

This will set up a pipe to the bastion host using AWS SSM on localhost:3001. These are then piped to the ALB. If you get "Forbidden"-error, you need to refresh your credentials in `~/.aws/credentials`. For this to keep working, `bastion-backend-pipe.sh` locally needs to be up and running.

#### Connecting to AWS dev database

Do `.env.bastion` steps above if you have not done so already. Refresh local AWS credentials and run

```
./bastion-database-pipe.sh
```

This will set up a pipe to the bastion host using AWS SSM on localhost:5433. These are then piped to the DB. For this to keep working, `bastion-database-pipe.sh` locally needs to be up and running.

#### Connecting to feature ALB

Go to AWS console > EC2 > Select bastion instance > Connect > Session Manager > Connect
Run following script in the window that opens for the EC2:

```
sudo socat TCP4-LISTEN:81,reuseaddr,fork TCP:ALB_DNS:80
```

where you replace ALB_DNS with the DNS name of your ALB. You can get this from AWS console under EC2 > Load Balancers > Select your ALB > DNS name in the Description.

Once you have your connection set up, locally on your computer run

```
./bastion-feat-backend-pipe.sh
```

and then you can connect to bastion host using AWS SSM on localhost:3002. These are then piped to the feature ALB. For this to keep working, both the socat on the bastion and `bastion-feat-backend-pipe.sh` locally need to be up and running. If you need a connection working for a longer time, you can use nohup described under "Fixing socat problems" to have the connection be up for longer than your terminal session. In such case, use a different port to listen for and stop the process afterwards. If your session has terminated, you need to search for the process listening for your chosen port using `sudo lsof -i -P -n` and then use `sudo kill PID` where PID is the id of the process given by lsof that was listening to your chosen port.

Note! If someone else is also doing this, there might be a conflict with the port listening using socat ("Address already in use"). In such case, use a different port for socat instead of 81. In this case, you also need to update the "portNumber" value in `bastion-feat-backend-pipe.sh`.

### Create local database

install

```
npm install
```

compose database

```
docker-compose up
```

copy ´DATABASE_URL´ variable from ´/packages/server/.env.example´ to ´/packages/server/.env´

```
DATABASE_URL="postgresql://root:root@docker.internal:5432/test_db?schema=public"
```

> Here we use ´docker.internal´ as database IP. If you want to configure postgres parameters (e.g. port number) you can do it in ´docker.compose.yml´.

run migration

```
npm run local:db:migrate
```

If you get `sh: ./loadenv: Permission denied`, add execution rights to the file with `chmod 755 packages/server/loadenv`.

run database population

```
npm run local:db:populate
```

run synth

```
npm run local:synth
```

Optionally:
test lambda localy create-user

```
npm run sam:invoke --handler=create-user --profile=myFavouriteAWSProfile
```

where you replace `myFavouriteAWSProfile` with your AWS profile.

list-users

```
npm run sam:invoke --handler=list-users --profile=myFavouriteAWSProfile -- --log-file logs.txt
```

where you replace `myFavouriteAWSProfile` with your AWS profile.

Logs will be generated in logs.txt file

You can now remove generated logs.txt file

#### Updating local database

Whenever you add new tables of columns to the database, try add some test data to the packages/server/populate-local-db.sh. Rerun migration first. Also check that the populate-script still works after the changes.

#### Fixing socat problems

If for some reason socat is not working for a specific piping, you can set it up again by hand. Connect to the EC2 with SSM and run following after adding values as instructed below:

```
nohup sudo socat TCP4-LISTEN:LISTEN_PORT_TO_FIX,reuseaddr,fork TCP:DNS_TO_REDIRECT:PORT_TO_PIPE &
```

where `LISTEN_PORT_TO_FIX` is the port you want to listen on (e.g. 80), `DNS_TO_REDIRECT` is where you want to redirect to and `PORT_TO_PIPE` is port in the receiving end. With ALB, port is 80 for poth and DNS is the DNS of the ALB (check AWS console). For database, port is 5432 for both and DNS can be checked from Parameter Store.

### Build

### Pipeline

Bootstrap CDK for the AWS account, if that has not been done yet: `ENVIRONMENT=dev BRANCH=main cdk bootstrap`. ENVIRONMENT and BRANCH don't really matter here, but the stack requires you to set them.

In the pipeline deployment **AWS account** and **region** are set based on the AWS profile used to deploy the
pipeline - either use your cli default profile or specify the profile with --profile flag when deploying the pipeline.

There are three variables that determine how the pipeline and the application itself are deployed to the AWS Account. These variables are listed below in format [ENVIRONMENT VARIABLE] --> [deduced stack variable]

- **ENVIRONMENT --> env**: Required environment variable that determines stack **env**. Allowed values `dev`, `feat`, `local` and `prod`. Determines the stack resource performance characteristics and also how other environment variables, BRANCH and STACK_ID work. Also sets removalPolicy for stack resources. Use `feat` for any feature branches while `local` is only for local development. `dev`and `prod` are to be used for only specific, permanent environments.
- **BRANCH --> branch**: Required environment variable that determines **branch** variable which controls from which Github branch source code is pulled for the deployment. The value must correspond to a branch that exists in Github repository. Note: If ENVIRONMENT is `prod`, the branch is always fixed to follow production branch and this environment variable is ignored. If ENVIRONMENT is anything else than `prod`, BRANCH must be given.
- **STACK_ID --> stackId**: Required environment variable that determines **stackId** which gives name to the stack and is basis for naming of the stack resources. Production branch and development main branch are special cases where the **STACK_ID** name must match with the **BRANCH**. The STACK_ID can only contain alphanumeric characters and hyphens.

Note! Naming of certain AWS resources must be globally unique, these resources in RataExtra Stack include S3 buckets. Current naming scheme does not support using the same stackId in multiple AWS Accounts. Using the same name will lead into naming collisions and thus deployment failure.

To set up a new pipeline, run the deployment script `pipeline:deploy` providing environment, branch and stackId as command line arguments with optionally also providing your AWS profile (here environment, branch and stackid correspond to variables explained above):

    npm run pipeline:deploy --environment=feat --branch=feature/RTENU-07-test --stackid=mytestbranch
    npm run pipeline:deploy --environment=feat --branch=feature/RTENU-07-test --stackid=mytestbranch -- --profile myFavouriteAWSProfile

The script will deploy CodePipeline, which will automatically set up the environment. You need to have the changes pushed to GitHub for the pipeline to work. Once set up, the pipeline will automatically update itself and deploy any changes made to the app when commits are pushed to the branch defined in deploy. You can access pipeline resources through the bastion host. See "Connecting to feature ALB".

If you update the `pipeline:synth`-script name, you need to have the old script available for at least one commit in the followed branch or you have to rerun the deployment script by hand.

Note! A valid GitHub token with the scopes `admin:repo_hook, public_repo, repo:status, repo_deployment` is required to be had in AWS Secrets Manager. Set the token as plaintext value. New expired date is set in the next 1 year. In order to give sufficient permission to your Github token, you may need to edit your pipeline in AWS CodePipeline (e.g. stage Source), connect and grant the authorization right of your Github account.

Note! You need Docker installed on your computer for synth and deploy to work.

Reference for pipeline setup: https://docs.aws.amazon.com/cdk/v2/guide/cdk_pipeline.html

#### Parameter Store

Add following values to Parameter Store for permanent environments:

- **rataextra-cloudfront-certificate-arn**: ARN for the SSL Certificate used by CloudFront. Certificate needs have been added to ACM us-east-1 region before this value can be used. E.g. arn:aws:acm:us-east-1:123456789:certificate/123-456-789-0ab
- **rataextra-cloudfront-domain-name**: Domain name for the certificate above. E.g. test.example.com
- **rataextra-dmz-api-domain-name**: Domain name for the /api redirection. E.g. test-dmz.example.com
- **rataextra-database-domain**: Database domain name. E.g. db.test.amazonaws.com
- **rataextra-database-name**: Database name. E.g. test-database
- **rataextra-rdspg13-rataextradev-password**: Database password. Note! SecureString. E.g. cat123
- **rataextra-jwt-token-issuer**: Issuer url. E.g. https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_cAt
- **rataextra-cloudfront-signer-public-key**: Public RSA key used for signing CloudFront calls. E.g. -----BEGIN PUBLIC KEY-----\nstuff\n-----END PUBLIC KEY-----
- **rataextra-cloudfront-signer-private-key**: Private RSA key used for signing CloudFront calls. Note! SecureString. E.g. -----BEGIN RSA PRIVATE KEY-----\nsecretstuff\n-----END RSA PRIVATE KEY-----
- **rataextra-alfresco-api-key**: API Key for Alfresco API service, type: SecureString
- **rataextra-alfresco-api-url**: URL for Alfresco API service
- **rataextra-alfresco-ancestor**: Root folder name in Alfresco

### Backend development

Cache any async content that doesn't change often to speed up lambda running tie on subsequent runs. This can be done by setting the value with let above the handler function and then checking if it has a value or not and fetching a new value only if it is missing.

#### Authorization

Use `utils/userService.ts` to first get `user` and then use an applicable role check validation function. All functions outside of frontend cookie creation function should have applicable authorization. Minimum is to check if they have read rights. Wrap checks in try-catches, as they will throw if the user is not authorized. This should be done first thing in the handler-function.

#### Logging

Use `utils/logger.ts`. Whenever possible, pass `user` to get the UID. A info-level log should be done with user attached after authorizing the user at the beginning of a lambda function. Use error-level for any catch-blocks. In these cases, you usually don't have user, but do log that if it's available. If any changes are made to the system/databases/etc., also add an `auditLog`-line describing the action from logger. These _must_ have the user. As these logs are mixed in with technical logs, they can be used in place of normal logging when logging changes made. Errors etc. should still use normal logging.

### Testing

> ❕ We are in process of building automated testing/CI-pipeline. For now all tests needs to be run manually.

Running e2e/component tests with Cypress.

1. Start local server

```
npm run dev
```

2. Open Cypress GUI

```
npm run cy:open
```

Cypress GUI app should open. Select tests you want to run.

Optionally you can open [cypress CLI](https://docs.cypress.io/guides/guides/command-line#How-to-run-commands) and run tests in commandline.

Cypress has has really good guides explaining how to use the framework.
🔗 [Cypress Guides](https://docs.cypress.io/guides/overview/why-cypress)

3. Run tests in CLI

Recorded video is exported to videos folder.

```
npm run cy:run
```

### Linting

### Accessibility

Using `eslint-plugin-jsx-a11y` library to catch accessibility issues early on.

It is highly recommended to install and run accessibility tests using axe (https://www.deque.com/axe/) browser extension.
