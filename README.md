# RATATIETO

Ratatieto is an extranet service of the Finnish Railways Agency, which distributes track maintenance documents to internal and external stakeholders.

_(To-do: Demo link will be published here...)_

## Table of Contents

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
3. AWS services: Cognito, Lambda, S3, ALB, IAM, CodePipeline, CodeBuild and CodeDeploy, CloudWatch _(To-do: other AWS services to be decided)_
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

Feature branches are to be merged to `main` via Pull Requests. Use squash merging by default. If you need to retain intermittent commits for some reason, use regular merging in such case. All PRs to `prod` should use merge commit.

Naming: commit_type: PROJECT_CODE-ISSUE_NUMBER Description
E.g. `feat: RTENU-12345 Awesome new feature`

### Linting

## Getting started

### Prerequisites

**AWS SAM CLI**

Example for MacOs with pre-installed brew, check https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html for further instructions and other platforms

```
brew tap aws/tap
brew install aws-sam-cli
```

**Note! AWS SAM CLI requires Docker to run functions locally. If you are using a Docker Desktop alternative, remember to set DOCKER_HOST to env. MacOs example:**

```
export DOCKER_HOST="unix://$HOME/.colima/docker.sock"
```

**AWS CLI & Session Manager plugin**

Install AWS CLI and Session Manager plugin. Example for MacOS:

```
brew install awscli
brew install --cask session-manager-plugin
```

For other platforms, please see https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html and https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html

### Installation

Check node version. You can use `nvm use` to automatically set the right version.

To bootstrap the project, run:

```
npm run bootstrap
```

Create `.env` file in server package and copy from `.env.example` to `.env`.

To install dependencies that only frontend or backend use, run command in the root repository:

```
npx lerna add <npm_package> [--dev] --scope=[frontend/server]
```

To install a common dependency that both frontend and server can use, run command in the root repository:

```
npm install <npm_package>
```

## Usage

For detailed examples on how to setup and run the application, please refer to package-specific readmes:

- [frontend](./packages/frontend/README.md)
- [backend](./packages/server/README.md)

## Troubleshooting

If Husky's pre-commit hook fails to use nvm with the following error when using VS Code's integrated source control:

```
> git -c user.useConfigOnly=true commit --quiet --allow-empty-message --file -
.husky/pre-commit: line 4: npx: command not found
husky - pre-commit hook exited with code 127 (error)
```

It can be fixed by using `~/.huskyrc` to load the necessary stuff before running the hook:

```sh
# ~/.huskyrc
# This loads nvm.sh and sets the correct PATH before running hook
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```
