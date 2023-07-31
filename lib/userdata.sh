#!/bin/bash
set -e
# TODO: Log rotation, check logrotate
if ! [ -d "/var/log/nodeserver" ]; then
  echo "Creating /var/log/nodeserver/"
  mkdir /var/log/nodeserver/
fi
exec >> /var/log/nodeserver/logs.log 2>&1
#export "ENVIRONMENT={rataExtraEnv}" "SSM_DATABASE_NAME_ID={SSM_DATABASE_NAME}" SSM_DATABASE_DOMAIN_ID="{SSM_DATABASE_DOMAIN}" "SSM_DATABASE_PASSWORD_ID={SSM_DATABASE_PASSWORD}" "ALFRESCO_API_KEY_NAME={alfrescoAPIKey}" "ALFRESCO_API_URL={alfrescoAPIUrl}" "ALFRESCO_API_ANCESTOR={alfrescoAncestor}" "JWT_TOKEN_ISSUER={jwtTokenIssuer}" "MOCK_UID={mockUid}"

# Possibly move this to a separate init step
#yum install -y amazon-cloudwatch-agent

# Must match port used in express
iptables -A INPUT -p tcp --dport 8080 -m state --state NEW -j ACCEPT

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
sudo -u ec2-user whoami 
npm run start &
echo npm running
