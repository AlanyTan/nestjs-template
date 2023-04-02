#!/usr/bin/env bash

# config
POSTGRES_DATABASE=nestjs_example
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres

# make docker host postgres_data folder if it does not exist
mkdir -p ~/postgres_data

# check if postgres container does not exist
if [ ! "$(docker ps -aq -f name=postgres_local)" ]; then
  # create container
  docker run -d --name postgres_local -v ~/postgres_data:/var/lib/postgresql/data -e POSTGRES_HOST_AUTH_METHOD=trust -p ${POSTGRES_PORT}:5432 postgres:13
# check if postgres container has exited
elif [ "$(docker ps -aq -f name=postgres_local -f status=exited)" ]; then
  # restart container
  docker start postgres_local
fi

sleep 5;

# create databases
docker exec postgres_local psql -h localhost -p ${POSTGRES_PORT} -U ${POSTGRES_USERNAME} -c "CREATE DATABASE ${POSTGRES_DATABASE};"
