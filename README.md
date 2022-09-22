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
Run ` npm i`

To install a common dependency that both frontend and server can use, run command in the root repository:

```
npx lerna add *npm_package_name*
npx lerna add *npm _package_name* --dev
```

### Usage

```
npm run dev
```

### Build

### Testing

> ❕ We are in process of building automated testing/CI-pipeline. For now all tests needs to be run manually.

Running e2e/component tests with Cypress.

1. Start local server
```
npm run dev
```

2. Open Cypress GUI

```
npx cypress open
```

Cypress GUI app should open. Select tests you want to run.

Optionally you can open [cypress CLI](https://docs.cypress.io/guides/guides/command-line#How-to-run-commands) and run tests in commandline.

Cypress has has really good guides explaining how to use the framework.
🔗 [Cypress Guides](https://docs.cypress.io/guides/overview/why-cypress)


### Linting
