import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export function dbConfig(): TypeOrmModuleOptions {
  //   {
  //   databaseHost,
  //   databasePort,
  //   databaseUser,
  //   databasePassword,
  //   databaseName,
  //   databaseMigrationsRun,
  //   databaseSynchronize,
  //   databaseDropSchema,
  // }: ConfigService
  return {
    // type: "postgres",
    // host: databaseHost,
    // port: databasePort,
    // username: databaseUser,
    // password: databasePassword,
    // database: databaseName,
    // migrationsRun: databaseMigrationsRun,
    // synchronize: databaseSynchronize,
    // dropSchema: databaseDropSchema,
    // entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
    // migrations: [`${__dirname}/../../migrations/*{.ts,.js}`],
    // cli: {
    //   migrationsDir: "migrations",
    // },
  };
}

export default registerAs(
  "database",
  (): TypeOrmModuleOptions => ({
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    username: process.env.DATABASE_USER || "",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "",
    migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === "true" || false,
    synchronize: process.env.DATABASE_SYNCHRONIZE === "true" || false,
    dropSchema: process.env.DATABASE_DROP_SCHEMA === "true" || false,
    entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
    migrations: [`${__dirname}/../../migrations/*{.ts,.js}`],
    // cli: {
    //   migrationsDir: "migrations",
    // },
  })
);
