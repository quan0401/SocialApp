#!/bin/bash

cd /home/ec2-user/SocialApp/backend
sudo rm -rf env-file.zip
sudo rm -rf .env
sudo rm -rf .env.staging
aws s3 sync s3://socialapp-env-files/staging .
unzip env-file.zip
sudo cp .env.staging .env
sudo pm2 delete all
sudo npm install
