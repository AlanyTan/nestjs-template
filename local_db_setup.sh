#!/usr/bin/env bash

## config the DB's port, user, and database_name to use,
## in your .env (or environment variables), you should have at these the following 3 variable set to these values (these values work for the nestjs-example repo)
# POSTGRES_DATABASE=nestjs_example
# POSTGRES_PORT=5432
# POSTGRES_USERNAME=postgres

if [ -f .env ]; then 
  . .env
fi

# make docker host postgres_data folder if it does not exist
mkdir -p ~/postgres_data

# check if postgres container does not exist
if [ ! "$(docker ps -aq -f name=postgres_local)" ]; then
  # create container
  docker run -d --name postgres_local -v ~/postgres_data:/var/lib/postgresql/data -e POSTGRES_HOST_AUTH_METHOD=trust -p ${POSTGRES_PORT:-5432}:5432 postgres:13
# check if postgres container has exited
elif [ "$(docker ps -aq -f name=postgres_local -f status=exited)" ]; then
  # restart container
  docker start postgres_local
fi

sleep 5;

# create databases
docker exec postgres_local psql -h localhost -p ${POSTGRES_PORT:-5432} -U ${POSTGRES_USERNAME:-postgres} -c "CREATE DATABASE ${POSTGRES_DATABASE:-application};"
