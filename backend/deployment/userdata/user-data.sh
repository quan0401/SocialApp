#!/bin/bash

function program_is_installed {
  local return_=1

  type $1 >/dev/null 2>&1 || { local return_=0; }
  echo "$return_"
}

# Install CodeDeploy agent
sudo yum update -y
sudo yum install ruby -y
sudo yum install wget -y
cd /home/ec2-user
wget https://aws-codedeploy-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto

# Check if nodeJs is installed. If not, install it
if [ $(program_is_installed node) == 0 ]; then
  # curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  # source ~/.bashrc
  # # if use AL2 install node <=16: https://stackoverflow.com/questions/72022527/glibc-2-27-not-found-while-installing-node-on-amazon-ec2-instance
  # nvm install 16
  sudo curl -fsSL https://rpm.nodesource.com/setup_lts.x | bash -
  sudo yum install -y nodejs
fi

if [ $(program_is_installed git) == 0 ]; then
  sudo yum install git -y
fi

if [ $(program_is_installed docker) == 0 ]; then
  # sudo amazon-linux-extras install docker -y: this command is for amazon linux 2
  sudo yum install docker -y
  sudo systemctl start docker
  sudo chmod 666 /var/run/docker.sock # add execution permission
  sudo docker run --name socialapp-redis -p 6379:6379 --restart always --detach redis
fi

if [ $(program_is_installed pm2) == 0 ]; then
  sudo npm install -g pm2
fi

cd /home/ec2-user

# clone dev branch
git clone -b develop https://github.com/quan0401/SocialApp.git
cd SocialApp/backend
sudo npm install
aws s3 sync s3://socialapp-env-files/develop .
sudo dnf install unzip -y   # For CentOS 7 or later
sudo unzip env-file.zip
sudo cp .env.develop .env
sudo npm run build
sudo npm start
