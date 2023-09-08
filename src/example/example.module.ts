import { HttpModule } from "@nestjs/axios";
import { Module, Logger } from "@nestjs/common";
import { ExampleController, ExampleDevOnlyController } from "./example.controller";
import { ExampleService } from "./example.service";

@Module({
  imports: [HttpModule],
  controllers: [ExampleController, ExampleDevOnlyController],
  providers: [Logger, ExampleService],
  exports: [ExampleService],
})
export class ExampleModule {}
