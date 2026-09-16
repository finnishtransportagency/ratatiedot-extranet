# Sourced by bastion-*.sh scripts — not intended to be run directly.
# shellcheck shell=bash

BASTION_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$BASTION_DIR/.env.bastion"

aws sts get-caller-identity --profile "$PROFILE" --region eu-west-1 &>/dev/null || {
  echo "SSO session expired — logging in..."
  aws sso login --profile "$PROFILE"
}
