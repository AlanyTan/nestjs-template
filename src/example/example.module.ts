/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module, Logger } from "@nestjs/common";
//import { OpenFeatureModule } from "openfeature";
import { ExampleController } from "./example.controller";
import { ExampleService } from "./example.service";

@Module({
  //  imports: [OpenFeatureModule],
  controllers: [ExampleController],
  providers: [Logger, ExampleService],
})
export class ExampleModule {}
