#!/bin/bash
source ./loadbastionenv

# `portNumber` must be available on the bastion host.
# `localPortNumber` must match the port in packages/frontend/vite.config.ts
# proxy target.
aws ssm start-session \
--target $INSTANCE_ID \
--profile $PROFILE \
--region eu-west-1 \
--document-name AWS-StartPortForwardingSession \
--parameters '{"portNumber":["82"],"localPortNumber":["3001"]}'
