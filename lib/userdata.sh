#!/bin/bash
set -e
# TODO: Log rotation, check logrotate
exec > /var/log/nodeserver/logs.log 2>&1

yum -y update

yum install -y amazon-cloudwatch-agent

# Must match port used in express
iptables -A INPUT -p tcp --dport 8080 -m state --state NEW -j ACCEPT

current_date_time=$(date)
echo "Current date and time: $current_date_time"

export HOME=/home/ec2-user

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:$HOME/cloudwatch-agent-config.json

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
npm run start
