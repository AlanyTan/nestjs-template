/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

//we will use the standard logger from nestjs, but it is actually pino writting the logs (set up in main.ts and app.module.ts)
@Injectable()
export class ExampleService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger = new Logger(ExampleService.name)
  ) {}
  getExample(): string | PromiseLike<string> {
    this.logger.debug(
      { msg: "Calling getExample within the service with debug" },
      "ExampleService:debug"
    );
    this.logger.verbose(
      "Calling getExample within the service with trace including details: " +
        this.configService.get("HOST") +
        ":" +
        this.configService.get("PORT"),
      "ExampleService:trace"
    );
    return (
      "Hello World from " +
      this.configService.get("HOST") +
      ":" +
      this.configService.get("PORT") +
      "!"
    );
  }

  private checkAllDefinedConfigs(): boolean {
    const getters = Object.entries(
      Object.getOwnPropertyDescriptors(ExampleService.prototype)
    )
      .filter(([, descriptor]) => typeof descriptor?.get === "function")
      .map(([key]) => key);

    getters.forEach((getter) => this[getter as keyof ExampleService]);
    return true;
  }
}
