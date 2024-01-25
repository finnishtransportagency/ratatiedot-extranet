#!/bin/bash
set -e
# TODO: Log rotation, check logrotate
if ! [ -d "/var/log/nodeserver" ]; then
  echo "Creating /var/log/nodeserver/"
  mkdir /var/log/nodeserver/
fi

# Check for updates
dnf -y update

# Must match port used in express
nft add table ip filter
nft add chain ip filter input { type filter hook input priority 0 \; }
nft add rule ip filter input tcp dport 8080 ct state new accept

current_date_time=$(date)
echo "Current date and time: $current_date_time"

export HOME=/home/ec2-user

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install v16.20.0
nvm use v16.20.0
nvm -v
node -v
npm -v

cd $HOME/source/packages/node-server

npm ci
npm run build
