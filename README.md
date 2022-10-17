# Ratatiedot Extranet

Ratatiedon Extranet is a service of the Finnish Railways Agency, which distributes track maintenance documents to internal and external stakeholders.

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
2. Node.js for server-side implementation
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

### Usage

- Run `npm run dev-server` to spin up server to serve API locally (http://localhost:8000)
- Run `npm run dev-client` to run React app locally (http://localhost:3000)
- Run `npm run dev` for full-stack development experience

### Build

### Pipeline

Bootstrap CDK for the AWS account, if that has not been done yet: `ENVIRONMENT=dev BRANCH=main cdk bootstrap`. ENVIRONMENT and BRANCH don't really matter here, but the stack requires you to set them.

In the pipeline deployment **AWS account** and **region** are set based on the AWS profile used to deploy the
pipeline - either use your cli default profile or specify the profile with --profile flag when deploying the pipeline.

There are three variables that determine how the pipeline and the application itself are deployed to the AWS Account. These variables are listed below in format [ENVIRONMENT VARIABLE] --> [deduced stack variable]

- **ENVIRONMENT --> env**: Required environment variable that determines stack **env**. Allowed values `dev` and `prod`. Determines the stack resource performance characteristics and also how other environment variables, BRANCH and STACK_ID work. Also sets removalPolicy for stack resources.
- **BRANCH --> branch**: Required environment variable that determines **branch** variable which controls from which Github branch source code is pulled for the deployment. The value must correspond to a branch that exists in Github repository. Note: If ENVIRONMENT is `prod`, the branch is always fixed to follow production branch and this environment variable is ignored. If ENVIRONMENT is anything else than `prod`, BRANCH must be given.
- **STACK_ID --> stackId**: Required environment variable that determines **stackId** which gives name to the stack and is basis for naming of the stack resources. Production branch and development main branch are special cases where the **STACK_ID** name must match with the **BRANCH**. The STACK_ID can only contain alphanumeric characters and hyphens.

Note! Naming of certain AWS resources must be globally unique, these resources in RataExtra Stack include S3 buckets. Current naming scheme does not support using the same stackId in multiple AWS Accounts. Using the same name will lead into naming collisions and thus deployment failure.

To set up a new pipeline, run the deployment script `pipeline:deploy` providing environment, branch and stackId as command line arguments with optionally also providing your AWS profile (here environment, branch and stackid correspond to variables explained above):

    npm run pipeline:deploy --environment=dev --branch=feature/RTENU-07-test --stackid=mytestbranch
    npm run pipeline:deploy --environment=dev --branch=feature/RTENU-07-test --stackid=mytestbranch -- --profile myFavouriteAWSProfile

The script will deploy CodePipeline, which will automatically set up the environment. The pipeline will automatically update itself and deploy any changes made to the app based on changes in the defined version control branch.

If you update the `pipeline:synth`-script name, you need to have the old script available for at least one commit in the followed branch or you have to rerun the deployment script by hand.

Note! A valid GitHub token with the scopes `admin:repo_hook, public_repo, repo:status, repo_deployment` is required to be had in AWS Secrets Manager. Refer to `./config/index.ts` for authenticationToken name to be set. Set the token as plaintext value.

Reference for pipeline setup: https://docs.aws.amazon.com/cdk/v2/guide/cdk_pipeline.html

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
