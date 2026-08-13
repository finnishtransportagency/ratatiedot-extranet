#!/bin/bash
set -euo pipefail

source "$(dirname "$0")/bastion-common.sh"

# `portNumber` must be available on the bastion host.
# `localPortNumber` must match the ports in packages/server/.env
aws ssm start-session --target "$INSTANCE_ID" --profile "$PROFILE" --region eu-west-1 \
  --document-name AWS-StartPortForwardingSession \
  --parameters '{"portNumber":["5432"],"localPortNumber":["5433"]}'
