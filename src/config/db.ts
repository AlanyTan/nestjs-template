import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as Joi from "joi";

const envVarsSchema: Joi.ObjectSchema = Joi.object({
  DATABASE_TYPE: Joi.string().allow(
    "aurora-mysql",
    "aurora-postgres",
    "better-sqlite3",
    "capacitor",
    "cockroachdb",
    "cordova",
    "expo",
    "mariadb",
    "mongodb",
    "mssql",
    "mysql",
    "nativescript",
    "oracle",
    "postgres",
    "react-native",
    "sap",
    "sqlite",
    "sqljs",
    "spanner",
    "none"
  ),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().required(),
  POSTGRES_USERNAME: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DATABASE: Joi.string().required(),
  POSTGRES_SYNCHRONIZE: Joi.boolean().default(false),
  POSTGRES_MIGRATIONS_RUN: Joi.boolean().default(true),
  POSTGRES_DROP_SCHEMA: Joi.boolean().default(false),
  SQLITE_DATABASE: Joi.string(),
}).options({ stripUnknown: true });

/***
 * This function takes an environment variable name and an optional prefix to remove,
 * and returns the name of the config variable that the environment variable maps to.
 * For example:
 *  mapEnVarToConfigKey("foo") => "foo"
 * mapEnVarToConfigKey("fooBar") => "fooBar"
 * mapEnVarToConfigKey("fooBar") => "fooBar"
 * mapEnVarToConfigKey("FOO_BAR") => "fooBar"
 * mapEnVarToConfigKey("FOO_BAR", "foo") => "bar"
 * mapEnVarToConfigKey("FOO_BAR", /foo/) => "bar"
 */
function ENVARToCamelCase(
  enVar: string,
  prefixToRemove?: string | RegExp
): string {
  // If the prefix should be removed, remove it
  if (prefixToRemove !== undefined) {
    enVar = enVar.replace(prefixToRemove, "");
  }

  // Define a regex pattern that matches any underscore followed by a character
  const pattern = /[^a-zA-Z0-9]+([a-zA-Z0-9])/g;

  // Replace the pattern with the character, converting it to lower case
  const resultStr = enVar
    .toLowerCase()
    .replace(pattern, (match, p1) => p1.toUpperCase());

  // Return the resulting string
  return resultStr;
}

export default registerAs("database", (): TypeOrmModuleOptions => {
  const { error, value: validatedEnvConfig } = envVarsSchema.validate(
    process.env,
    { allowUnknown: true }
  );
  const typeOfDatabase = validatedEnvConfig.DATABASE_TYPE ?? "none";
  if (typeOfDatabase === "none") {
    return {} as TypeOrmModuleOptions;
  } else {
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
  }
  interface TypeOrmConfig {
    [key: string]: unknown;
  }
  const typeOrmConfig: TypeOrmConfig = {
    type: typeOfDatabase,
  };
  if (typeOfDatabase !== "none") {
    typeOrmConfig.entities = [`${__dirname}/../**/*.entity{.ts,.js}`];
    typeOrmConfig.migrations = [`${__dirname}/../migrations/*{.ts,.js}`];
    typeOrmConfig.autoLoadEntities = true;
    typeOrmConfig.cli = { migrationsDir: "src/migrations" };
    const prefixRegExp = new RegExp(`^${typeOfDatabase.toUpperCase()}_`, "i");
    for (const configItem in validatedEnvConfig as Record<string, string>) {
      if (configItem.match(prefixRegExp)) {
        const configKey = ENVARToCamelCase(configItem, prefixRegExp);
        typeOrmConfig[configKey] = validatedEnvConfig[configItem];
      }
    }
  }
  const returnConfig = typeOrmConfig as TypeOrmModuleOptions;
  return returnConfig;
});

// how to use dynamic table names for same table structure
// https://medium.com/@terence410/working-with-dynamic-table-name-with-typeorm-6a67128b9671
