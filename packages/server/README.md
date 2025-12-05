# RATATIETO Backend

## Setting up AWS SAM & running locally

After installing SAM and other prerequisites, you need to synth a separate rataextra stack locally to be invoked. Note that `handler-name` below is the name given to createNodejsLambda, e.g. dummy-handler. Replace `myFavouriteAWSProfile` with your AWS profile.

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

### Connecting to AWS dev environment

Copy `.env.bastion.example` as `.env.bastion` and fill the parameters. Refresh your local AWS access credentials in ~/.aws/credentials (if you haven't done so already) and run

```
./bastion-backend-pipe.sh
```

This will set up a pipe to the bastion host using AWS SSM on localhost:3001. These are then piped to the ALB. If you get "Forbidden"-error, you need to refresh your credentials in `~/.aws/credentials`. For this to keep working, `bastion-backend-pipe.sh` locally needs to be up and running.

#### Connecting to dev/prod database

Do `.env.bastion` steps above if you have not done so already. Refresh local AWS credentials and run

```
./bastion-database-pipe.sh
```

This will set up a pipe to the bastion host using AWS SSM on localhost:5433. These are then piped to the DB. For this to keep working, `bastion-database-pipe.sh` locally needs to be up and running.

> [!NOTE]
> If you have configured `.env.bastion` file with desired bastion `﻿INSTANCE_ID` and aws `PROFILE`, updated your AWS credentials in `~/.aws/credentials` file and have correct database credentials in `/packages/server/.env` file but still are not able to connect to desired database through bastion host, check that `nohup socat` process is running in the instance. You can use AWS EC2 console to login to bastion host terminal.
>
> - login to bastion host terminal and list all running processes `sudo lsof -i -P -n`
>   - see if process listening port `*:5432` is in the list
> - If not, run following command with database DNS address copied from Parameter Store
>
> `nohup socat TCP4-LISTEN:5432,reuseaddr,fork TCP:{DATABASE_DNS}:5432 &`

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

You can inspect/edit local database using [prisma studio](https://www.prisma.io/studio)

```
cd packages/server && npx prisma studio
```

run local database migration

```
npm run local:db:migrate
```

If you get `sh: ./loadenv: Permission denied`, add execution rights to the file with `chmod 755 packages/server/loadenv`.

seed local database

```
npx prisma db seed
```

run cdk synth locally

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

Whenever you add new tables of columns to the database, try add some test data to the packages/server/prisma/seed.ts. Rerun migration first. Also check that the eed-script still works after the changes.

### Fixing socat problems

If for some reason socat is not working for a specific piping, you can set it up again by hand. Connect to the EC2 with SSM and run following after adding values as instructed below:

```
nohup sudo socat TCP4-LISTEN:LISTEN_PORT_TO_FIX,reuseaddr,fork TCP:DNS_TO_REDIRECT:PORT_TO_PIPE &
```

where `LISTEN_PORT_TO_FIX` is the port you want to listen on (e.g. 80), `DNS_TO_REDIRECT` is where you want to redirect to and `PORT_TO_PIPE` is port in the receiving end. With ALB, port is 80 for both and DNS is the DNS of the ALB (check AWS console). For database, port is 5432 for both and DNS can be checked from Parameter Store.

### Database migration

run ./bastion-database-pipe.sh script

```
./bastion-database-pipe.sh
```

Once pipeline is up, make sure you have correct env variable in ⁠packages/server.env

```
DATABASE_URL="postgresql://...{production database connection URL}"
```

[follow guide on how to run prisma migration](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production)

You can inspect database using for example [psql](https://www.postgresql.org/docs/current/app-psql.html) or [Prisma Studio](https://www.prisma.io/blog/prisma-studio-3rtf78dg99fe)

Prisma Studio

```
npx prisma studio
```

psql

```
psql [connection URL]
rataextra=> \dt+
```

#### Migration Problems

If you encounter problems with migration, check [troubleshooting for issues in development](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/troubleshooting-development) and [production](https://www.prisma.io/docs/guides/migrate/production-troubleshooting) first.

A common case might be that a change is already present in the DB and thus migration fails due to a table or relation already existing. If you have confirmed this to be the case, you can mark the migration as applied to skip it.

```
npx prisma migrate resolve --applied "20231030_my_migration"
```

### Build

#### Pipeline

Bootstrap CDK for the AWS account, if that has not been done yet: `ENVIRONMENT=dev BRANCH=main cdk bootstrap`. ENVIRONMENT and BRANCH don't really matter here, but the stack requires you to set them.

In the pipeline deployment **AWS account** and **region** are set based on the AWS profile used to deploy the
pipeline - either use your cli default profile or specify the profile with --profile flag when deploying the pipeline.

There are three variables that determine how the pipeline and the application itself are deployed to the AWS Account. These variables are listed below in format [ENVIRONMENT VARIABLE] --> [deduced stack variable]

- **ENVIRONMENT --> env**: Required environment variable that determines stack **env**. Allowed values `dev`, `feat`, `local` and `prod`. Determines the stack resource performance characteristics and also how other environment variables, BRANCH and STACK_ID work. Also sets removalPolicy for stack resources. Use `feat` for any feature branches while `local` is only for local development. `dev`and `prod` are to be used for only specific, permanent environments.
- **BRANCH --> branch**: Required environment variable that determines **branch** variable which controls from which Github branch source code is pulled for the deployment. The value must correspond to a branch that exists in Github repository. Note: If ENVIRONMENT is `prod`, the branch is always fixed to follow production branch and this environment variable is ignored. If ENVIRONMENT is anything else than `prod`, BRANCH must be given.
- **STACK_ID --> stackId**: Required environment variable that determines **stackId** which gives name to the stack and is basis for naming of the stack resources. Production branch and development main branch are special cases where the **STACK_ID** name must match with the **BRANCH**. The STACK_ID can only contain alphanumeric characters and hyphens.

Note! Naming of certain AWS resources must be globally unique, these resources in RataExtra Stack include S3 buckets. Current naming scheme does not support using the same stackId in multiple AWS Accounts. Using the same name will lead into naming collisions and thus deployment failure.

To set up a new pipeline, run the deployment script `pipeline:deploy` providing environment, branch and stackId as command line arguments with optionally also providing your AWS profile (here environment, branch and stackid correspond to variables explained above):

    npm run pipeline:deploy --environment=feat --branch=feature/RTENU-07-test --stackid=mytestbranch -- --profile myFavouriteAWSProfile

The script will deploy CodePipeline, which will automatically set up the environment. You need to have the changes pushed to GitHub for the pipeline to work. Once set up, the pipeline will automatically update itself and deploy any changes made to the app when commits are pushed to the branch defined in deploy. You can access pipeline resources through the bastion host. See "Connecting to feature ALB".

If you update the `pipeline:synth`-script name, you need to have the old script available for at least one commit in the followed branch or you have to rerun the deployment script by hand.

Note! A valid GitHub token with the scopes `admin:repo_hook, public_repo, repo:status, repo_deployment` is required to be had in AWS Secrets Manager. Set the token as plaintext value. New expired date is set in the next 1 year. In order to give sufficient permission to your Github token, you may need to edit your pipeline in AWS CodePipeline (e.g. stage Source), connect and grant the authorization right of your Github account.
Note! If you only update the value of the github token in Secrets Manager, you have to reconnect Github with the CodePipeline. AWS CodePipeline -> Pipeline -> {name_of_pipeline} -> edit pipeline : Edit Source stage -> Connect to GitHub and follow the instructions. Afterwards, Retry won't probably work and you need to press Release Change.

Note! You need Docker installed on your computer for synth and deploy to work.

Reference for pipeline setup: https://docs.aws.amazon.com/cdk/v2/guide/cdk_pipeline.html

> [!IMPORTANT]
> After you are done with the created feat stack, remember to delete the stack from CloudFormation
>
> Deleting the stack takes care of most of the created components. After that remember to delete S3 bucket by hand.

> [!TIP] > **Issues with pipeline not running latest changes?**
>
> For example, pipeline is failing and changes you make to fix that includes the changes to the pipeline itself.
>
> merge cdk changes to desired branch (main -> dev, prod -> production)
>
> dev
>
> ```
> npm run pipeline:deploy --environment=dev --branch=main --stackid=main -- --profile XXXXXXXXXX_Rataextra-dev
> ```
>
> prod
>
> ```
> npm run pipeline:deploy --environment=prod --branch=prod --stackid=prod -- --profile XXXXXXXXXX_Rataextra-prod
> ```

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
- **rataextra-alfresco-download-url**: URL for downloading Alfresco file
- **rataextra-alfresco-ancestor**: Root folder name in Alfresco
- **rataextra-cloudfront-signer-public-key-id**: ID of the key used to create a CloudFront Key Group via CDK. Note that you should generate the key by hand and upload to CloudFront > Public keys > Create public key and use the ID that is generated here.

### Backend development

Cache any async content that doesn't change often to speed up lambda running tie on subsequent runs. This can be done by setting the value with let above the handler function and then checking if it has a value or not and fetching a new value only if it is missing.

#### Authorization

Use `utils/userService.ts` to first get `user` and then use an applicable role check validation function. All functions outside of frontend cookie creation function should have applicable authorization. Minimum is to check if they have read rights. Wrap checks in try-catches, as they will throw if the user is not authorized. This should be done first thing in the handler-function.

#### Logging

Use `utils/logger.ts`. Whenever possible, pass `user` to get the UID. A info-level log should be done with user attached after authorizing the user at the beginning of a lambda function. Use error-level for any catch-blocks. In these cases, you usually don't have user, but do log that if it's available. If any changes are made to the system/databases/etc., also add an `auditLog`-line describing the action from logger. These _must_ have the user. As these logs are mixed in with technical logs, they can be used in place of normal logging when logging changes made. Errors etc. should still use normal logging.

#### Logging in development

Use [pino-pretty](https://github.com/pinojs/pino-pretty) to make output easier to read

```
$ npm install -g pino-pretty
```

To use pino-pretty you can for example pass it after invoking lambda function

```
$ npm run sam:invoke --handler=create-user --profile=myFavouriteAWSProfile | pino pretty
```

### Tests

Unit tests can be run with `npm run test:server`

### Translation

Error messages support translations client-side. You can throw an `RataExtraLambdaError` and give it a `errorTranslationKey` parameter and translate that in the client with i18next.

Example:

```javascript
if (error) {
  throw new RataExtraLambdaError('Error occurred.', 500, 'errorOccurredKey');
}
```

In client you must have the corresponding translation in `apiErrors.json` file.

```json
{
  "errorOccurredKey": "Jokin meni pieleen!"
}
```
