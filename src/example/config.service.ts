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
}
