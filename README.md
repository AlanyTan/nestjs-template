# NestJS Example

## Purpose

To provide a standardized starting point for our backend node.js microservices
Database (Postgresql) optional.
(\*note, Postgresql is currently turned off while we are solving a technical challenge to allow different user data to be stored in different physical tables)

This repo includes .devcontainer config so that development environment requirements can be built into dev-container, which allows multiple repo to respect their different lib/tool/package requirements. .devcontainer works on Linux host, or remotely on a Linux VM running in the cloud (you should also be able to use local docker on WSL if you prefer Windows, although it's not thoroughly tested).

## Key Benefits of Using This Template

- Standardized logging, logging format, redact.
- OPENFEATURE feature toggle
- - two feature toggle providers Environment Variable & LaunchDarkly
- - standard OPENFEATURE client that can be easily switched between the two providers using EnVar without changing application code
- Jest based unit test and app e2e test templates.
- openapi/swagger-ui
- health check
- version end-point
- metrics end-point
- dockerfile
- .env config files for environment vars (are ignored in .gitignore and .dockerignore, check .example.env for example)
- VSCode usability enhancements
- - remote-container ready repo, all design time requirements can be built into the devcontainer
- - .vscode/launch.json & .vscode/tasks.json that enables VSCode integrated "run and debug" and test function.
- - standardized tsconfig and .eslintrc (so vscode intellisense will catch most lint issues that would otherwise fail the build)
- husky git hooks to perform pre-commit lint (so CI/CD )
- - database config (optional)
- - dockerized postgres db setup script (optional)
- - rename script (to change all instances of "nestjs-example" to whatever you call the repo)

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

### Run Local PostgreSQL Setup Script (optional, if you need Postgresql in a container) _currently disabled_

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

### OpenFeature

This repo uses OpenFeature as server-side feature toggle.
It has two Feature Flag function providers:

- a locally implemented OpenFeature Provider that reads environment variables (an Environment Variable that is all capital, replace "-" with "\_" will be read, and its value retruned as the value for the flag. e.g. if you look up a flag "a-flag", and you have set up an Env Var "A_FLAG=true", then the lookup will return "true")
- a Launch Darkly that connects to Launch Darkly and requires a "sdkKey", please ask the Product Management group for the key for local development

To switch which Feature Toggle provider to be used, change the Environment Varialbe {OPENFEATURE_PROVIDER} to "ENV" or "LaunchDarkly".

It is recommended for you to use the local Env-Provider and change the flag setting as often as you like first, then test with LaunchDarkly in collaboration with Product Management, once you are ready to commit.

Two feature toggling was demonstrated:
in ExampleService, a new-feature-flag was used to control the content of the returned message
in ExampleController, a new-end-point was used to control if the v2 of the end-point would be available or not (return 404) using the Guard decorator

In the env-provider case, to change the value of the flags, update the .env (or EnVar) to have `NEW_FEATURE_FLAG=true` or `NEW_END_POINT=false`

#### how to "copy"" feature toggle functionality to your own nest.js repo?

- start from the app.module.ts,

```
import { OpenFeature } from '@openfeature/js-sdk';
import { OPENFEATURE_CLIENT } from "./utils/js-env-provider";
import { OpenFeatureEnvProvider } from "./utils/js-env-provider";
import { OpenFeatureLaunchDarklyProvider } from './utils/js-launchdarkly-provider';
...
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: OPENFEATURE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        switch (configService.get<string>("OPENFEATURE_PROVIDER")?.split(":")[0]) {
        case 'env' || 'ENV':
          OpenFeature.setProvider(new OpenFeatureEnvProvider());
          break;
        case 'LD' || 'ld' || 'launchdarkly' || 'LaunchDarkly':
          const LD_KEY = configService.get<string>("OPENFEATURE_PROVIDER")?.split(":")[1]
          if (!LD_KEY) {
            throw new Error("LaunchDarkly key not provided")
          } else {
            OpenFeature.setProvider(new OpenFeatureLaunchDarklyProvider(
              LD_KEY
            ));
          }
          break;
        default:
          throw new Error("OpenFeature provider value invalid:" + configService.get<string>("OPENFEATURE_PROVIDER"))
        }
        const client = OpenFeature.getClient("app");
        return client;
      },
    },
  ],
```

- create a `utils` dir under `src` and copy the following 4 files from this repo's utils

```
utils\js-env-provider.ts
utils\js-env-provider.spec.ts
utils\js-launchdarkly-provider.ts
utils\js-launchdarkly-provider.spec.ts
```

### Logging

This repo uses pino logging, including pino-http. This means all incoming HTTP requests are automatically logged.  
Pino logging format is set in the app.module.ts, and should be considered Logging standard.

There are 3 environment Variables that influence logging:

- LOG_LEVEL : determines how verbose the logging will be (i.e. when LOG_LEVEL=info, trace and debug messages won't be added to the log) see below for valid values
- PINO_PRETTY : boolean value determines if the logs will be written in pretty format or JSON
- NODE_ENV : only if NODE_ENV=development the colorization will be used in pino-pretty, and it affects redactation as well.

LOG_LEVEL default is "info", valid values are (and their internal numerical values) are:
"trace": 10,
"debug": 20,
"info": 30,
"warn": 40,
"error": 50,
"fatal": 60
The higher the LOG_LEVEL numerical value the less verbos the logs will be.
In your code, you can use `logger.error`, `logger.warn`, `logger.log` (maps to info) `logger.debug`, `logger.verbose` (maps to trace), and depending on the LOG_LEVEL setting, lower numerical log level messages will be supressed, for example if you set LOG_LEVEL=debug, your `logger.trace` messages won't show up in your stdout, while all others will.

Log Colorization
For local development and debug, colored logs are often helpful, however, for production execution, colorization will introduce special characters into the log stream and make log hard to read. So we configure the log to use colorization when NODE_ENV=development, but turn colorization off for all other cases.

Log Redactation
We shall redact sensitive informations

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
