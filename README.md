# NestJS Example

## Purpose

To provide a standardized starting point for our backend node.js microservices
Database (Posgresql) optional.

offer .devcontainer config so that development can happen remotely in the Linux VM running in the cloud (you should also be able to use local docker if you prefer, not thoroughly tested for local docker other than Linux host though).

## Added Benefits of Using This Template

- VSCode remote-container ready repo, all design time requirements can be built into the devcontainer
- standardized tsconfig and .eslintrc
- standardized logging using pino
- openapi/swagger-ui
- husky git hooks
- dockerfile
- .env config files for environment vars (are ignored in .gitignore and .dockerignore)
- database config (optional)
- dockerized postgres db setup script (optional)
- rename script (to change all instances of "nestjs-example" to whatever you call the repo)

## Requirements

- Node.js - v16.x.x
- npm - v9.x.x
- Nest CLI - v8.x.x
- VSCode, docker extension, remote-container extention

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
SERVER_PORT=9080
DB_PORT=5432
```

### Things to pay attention to

#### logging

This repo uses pino logging, including pino-http. This means all incoming HTTP requests are automatically logged.  
Standard pino logging format is set in the app.module.ts

The logging policy is:
when NODE_ENV is no 'production', logs are writting via pino-pretty to the STDOUT, and with full details.
when NODE_ENV is 'production', logs are written directly to STDOUT as json (default pino format), with reduced details (see below for LOG_LEVEL)
when NODE_ENV is 'production', logs redacts sensitive information including req.header.authorization req.header.cookies

LOG_LEVEL is default to "info",
if LOG_ELVEL is set to either "trace" or "debug", even in 'production'
valid LOG_LEVEL (and their internal numerical values) are:
"trace": 10,
"debug": 20,
"info": 30,
"warn": 40,
"error": 50,
"fatal": 60
The higher the LOG_LEVEL numerical value the less verbos the logs will be.
To change LOG_LEVEL, a restart of the service is needed (it is only evaluated at the creation of the app instance).

#### Swagger

swagger is used for automatically document APIs.
However, Swagger is DISABLED if NODE_ENV='production'. This should be the default behavior for all repo unless otherwise required.
To change this behavior, update main.ts

### prepare the VSCode

Make sure you have VSCode installed on your PC, you need docker engine CLI as well "dev containers" extension for VSCode.

(if you use the remove linux host for development, it is ok to skip Docker engine, and install docker cli only and "Remote-containers" extension for VSCode.)

#### to use the Acerta DevLab VMs

Make sure you have SSH private key on your PC `~/.ssh/id_rsa` and public key in the remote Linux Host `~/.ssh/authorized_keys`
To test your set up, do `docker info` on your PC, it should show you docker info of the remote host.

In your system, run

```
docker context create DevLab --docker host=ssh://devlab.linepulse.ca
docker context use DevLab
```

This will create context for the remote docker host, and use it as current context.

To make this consistent for VSCode, In VScode, go to Preferences->Settings, and search for "dockerode", then click on the "edit in settings.json" link.  
add ` "docker.context": "DevLab",`

For the first time opening this repo, use the Ctrl-Shift-P "Remote-containers: clone github repo to Container Volume" function to clone the repo to the remote docker container (instead of to your local PC.)
This might take some time as the docker system needs to build the image.

After the remote Linux host builds the docker image and runs it, your VSCode should be able to be used normally. You may want to save the workspace as a file locally for convinience (which is about 2K file that can help you open this remote container later).

### debug and test

#### debug nestjs using npm

You should be able to use the "Run" menu and debug function. Click the sidebar Debug icon, and select "Launch via NPM" to the right of "RUN and DEBUG" label. You can also use menu "Run"->"Start Debug", VSCode should start nmp for you, and ask you if you want to open web browser. Open the web broswer, you should be able to see swagger and make testing API call.

#### test using runtime container

You can also test it in a docker container, select "Docker Node.js Launch" next the "RUN and DEBUG" label, You can also use menu "Run"->"Start debugging" (it launches what you select in the previous drop down), this time, VScode should build docker container for you.  
Once the image is built and started, you should be able to see it running in the Docker explorer window within VSCode, your default browser should pop up and open the main page of the Nestjs application.

Troubleshoot:
If the netst application is running, you should at least be able to open a terminal inside VSCode, and run:
` docker exec nestjsexample-dev curl http://localhost:9080/#/App/AppController_getHello`
(Note, the nest server runs inside the runtime container, out of the devcontainer, that's why you need to call the docker exec nestjsexample-dev that exec the curl inside the debug container.
Next, SSH to the remote host where the docker container runs, and do
`curl http://localhost:<map-port>/#/App/AppController_getHello"`
should show you the same results. <map-port> is the port docker used to map host port to docker exposed port, you can get this port number by calling `docker ps | grep 9080`, the default is 9080 (we mapped container port 9080 to host port 9080)

## Technical explainations

This repo is designed to work inside a VSCode devcontainer. To make everything running smoothly, several aspects need to be managed, especially if you are to make any changes.

### the .devcontainer/devcontainer.json file

This is the key devcontainter config. In this file we need to make sure the devcontainer uses host network, and docker-from-docker devcontainer feature. These will allow our code to build runtime container using the same remote host and run the runtime container along the devcontainer. Having the devcontainer using the host network will allow us to leverage VSCode's auto port forwarding capability and visit the runtime container as if it runs directly inside the dev environment.
Here is the runArgs section that uses host network:

```
"runArgs": [
    "--init",
    "--network=host",
    "--name ${localEnv:USER}${localEnv:USERNAME}.Nestjs.Example"
  ],
```

Here is the features section uses docker-from-docker:

```
  "features": {
    "docker-from-docker": {
      "version": "latest",
      "moby": true
    },
    "kubectl-helm-minikube": "latest",
    "git": "latest",
    "github-cli": "latest"
  },
```

### the main.ts file

This is the main application.  
The line starts the server listening is:

```
await app.listen(port, host, () => Logger.log("Listening on port " + port));
```

The `Logger.log("Listening on port" + port)` part is to make sure a log output from the nest.js app is written to the log, where Docker extention monitors. This allows VSCode to know when the application is ready, and which port the application runs on.

### the .vscode/launch.json

This is one of the two VSCode setting files that are important (could be generated from the package.json by VSCode then customize).  
This tells VSCode what debug/run options are avaialble for this application. The docker section is what we are interested in:

```
{
  "configurations": [
    {
      "name": "Docker Node.js Launch",
      "type": "docker",
      "request": "launch",
      "preLaunchTask": "docker-run: debug",
      "platform": "node",
      "dockerServerReadyAction": {
        "action": "openExternally",
        "containerName": "dbg.NestjsExample",
        "pattern": "Listening on port (\\d+)",
        "uriFormat": "http://localhost:%s"
      }
    }
  ]
}
```

The customization is mostly the dockerServerReadyAction section. We defailed "action" to be open external webbrowser, and the containerName is "dbg.NestjsExample" (which is optional but if we do define it, should match what we define in tasks.json.), then the patten is what we output in main.ts file "Listening on port" portion, the "(\\d+)" is to capture the port numbers in a temp variable then used in the uriFormat string, replacing the %s there.

### the .vscode/tasks.json

This is the other of the two imporant file to config how VSCode handle debugs and runs in docker env.
the important part is:

```
{
      "type": "docker-run",
      "label": "docker-run: debug",
      "dependsOn": ["docker-build"],
      "dockerRun": {
        "containerName": "dbg.NestjsExample",
        "env": {
          "DEBUG": "*",
          "NODE_ENV": "development"
        },
        "ports": [{"containerPort": 9080,"hostPort": 9080}]
      },
      "node": {
        "enableDebugging": true
      }
    }
```

Here, the line `"ports": [{"containerPort": 9080,"hostPort": 9080}]` tells docker map container port 9080 to host port 9080. Without this line, docker will assign a random host port map to container port 9080, which means each run could need a different URL (port number is different) in the testing browser. If relying on VSCode to bring up the browser automatically, then it might not be too big a hassle to skip this line.
