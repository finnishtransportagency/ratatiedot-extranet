#!/usr/bin/env bash

set -euo pipefail

source "$(dirname "$0")/bastion-common.sh"

aws ec2 describe-images \
    --region eu-west-1 \
    --owners aws-marketplace \
    --filters "Name=product-code,Values=220f0w1tpsrdfjy4cc488blas" \
    --query "reverse(sort_by(Images,&CreationDate))[:1].[CreationDate,ImageId,Name,State]" \
    --output table \
    --profile "$PROFILE"
