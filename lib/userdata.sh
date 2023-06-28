#!/bin/bash
set -e
exec > /tmp/userdata.log 2>&1
# yum -y update

current_date_time=$(date)
echo "Current date and time: $current_date_time"

export HOME=/home/ec2-user

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cat <<EOF >> /home/ec2-user/.bashrc
  export NVM_DIR="/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
EOF

nvm install v16.20.0
nvm use v16.20.0
nvm -v
node -v
npm -v

cd /source/packages/node-server/
pwd
ls -la

npm install
npm run build
npm run start
