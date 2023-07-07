#!/bin/bash
envfile=".env"
while getopts "e:" opt; do
  case $opt in
    e)
      envfile=$OPTARG
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      echo "Usage: $0 -e .env_filename"
      exit 1
      ;;
  esac
done

if [ -f "$envfile" ]; then
  . $envfile
fi

POSTGRES_IMAGE=postgres:latest
POSTGRES_DOCKER_NAME=${SERVICE_PREFIX}${SERVICE_PREFIX:+_}postgres_local

## config the DB's port, user, and database_name to use,
## in your .env (or environment variables), you should have at these the following 3 variable set to these values (these values work for the nestjs-example repo)
# POSTGRES_DATABASE=nestjs_example
# POSTGRES_PORT=5432
# POSTGRES_USERNAME=postgres

# make docker host postgres_data folder if it does not exist
mkdir -p ~/postgres_data

# check if any postgres docker is running
while read RUNNING_POSTGRES_DOCKER
do
  # go through each running container and check its NetworkSettings.ports
  RUNNING_POSTGRES_DOCKER_PORT=$(docker inspect --format='{{range $key, $value := .NetworkSettings.Ports}}{{$key}}{{end}}' $RUNNING_POSTGRES_DOCKER)
  RUNNING_POSTGRES_DOCKER_PORT=${RUNNING_POSTGRES_DOCKER_PORT%/tcp}
  if [ "$RUNNING_POSTGRES_DOCKER_PORT" -eq "$POSTGRES_PORT" ]; then
    #if the specified POSTGRES_PORT is already in use by a running
    break;
  fi
done < <(docker ps --filter "ancestor=postgres" -q)

if [ -z "$RUNNING_POSTGRES_DOCKER" ]; then
  # check if postgres container does not exist
  if [ ! "$(docker ps -aq -f name=$POSTGRES_DOCKER_NAME)" ]; then
    # create container
    RUNNING_POSTGRES_DOCKER=$(docker run -d --name $POSTGRES_DOCKER_NAME -v ~/postgres_data:/var/lib/postgresql/data -e POSTGRES_HOST_AUTH_METHOD=trust -p ${POSTGRES_PORT:-5432}:5432 $POSTGRES_IMAGE)
  # check if postgres container has exited
  elif [ "$(docker ps -aq -f name=$POSTGRES_DOCKER_NAME -f status=exited)" ]; then
    # re-start container
    RUNNING_POSTGRES_DOCKER=$(docker start $POSTGRES_DOCKER_NAME)
  fi
fi
sleep 5;
# create databases
docker exec -i $RUNNING_POSTGRES_DOCKER  psql -h localhost -p ${POSTGRES_PORT:-5432} -U ${POSTGRES_USERNAME:-postgres} <<EOF
SELECT 'CREATE DATABASE ${POSTGRES_DATABASE:-application};' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${POSTGRES_DATABASE:-application}')\gexec
EOF

RC=$?
if [ "$RC" -eq 0 ]; then
  echo "setup local db env complete..."
  exit 0
else 
  echo "setup local db env failed..."
  exit 1
fi