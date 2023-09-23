#!/bin/bash
PROJECT_NAME=dev
DOCKER_NETWORK_NAME=${PROJECT_NAME}_default

if ( ! docker network inspect ${DOCKER_NETWORK_NAME} > /dev/null 2>&1); then 
    docker network create ${DOCKER_NETWORK_NAME}
fi

while read DOCKERID
do
  # Check if the container is running on the same network
  NETANDHOSTFOUND=$(docker inspect $DOCKERID | grep -E "${DOCKER_NETWORK_NAME}|Hostname\": \"$(uname -n)\"" | wc -l)
  # if the container is this devcontainer, and it's not on the network, the NETANDHOSTFOUND would be 1, if it is on the same network, it would be 2
  if [ "$NETANDHOSTFOUND" -eq 1 ]; then
    docker network connect ${DOCKER_NETWORK_NAME} $DOCKERID 2>/dev/null
  fi
done <<< $(docker ps -q)

CONTAINER_NAME=postgres
DOCKER_ID=$(docker ps -aq -f name=${CONTAINER_NAME})
if [ -z "$DOCKER_ID" ]; then 
    SCRIPT_DIR=$(dirname ${BASH_SOURCE[0]})
    docker compose -f "$SCRIPT_DIR/dev/dev-docker-compose.yml" up -d

else 
    docker start ${DOCKER_ID}
fi



