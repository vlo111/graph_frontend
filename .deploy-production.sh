#!/bin/bash

# Get Servers list
set -f
string=$PROD_DEPLOY_SERVER
array=(${string//,/ })

# Iterate servers for deploy and pull last commit
for i in "${!array[@]}"; do
    echo "Deploy project on server ${array[i]}"
    ssh root@${array[i]} "cd /var/www/araks.analysed.ai/graphs-project && git reset --hard origin/master && git checkout master && git pull && yarn && yarn build"
done

