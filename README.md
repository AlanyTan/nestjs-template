# NestJS Example

## Purpose

To provide a standardized starting point for our backend node.js microservices
Database (Posgresql) optional. 

offer .devcontainer config so that development can happen remotely in the Linux VM running in the cloud (you should also be able to use local docker if you prefer, not thoroughly tested for local docker other than Linux host though). 

## Added Benefits of Using This Template

- standardized tsconfig and .eslintrc
- openapi/swagger-ui
- husky git hooks
- dockerfile
- .env config files for environment vars
- database config
- dockerized postgres db setup script
- rename script (to change all instances of "nestjs-example" to whatever you call the repo)

## Requirements

- Node.js - v14.x.x
- npm - v7.x.x
- Nest CLI - v8.x.x

## Getting Started

### Run Rename Script

This script will change all instances of "nestjs-example" to whatever you provide in the prompt

```
./rename.sh
```

### Run Local PostgreSQL Setup Script (optional, if you need Postgresql in a container)

This script will create a dockerized postgres container named `postgres_local` if it does not exist and create run & test databases for this server in that postgres container

```
./local_setup.sh
```

This script can be configured to your needs:

```bash
# config
SERVER_NAME=nestjs_example
SERVER_PORT=8080
DB_PORT=5432
```

### Open this repo
Make sure you have VSCode installed on your PC, you need docker CLI as well (if you use Linux PC, it is ok to skip Docker engine, and install docker cli only)

Make sure you have SSH private key on your PC ```~/.ssh/id_rsa``` and public key in the remote Linux Host ```~/.ssh/authorized_keys```
To test your set up, do ```docker info``` on your PC, it should show you docker  info of the remote host. 


In VScode, go to Preferences->Settings, and search for "dockerode", then click on the "edit in settings.json" link.  
add ```    "docker.host": "ssh:<username>@<ip.addr.of.vm>", ```
Install "Remote-containers" extension to your VSCode.

For the first time opening this repo, use the Ctrl-Shift-P "Remote-containers: clone github repo to Container Volume" function to clone the repo to the remote docker container instead of to your local PC. 
This might take some time as the docker system needs to build the image. 

After the remote Linux host builds the docker image and runs it, your VSCode should be able to be used normally.  You may want to save the workspace as a file locally (which is about 2K file that can help you open this remote container later). 

You should be able to use the "Run" menu and debug runction.  

### Start NestJS Server

```
npm start
```
