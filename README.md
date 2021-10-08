# NestJS Example

## Purpose

To provide a standardized starting point for our backend node.js microservices

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

### Node.js - v14.x.x

Windows

```
TODO - If you use Windows, please fill this out
```

Mac OS

```
TODO - If you use Mac OS, please fill this out
```

Debian/Ubuntu

```
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### npm - v7.x.x

Windows

```
TODO - If you use Windows, please fill this out
```

Mac OS

```
TODO - If you use Mac OS, please fill this out
```

Debian/Ubuntu

```
npm i -g npm@^7.23.0
```

### Nest CLI - v8.x.x

```
npm i -g @nestjs/cli@^8.1.1
```

## Getting Started

### Run Rename Script

This script will change all instances of "nestjs-example" to whatever you provide in the prompt

```
./rename.sh
```

### Run Local PostgreSQL Setup Script

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

### Install Dependencies

```
npm i
```

### Start NestJS Server

```
npm start
```
