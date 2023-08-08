#!/bin/bash

SCRIPT_DIR=$(dirname ${BASH_SOURCE[0]})

mkdir -p "$SCRIPT_DIR/dev/postgres-data"

docker compose -f "$SCRIPT_DIR/dev/dev-docker-compose.yml" up -d
