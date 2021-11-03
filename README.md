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

You should be able to use the "Run" menu and debug function. Click the sidebar Debug icon, and select "Run npm start" to the right of "RUN and DEBUG" label. Use menu "Run"->"Start Debug", VSCode should start nmp for you, and ask you if you want to open webbrowser.  Open the web broswer, you should be able to see swagger and make testing API call. 

You can also test it in a docker container, select "Docker Node.js Launch" next the "RUN and DEBUG" label, then use menu "Run"->"Start debug" again, this time, VScode should build docker container for you.  
Once the image is built and started, you should be able to see it running in the Docker explorer window within VSCode, you should also be able to open a terminal inside VSCode, and run: 
``` docker exec nestjsexample-dev curl http://localhost:8080/#/App/AppController_getHello```
(Note, the nest server runs inside the debug container, out of the devcontainer, that's why you need to call the docker exec nestjsexample-dev that exec the curl inside the debug container. If you have access to the remote Linux VM, you can SSH to it, and something like 
```curl http://localhost:<map-port>/#/App/AppController_getHello"```
should show you the same results.  <map-port> is the port docker used to map host port to docker exposed port, you can get this port number by calling ```docker ps | grep 8080```

