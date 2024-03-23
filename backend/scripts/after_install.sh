#!/bin/bash

cd /home/ec2-user/SocialApp/backend
sudo rm -rf env-file.zip
sudo rm -rf .env
sudo rm -rf .env.develop
aws s3 sync s3://socialapp-env-files/develop .
unzip env-file.zip
sudo cp .env.develop .env
sudo pm2 delete all
sudo npm install
