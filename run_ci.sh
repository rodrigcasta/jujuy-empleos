#!/bin/bash

#set -e
set -x

cd /app
yarn install
yarn lint
yarn test
