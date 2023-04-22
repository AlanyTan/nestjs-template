# NestJS Example

## Purpose

To provide a standardized starting point for our backend node.js microservices.
Database (Postgresql) optional.
(\*note, Postgresql is currently turned off while we are solving a technical challenge to allow different user data to be stored in different physical tables)

Standard logging, testing, /health, /version, metrics and Feature Toggle are included in this repo, and should be used in all Nest.js based repos for Acerta products.

This repo also includes VSCode assets including .devcontainer config and .vscode config so that development environment requirements can be built into a design-time container which allows multiple repo to respect their different lib/tool/package requirements that can co-exist on a single host concurrently .devcontainer works on Linux host, or remotely on a Linux VM running in the cloud (you should also be able to use local docker on WSL if you prefer Windows, although it's not thoroughly tested).
The .vscode config allows the VSCode to be able to debug, build container and run, and execute automated test scripts (jest based) all in an VSCode integrated fashion.

## Key features in this Template

- Standardized logging, logging format, redact, dynamic verbosness
- OPENFEATURE feature toggle
- - two feature toggle providers Environment Variable & LaunchDarkly
- - standard OPENFEATURE client that can be easily switched between the two providers using EnVar without changing application code
- Jest based unit test and app e2e test templates, and vscode integrated test execution
- openapi/swagger-ui (can be turned on/off using EnVar via ConfigService)
- health check end-point (checks dependending services)
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

## How to use this repo

### If you are starting a new repo based on this template

To start, you shall create a new repo using this (nestjs-example) as template.
Once you fetch this repo down to your local development environment, change the following key files:

- `package.json` to reflect the new name, description, version info of your repo:

```
  "name": "not nestjs-example anymore",
  "version": "0.9.0",
  "description": "New repo that follows Acerta standard Nest.JS requirements",
```

- `.devcontainer/devcontainer.json` it is **strongly** recommended that you use devcontainers to develop the new repo, it allows you to use standard confiugured IDE

```
  "name": "Not Nest.js Example with DevContainer",
  "portsAttributes": {
    "9080": {
      "label": "Not NestJS Example",
      "onAutoForward": "notify"
    }
  },

```

### Setup Postgres Database (optional, if you need Postgresql in a container)

Update the local_setup.sh to use new name of the Database you'd like to use (if you use Database)

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

This script will create a dockerized postgres container named `postgres_local` if it does not exist and create run & test databases for this server in that postgres container

### OpenFeature

_Please ask the Product Manager responsible for your service to provide you the LaunchDarkly sdkKey._

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

copy the `openfeature` dir and import `openfeature.module` to your code.
to use the end-point guard, you should import the guard to the controller that you use them, see the example.controller.ts for code how to accomplish it.

### Logging

This repo uses pino logging, including pino-http. This means all incoming HTTP requests are automatically logged.  
Pino logging format is set in the app.module.ts, and should be considered Logging standard.

There are 3 environment Variables that influence logging:

- LOG_LEVEL : determines how verbose the logging will be (i.e. when LOG_LEVEL=info, trace and debug messages won't be added to the log) see below for valid values
- PINO_PRETTY : boolean value determines if the logs will be written in pretty format or JSON
- LINEPULSE_ENV : only if LINEPULSE_ENV=lcl (which you should keep when you are developing in your local PC IDE), the colorization will be used in pino-pretty, and it affects redactation as well.

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
For local development and debug, colored logs are often helpful, however, for production execution, colorization will introduce special characters into the log stream and make log hard to read. So we configure the log to use colorization when LINEPULSE_ENV=lcl, but turn colorization off for all other cases.

Log Redactation
We shall redact sensitive informations in logs, by default the following are redacted [
"req.headers.Authorization",
"req.headers.authorization",
"req.headers.cookie",
]
the SER team can append (but can't disable these 3) by setting Environment Variable LOGGING_REDACT_PATTERS as a JSON string -- the code will append by doing .concat(JSON.parse(configService.get<string>("LOGGING_REDACT_PATTERNS") || "[]" ))

Log message verboseness
to balance amount of characters logged and details of info needed, LOG_LEVEL will also influence how much HTTP request/response details are logged with each log message, trace as all info (other than redacted), debug will have most, and info for higher will only have req.id , req.method + req.url in the log

## Standard Endpoints

### version endpoint

The `/version` end-point provide 3 key info

- the version number you set in the `package.json` file, this is the source code version you as the developer set
  - the first digit is the Major version, which for Linepulse, it should be 3
  - the second digit is the minor version, typically it means important feature enhancements
  - the third digit is the patch number, typically these are non-breaking bug fixes, or non-breaking feature updates
- the value of an Environment Variable `LINEPULSE_SVC_VERSION` that is set by SRE at run time
  - this is often the build number of the container running, combined with the above, it gives a clear idea of what code was built at what time
- commit info
  - this actually requires you to provid a valid JWT (issued by AAD, not Auth0 because these are internal Acerta info) if you don't have a valid JWT, you will see "Unauthorized to view commit info"
  - assuming you have a valid JWT, this section will show you the timestamp and branch of the latest commit, the list of files changed by this latest commit, and it will also show you the commit hash and description of the previous 2 commits.

### health endpoint

- The `/health` end-point calls the health() function in app.service.ts
  You provide an array of strings as the parameter for health() function. Each member of this array is an URL that represents a backend service your current service depends on. The health() function will iterate through the members of the array and perform healthPingCheck of each.
  - The idea is this service should not report "200 healthy" unless all services it depends on also reports back "200 healthy".
    In this example 2 pingCheck were performed, to \$SVC_1_ENDPOINT and \$SVC_2_ENDPOINT.
- The database (if your services needs a database, you should have set DATABASE_TYPE to a valid value like "postgres").
  - you do not need to provide parameters to the health() function to check the Database, make sure your Environment Variable `DATABASE_TYPE` is set properly (i.e. to "postgres").
  - if `DATABASE_TYPE` is "none" or not set, then the health() function will not check the Database.

### config endpoint

The /config endpoint is JWT protected, if you don't have a valid AAD JWT that gives you permission, this end-point will return 401 instead of any info

- if you do have a valid AAD JWT, you will be able to see the running setting values of all the configuration you set in the validationSchema section of the app.module.ts and your database configure in the ./config/db.ts

### metrics endpoint

`/metrics` will report system metrics to Prometheus.

## Swagger

Swagger is used for automatically document APIs following OpenAPI standards.
However, Swagger is DISABLED if Environment Variable SWAGGER_ON=false (which is the default value). This should be the default behavior for all services running in production unless otherwise required.

Please note that Swagger uses the name, description, and version info you update in your package.json

- An optional `SERVICE_PREFIX` Environment Variable allows the SRE to add a prefix to all controllers this service listens to.
  - the 4 standard services are not affected by this SERVICE_PREFIX
- @ApiTags, @ApiOperation, @ApiResponse are used to describe your endpoints.
- @ApiBearerAuth is used to allow Swagger to call those tagged end-points with a JWT that you can set in the Swagger ui

## ConfigService

We use **standard** Nestjs ConfigService. The required Environment Variables are listed in the app.module.ts files in the `validationSchema` section under `imports:[ConfigModule.forRoot]` using Joi notions.  
This ensures the service will fail on start if the required Environment Variable has not been set. You can also provide default values in here as well so that instead of fail to start, ConfigService can use that default value if the EnVar is not set.

You should list **all** Environment Variables your code use here, even if they are completely optional. The only exception is for Database configuration should be listed in the config/db.ts (see below).

This also centralize all environment variables in one place and help documenting them. Please remember, it is your responsibility to clearly list all the required Environment Variables that your service needs, and your service should fail starting up if such environment variable do not exist.

### Database Config

If your service requires database, please use TypeOrm.
To configure your database, first make sure you set `DATABASE_TYPE` to "postgres" or any other valide database provider. Then use the src/config/db.ts for further configurations.

The convention is if your `DATABASE_TYPE=postgres` then all POSTGRES related configuration should be configured with `POSTGRES_` as prefix. The current db.ts actually will try to map Environemnt Variables to Postgres config with these rules:

- all DATABASE related config should be listed in the src/config/db.ts file, the Joi.ObjectSchema variable
- all POSTGRES\_ prefix will be removed, and variable will be converted to camelCase. i.e. POSTGRES_DROP_SCHEMA Environment Variable will be mapped to dropSchema option of the postgres option.
- you are able to add other postgres options that are not controled by Environment Variables in the `registerAs` section.
  - for example entities and migrations files are stored per our choice, and will not be differ at run time, so they are added here.

#### Database Migration

It is expected that all database changes are handled by migration scripts so existing data are preserved and converted to the new format without the risk of data loss.

TypeOrm has migration capability built in. Long story short, you should always keep synchrinization off unless you are running some PoC and expect a lot of changes, and lots of changes that need to be discarded.

Normally turn synchronization off, keep Migration on, and once you make changes to your entities, use

```
npm run typeorm  migration:generate migration/name_of_this_migration
```

or us the following command as an alternative

```
npx typeorm-ts-node-commonjs migration:generate migration/{mig_name} -d ormconfig.ts
```

to let TypeOrm generate migration scripts for you.

**Note** you should review the contents of the migration scripts and make sure they are correct.
Migration scripts should be incremental, meaning they are applied according the their timestamp (which is the prefix of their file name). You shall always keep all migration scripts, which means playing all these migration scripts from scratch (an empty database) should bring a working copy of the database with the latest database structure that is needed by your latest application code.

## debug and run

### debug nestjs using npm

You should be able to use the "Run" menu and debug function. Click the sidebar Debug icon, and select "Launch via NPM" to the right of "RUN and DEBUG" label. You can also use menu "Run"->"Start Debug", VSCode should start nmp for you, and ask you if you want to open web browser. Open the web broswer, you should be able to see swagger and make testing API call.
These are configured using the package.json, and .vscode/launch.json and .vscode/task.json

### launch using runtime container

You can also test it in a docker container, select "Docker Node.js Launch" next the "RUN and DEBUG" label, You can also use menu "Run"->"Start debugging" (it launches what you select in the previous drop down), this time, VScode should build docker container for you.  
Once the image is built and started, you should be able to see it running in the Docker explorer window within VSCode, your default browser should pop up and open the main page of the Nestjs application.

Troubleshoot:
If the Nest application is running, you should at least be able to open a terminal inside VSCode, and run:
` docker exec nestjsexample-dev curl http://localhost:9080/health`
_Note,_ the nest server runs inside the runtime container, out of the devcontainer, that's why you need to call the docker exec nestjsexample-dev that exec the curl inside the debug container.
Next, SSH to the remote host where the docker container runs, and do
`curl http://localhost:<map-port>/health`
should show you the same results. <map-port> is the port docker used to map host port to docker exposed port, you can get this port number by calling `docker ps | grep 9080`, the default is 9080 (we mapped container port 9080 to host port 9080)

### test with jest

You can and should also test your code using automated tests. Jest is standard in this repo. Select "Docker Node.js Launch" next the "RUN and DEBUG" label, You can also use menu "Run"->"Start debugging" (it launches what you select in the previous drop down), chose either "Test with npm test" or "Test with npm test:e2e" the differences is the e2e test will test the app.module (the root module for your application) while the non-e2e will test each module independently only. So most likely in early stages of development work, only the non-e2e tests will work, but closer to PR, you should test using e2e one.
The jest testing coverage report is turned on, and at `All files` level the %statement, %Funcs %Lines coverage should be 75% or higher.

## Test

As a developer, it is your responsibility to write unit testing and service level end-2-end testing that are repeatable.
It is expected that

- Automated testing code coverage should be >80%
- If automated testing cannot pass, you should **NOT** create a PR to try to merge your code to any major branches
- You should add test cases whenever you address a bug, as part of the bug fixes, you should produce automated test cases to tes the bug has been fixed, and it can be used to test in the future, the bug would not return

Tests are created as `*.spec.ts`. When jest runs (either via the Debug and RUn menu, or manually), it will look for all the directories and run the \*.spec.ts files.

### Unit testing

Unit testing are usually stored next to the functions they test. Typically you can think of your goal is to call those functions, and make sure however, you call them, they return you expected values.

### e2e testing

End-2-end testing are tests that "put all components, modules together", in some cases, that even involves making connections to other services.
e2e testing are stored under the `test` directory that is next to the `src` dir.

You probalby noticed that next to our main.ts file, there is a main.config.ts file. This is because when we run test, we create a testing App Module which allows us to look deeper into the execution. However, this means we are _not_ using the main app.  
That's why we move most of the configuration into the main.config.ts so that we can re-use the setup of the app when we set up the testing App Module. As you can see in the setup-e2e.ts we are able to turn Logging off after the mainConfig(app), which is a demonstration of the benefit of this setup.

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

You probably noticed that the main.ts file is very short and concise. Most of the actual configuration of the main app is done in main.config.ts This allows us to test the mainconfig of the app in our e2e test scripts. The main.ts is actually not used during e2e test (so that test can interject the app and calcuate test coverage, mocks, etc)

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

## References

- supportingmultitenancy with nest-js-typeorm
  https://thomasvds.com/schema-based-multitenancy-with-nest-js-type-orm-and-postgres-sql/
  TypeORM technical vocabulary
  https://typeorm.delightful.studio/globals.html
