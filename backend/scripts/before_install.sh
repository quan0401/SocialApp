#!/bin/bash

DIT="/home/ec2-user/SocialApp"
if [ -d $DIT ]; then
  cd /home/ec2-user
  sudo rm -rf SocialApp
else
  echo "Directory does not exist"
fi
