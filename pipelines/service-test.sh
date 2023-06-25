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

GIT_COMMIT_FILE=../.git_commit.json
echo '"last 3 commits":[' >> $GIT_COMMIT_FILE
git log -n 3 --oneline --abbrev=8 | awk 'NR>1{print ","} {gsub(/([\"\\/])/, "\\\&") ; COMMIT_HASH=$1; $1=""; printf " {\042" COMMIT_HASH "\042: \042" $0 "\042}"} ' >> $GIT_COMMIT_FILE
echo "\n ]\n}" >> $GIT_COMMIT_FILE
git add $GIT_COMMIT_FILE