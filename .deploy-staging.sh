#!/bin/bash

# Get Servers list
set -f
string=$STAGE_DEPLOY_SERVER
array=(${string//,/ })

# Iterate servers for deploy and pull last commit
for i in "${!array[@]}"; do
    echo "Deploy project on server ${array[i]}"
    ssh root@${array[i]} "cd /var/www/graphs-project && git reset --hard && git pull && yarn && postinstall && pm2 restart Frontend-dev"
done

