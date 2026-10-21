#!/bin/bash

set -e
set -x

yarn install
yarn lint

yarn test
yarn test:aceptacion
