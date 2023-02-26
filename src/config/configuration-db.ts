import { registerAs } from "@nestjs/config";

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
  migrationsRun: boolean;
  synchronize: boolean;
  dropSchema: boolean;
}

export default registerAs(
  "database",
  (): DatabaseConfig => ({
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    user: process.env.DATABASE_USER || "",
    password: process.env.DATABASE_PASSWORD || "",
    name: process.env.DATABASE_NAME || "",
    migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === "true" || false,
    synchronize: process.env.DATABASE_SYNCHRONIZE === "true" || false,
    dropSchema: process.env.DATABASE_DROP_SCHEMA === "true" || false,
  })
);
