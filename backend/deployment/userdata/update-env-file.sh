#!/bin/bash

aws s3 sync s3://socialapp-env-files/develop .
unzip env-file.zip
cp .env.develop .env
rm .env.develop
sed -i -e "s|\(^REDIS_HOST=\).*|REDIS_HOST=redis://$ELASTICACHE_ENDPOINT:6379|g" .env
rm -rf env-file.zip
cp .env .env.develop
zip env-file.zip .env.develop
aws --region ap-southeast-1 s3 cp env-file.zip s3://socialapp-env-files/develop/ # update with s3 bucket
rm -rf .env*
rm -rf env-file.zip
