/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpModule } from "@nestjs/axios";
import { Module, Logger } from "@nestjs/common";
import { ExampleController } from "./example.controller";
import { ExampleService } from "./example.service";

@Module({
  imports: [HttpModule],
  controllers: [ExampleController],
  providers: [Logger, ExampleService],
  exports: [ExampleService],
})
export class ExampleModule {}
