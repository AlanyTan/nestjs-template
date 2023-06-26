#!/bin/bash
set -e

# Resolving this script directory
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT_DIR="$(realpath "${SCRIPT_DIR}/..")"
# Running everything from src/ and failing if we can't
cd "${PROJECT_DIR}" || exit 1

# shellcheck disable=SC2046
export $(grep -v '^#' test.env | xargs)
export POSTGRES_HOST=postgres

npm clean-install --include=dev
npm run test:ci:service
