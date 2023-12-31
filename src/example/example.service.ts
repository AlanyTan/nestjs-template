import { HttpService } from "@nestjs/axios";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { openfeature } from "@acertaanalyticssolutions/acerta-standardnpm";
import { OPENFEATURE_CLIENT } from "config";

//we will use the standard logger from nestjs, but it is actually pino writting the logs (set up in main.ts and app.module.ts)
@Injectable()
export class ExampleService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    @Inject("REQUEST_SCOPED_HTTP_SERVICE") private readonly httpService: HttpService,
    @Inject(OPENFEATURE_CLIENT) private openFeature: openfeature,
  ) {}

  get newFeature1(): string {
    const responseData = this.httpService.get("https://jsonplaceholder.typicode.com/todos/1");
    return "the Value of New Feature 1" + responseData;
  }

  get newFeature2(): string {
    return "the Value of New Feature 2!";
  }

  async getExample(): Promise<string> {
    const newFeatureFlag = await this.openFeature.client.getBooleanValue("new-feature-flag", false, {
      transactionContext: "specific context for this particular transation",
    });
    this.logger.debug(
      "Calling getExample within the service with debug details: " + " and new feature flag is " + newFeatureFlag,
      "ExampleService:debug",
    );
    this.logger.verbose(
      "Calling getExample within the service with trace including details: " +
        " and new feature flag is " +
        newFeatureFlag,
      "ExampleService:trace",
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
      return "Hello World from <the Original feature>!\n" + "New feature flag is " + newFeatureFlag;
    } // end of else block, if the old feautre is to be removed, we can remove the else block and the if statement above
  }

  async getRandonNumber(): Promise<number> {
    const delaySeconds = Math.floor(Math.random() * 10); // Random delay between 1 and 10 seconds

    await this.delay(delaySeconds * 1000); // Convert seconds to milliseconds and wait for the random delay

    const randomNumber = Math.floor(Math.random() * 100) + 1; // Random number between 1 and 100

    return randomNumber;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
