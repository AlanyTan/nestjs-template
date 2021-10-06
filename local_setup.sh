#!/usr/bin/env bash

# config
SERVER_NAME=nestjs_example
SERVER_PORT=8080
DB_PORT=5432

# make docker host postgres_data folder if it does not exist
mkdir -p ~/postgres_data

# check if postgres container does not exist
if [ ! "$(docker ps -aq -f name=postgres_local)" ]; then
  # create container
  docker run -d --name postgres_local -v ~/postgres_data:/var/lib/postgresql/data -e POSTGRES_HOST_AUTH_METHOD=trust -p ${DB_PORT}:5432 postgres:13
# check if postgres container has exited
elif [ "$(docker ps -aq -f name=postgres_local -f status=exited)" ]; then
  # restart container
  docker start postgres_local
fi

sleep 5;

# create databases
docker exec postgres_local psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE ${SERVER_NAME}_db_run;"
docker exec postgres_local psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE ${SERVER_NAME}_db_test;"

# build server image
docker build -t ${SERVER_NAME} .
# create server container
docker run -d --name ${SERVER_NAME}_local -p ${SERVER_PORT}:8080 ${SERVER_NAME}
