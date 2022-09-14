# Ratatiedot Extranet

Ratatiedon Extranet is a service of the Finnish Railways Agency, which distributes track maintenance documents to internal and external stakeholders.

_(To-do: Demo link will be published here...)_

## Table of Content

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Way of Working](#way-of-working)
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

## Way of Working

### Branch naming conventions

- _(To-do: integration between Github and Jira issues)_

### Commit message conventions

- Follow [The Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and install [command line tool](http://commitizen.github.io/cz-cli/#making-your-repo-commitizen-friendly)
- Run `git cz` instead of `git commit`

### Pull request and merging conventions

- By default for all commit types, use standard merge to keep commit history
- For `fix` and `hot-fix`: it's recommended to squash and merge

## Getting started

### Installation

```
npm run prepare
```

### Usage

### Build

### Testing

### Linting
