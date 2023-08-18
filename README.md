[![Pipeline Status](https://dev.azure.com/acerta/Line%20Pulse/_apis/build/status%2Fnestjs-example?repoName=AcertaAnalyticsSolutions%2Fnestjs-example&branchName=main)](https://dev.azure.com/acerta/Line%20Pulse/_build/latest?definitionId=197&repoName=AcertaAnalyticsSolutions%2Fnestjs-example&branchName=main)

# Acerta NestJS Example

## Background

This repository offers a standardized template that serves as a starting point for creating Node.js backend microservices.

For documentation about the template elements and how to used them see [docs/TEMPLATE.md](./docs/TEMPLATE.md).

The provided template service implementation and its tests are runable. The next section documents how to set up the development environment to run them.

# Development setup

This setup documentation has been tested in GitHub Codespaces; both the web or desktop mode can be used. Using the dev container in directory `.devcontainer` is the recommended approach for doing development at Acerta because it removes discrepencies which are common when setting up on a local computer.

Launching development codespaces can be done in GitHub under the menu _<> Code_ (not _Use this template_).

## Install

NPM install is automatically ran as part of the dev container creation but when updating or pulling changes to dependencies, you will need to run:

```bash
npm install
```

## Service dependencies

See [docs/ENV.md](./docs/ENV.md) for environment variable configuration information.

Configure application environment variables for service execution:

```bash
cp test/test.env .env
```

Running tests does not require the previous `.env`. Tests use the file `test/test.env`.

To run the service or the service tests, you need to set up the Docker dependencies:

```bash
./local-db-setup.sh
```

You will need to rerun this script when your environment is restarted.

## NPM scripts

### Service scripts

Run the service:

```bash
npm start
```

You can add `-- --watch` for watch mode. You can add `--  --debug` for debug mode; make sure VCS auto attach is set to `--inspect`.

### Test scripts

- Unit: `npm run test:unit` - Fast unit tests
- Service: `npm run test:service` - Tests with which require Docker depencencies
- All: `npm test` - All of the above
- CI: `npm run test:ci` - Like all tests but with CI configuration. In local, you will need `echo -e "127.0.0.1\tpostgres" | sudo sh -c 'cat >> /etc/hosts'`.

You can add `-- --watch` for watch mode. You can disable coverage with `-- --collectCoverage=false`.

To run the tests in Codespaces, you need a machine with 8G+ of RAM. The default machine with 4G RAM will intermittently result in error "terminated" when running Jest.

## Visual Studio Code launching

You can also run the service and the tests using the VS Code launch configurations in `.vscode/launch.json` under the _Run and Debug_ menu.

### Code related scripts

Run TypeScript formatter and linter before committing:

```bash
    npm run format
    npm run lint
```

You can also format and lint in Visual Studio Code. The Husky pre-commit hook will enforce both formatting and litting.

## Visual Studio Code

Consider using synchronized User settings across all your Codespaces.

With a TypeScript file open, in bottom right of IDE, click _{}_ beside TypeScript, to use the project version of TypeScript.

You can debug the service or the tests using the provided VSC launch configurations.

Recommended extensions:

- Mongo `mongodb.mongodb-vscode` to view and edit your collections
- Jest `Orta.vscode-jest` to run individual tests easily. Root configuration file allows for both unit and service tests execution but for service tests you need to add this VSC setting:
  - `"jest.jestCommandLine": "npm run test --"`
- Git Blame `waderyan.gitblame` to track who made changes to the code
- Azure Pipelines (`ms-azure-devops.azure-pipelines`) which also installs Azure Account extension to edit YAML files under `pipelines`
- ShellCheck (`timonwong.shellcheck`) to edit `*.sh` files

# Build

# Docker build

```bash
docker build -t nestjs-example .
```
