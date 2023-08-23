#!/bin/bash -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT_DIR="$(realpath "${SCRIPT_DIR}/..")"
cd "${PROJECT_DIR}" || exit 1

npm config set fund false
npm clean-install
npm run lint:ci
npm run test:ci
