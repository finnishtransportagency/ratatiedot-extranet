#!/bin/bash
set -e
# Update all packages
yum -y update

# Get latest cfn scripts; https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html#cfninit
yum install -y aws-cfn-bootstrap

# preparing ec2 host machine
cat > /home/ec2-user/install_script.sh << EOF
      # START
      echo "Setting up NodeJS Environment"
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
      # Dot source the files to ensure that variables are available within the current shell
      . /home/ec2-user/.nvm/nvm.sh
      . /home/ec2-user/.bashrc
      # Install NVM, NPM, Node.JS
      nvm alias default v16.20.0
      nvm install v16.20.0
      nvm use v16.20.0
      npm install pm2 -g

      # App build
      cp -R /ratatieto-source/temp/packages/node-server/* /ratatieto-source
      rm -rf /ratatieto-source/temp
      cd /ratatieto-source
      npm ci
      npm run build
      npm run start
EOF

# Runs the install script as the ec2-user.
chown ec2-user:ec2-user /home/ec2-user/install_script.sh && chown ec2-user:ec2-user /ratatieto-source && chmod a+x /home/ec2-user/install_script.sh
sleep 1; su ec2-user -c "/home/ec2-user/install_script.sh"

