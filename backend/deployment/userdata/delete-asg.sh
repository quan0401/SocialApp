#!/bin/bash

ASG=$(aws autoscaling describe-auto-scaling-groups --no-paginate --output text --query "AutoScalingGroups[? Tags[? (Key=='Type') && Value=='$ENV_TYPE']].AutoScalingGroupName")
echo "$ASG"
