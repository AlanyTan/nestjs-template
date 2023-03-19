import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export default registerAs(
  "database",
  (): TypeOrmModuleOptions => ({
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    username: process.env.DATABASE_USER || "",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "",
    migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === "false" || true,
    synchronize: process.env.DATABASE_SYNCHRONIZE === "true" || false,
    dropSchema: process.env.DATABASE_DROP_SCHEMA === "true" || false,
    entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
    migrations: [`${__dirname}/../../migrations/*{.ts,.js}`],
    // cli: {
    //   migrationsDir: "migrations",
    // },
  })
);

// how to use dynamic table names for same table structure
// https://medium.com/@terence410/working-with-dynamic-table-name-with-typeorm-6a67128b9671
