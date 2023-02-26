/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  private getSafeValueByKey(key: string, defaultValue?: string): string {
    const value =
      defaultValue === undefined
        ? this.nestConfigService.get<string>(key)
        : this.nestConfigService.get<string>(key, defaultValue);

    if (value === undefined) {
      throw new Error(`Please supply the ${key} environment variable`);
    }

    return value;
  }

  checkAllDefinedConfigs(): boolean {
    const getters = Object.entries(
      Object.getOwnPropertyDescriptors(ConfigService.prototype)
    )
      .filter(([, descriptor]) => typeof descriptor?.get === "function")
      .map(([key]) => key);

    getters.forEach((getter) => this[getter as keyof ConfigService]);
    return true;
  }

  get port(): number {
    return +this.getSafeValueByKey("PORT");
  }

  get host(): string {
    return this.getSafeValueByKey("HOST", "0.0.0.0");
  }

  get logLevel(): string {
    return this.getSafeValueByKey("LOG_LEVEL", "info");
  }

  // get databasePort(): number {
  //   return +this.getSafeValueByKey("DATABASE_PORT");
  // }

  // get databaseHost(): string {
  //   return this.getSafeValueByKey("DATABASE_HOST");
  // }

  // get databaseUser(): string {
  //   return this.getSafeValueByKey("DATABASE_USER");
  // }

  // get databasePassword(): string | undefined {
  //   return this.nestConfigService.get<string>("DATABASE_PASSWORD");
  // }

  // get databaseName(): string {
  //   return this.getSafeValueByKey("DATABASE_NAME");
  // }

  // get databaseMigrationsRun(): boolean {
  //   return (
  //     this.getSafeValueByKey("DATABASE_MIGRATIONS_RUN", "false") === "true"
  //   );
  // }

  // get databaseSynchronize(): boolean {
  //   return this.getSafeValueByKey("DATABASE_SYNCHRONIZE", "false") === "true";
  // }

  // get databaseDropSchema(): boolean {
  //   return this.getSafeValueByKey("DATABASE_DROP_SCHEMA", "false") === "true";
  // }
}
