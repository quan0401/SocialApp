#!/bin/bash

aws s3 sync s3://socialapp-env-files/staging .
unzip env-file.zip
cp .env.staging .env
rm .env.staging
sed -i -e "s|\(^REDIS_HOST=\).*|REDIS_HOST=redis://$ELASTICACHE_ENDPOINT:6379|g" .env
rm -rf env-file.zip
cp .env .env.staging
zip env-file.zip .env.staging
aws --region ap-southeast-1 s3 cp env-file.zip s3://socialapp-env-files/staging/ # update with s3 bucket
rm -rf .env*
rm -rf env-file.zip
