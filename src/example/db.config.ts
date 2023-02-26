import { TypeOrmModuleOptions } from "@nestjs/typeorm";
// import { ConfigService } from "./config.service";

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
