#!/bin/bash

SCRIPT_DIR=$(dirname ${BASH_SOURCE[0]})
docker compose -f "$SCRIPT_DIR/dev/dev-docker-compose.yml" up -d
