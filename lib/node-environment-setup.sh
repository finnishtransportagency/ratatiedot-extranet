#!/bin/bash

# Update all packages
yum -y update

# Get latest cfn scripts; https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html#cfninit
yum install -y aws-cfn-bootstrap

# preparing ec2 host machine
cat > /tmp/install_script.sh << EOF
      # START
      echo "Setting up NodeJS Environment"
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
      # Dot source the files to ensure that variables are available within the current shell
      . /home/ec2-user/.nvm/nvm.sh
      . /home/ec2-user/.bashrc
      # Install NVM, NPM, Node.JS
      nvm alias default v20.3.0
      nvm install v20.3.0
      nvm use v20.3.0
EOF

# Runs the install script as the ec2-user.
chown ec2-user:ec2-user /tmp/install_script.sh && chmod a+x /tmp/install_script.sh
sleep 1; su - ec2-user -c "/tmp/install_script.sh"
