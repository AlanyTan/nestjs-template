import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  private getSafeValueByKey<T>(key: string, defaultValue?: T): T {
    const { nestConfigService } = this;

    const value =
      defaultValue === undefined
        ? nestConfigService.get<T>(key)
        : nestConfigService.get<T>(key, defaultValue);

    if (value === undefined) {
      throw new Error(
        `Please supply the ${key} environment variable in the .env file.`
      );
    }

    return value;
  }

  get port(): number {
    return this.getSafeValueByKey<number>("PORT", 9080);
  }

  get host(): string {
    return this.getSafeValueByKey<string>("HOST", "0.0.0.0");
  }

  get databasePort(): number {
    return this.getSafeValueByKey<number>("DATABASE_PORT");
  }

  get databaseHost(): string {
    return this.getSafeValueByKey<string>("DATABASE_HOST");
  }

  get databaseUser(): string {
    return this.getSafeValueByKey<string>("DATABASE_USER");
  }

  get databasePassword(): string | undefined {
    return this.nestConfigService.get<string>("DATABASE_PASSWORD");
  }

  get databaseName(): string {
    return this.getSafeValueByKey<string>("DATABASE_NAME");
  }
}
