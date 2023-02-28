/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module, Logger } from "@nestjs/common";
import { OpenFeature } from "@openfeature/js-sdk";
import { OPENFEATURE_CLIENT } from "../constants";
import { ExampleController } from "./example.controller";
import { ExampleService } from "./example.service";

@Module({
  imports: [],
  controllers: [ExampleController],
  providers: [
    Logger,
    ExampleService,
    {
      provide: OPENFEATURE_CLIENT,
      useFactory: () => {
        const client = OpenFeature.getClient("app");
        return client;
      },
    },
  ],
})
export class ExampleModule {}
