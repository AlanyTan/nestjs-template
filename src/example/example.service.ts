/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "@openfeature/js-sdk";
import { OPENFEATURE_CLIENT } from "openfeature";

//we will use the standard logger from nestjs, but it is actually pino writting the logs (set up in main.ts and app.module.ts)
@Injectable()
export class ExampleService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger = new Logger(ExampleService.name),
    @Inject(OPENFEATURE_CLIENT) private client: Client
  ) {}

  get newFeature1(): string {
    return "the Value of New Feature 1";
  }

  get newFeature2(): string {
    return "the Value of New Feature 2!";
  }

  async getExample(): Promise<string> {
    const newFeatureFlag = await this.client.getBooleanValue(
      "new-feature-flag",
      false,
      { transactionContext: "specific context for this particular transation" }
    );
    this.logger.debug(
      {
        msg:
          "Calling getExample within the service with debug details: " +
          " and new feature flag is " +
          newFeatureFlag,
      },
      "ExampleService:debug"
    );
    this.logger.verbose(
      "Calling getExample within the service with trace including details: " +
        JSON.stringify(this.configService.get("logger")) +
        " and new feature flag is " +
        newFeatureFlag,
      "ExampleService:trace"
    );

    if (newFeatureFlag) {
      return (
        "Hello World from <New Feature> \n" +
        "New line from New Feature says:" +
        this["newFeature1"] +
        ".\n" +
        "Because the new-feature-flag value is: " +
        newFeatureFlag
      );
    } else {
      // if the new feature flag is false, we will return the old message
      return (
        "Hello World from <the Original feature>!\n" +
        "New feature flag is " +
        newFeatureFlag
      );
    } // end of else block, if the old feautre is to be removed, we can remove the else block and the if statement above
  }
}
