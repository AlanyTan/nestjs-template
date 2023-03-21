/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Version, Logger, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import OpenFeatureGuard from "utils/openfeature-guard";
import { ExampleService } from "./example.service";

@ApiTags("example")
@Controller({ path: "example", version: "1" })
export class ExampleController {
  constructor(
    private readonly exampleService: ExampleService,
    private readonly configService: ConfigService,
    private readonly logger: Logger = new Logger(ExampleController.name)
  ) {}
  @Get("get_request")
  @Version("1")
  @ApiResponse({
    status: 200,
    description: "Normal run, with sample and calculation returned.",
  })
  @ApiResponse({
    status: 204,
    description: "No data found for the given query filter.",
  })
  @ApiResponse({
    status: 400,
    description: "The request sent was invalid or uninterpretable.",
  })
  @ApiResponse({
    status: 500,
    description:
      "Error processing cap metrics calculation, please check error message for details.",
  })
  async getExample(): Promise<string> {
    this.logger.log("Calling getExample with info", "ExampleController:info");
    return this.exampleService.getExample();
  }

  @Get("get_request")
  @Version("2")
  @ApiResponse({
    status: 200,
    description: "Normal run, with sample and calculation returned.",
  })
  @ApiResponse({
    status: 204,
    description: "No data found for the given query filter.",
  })
  @ApiResponse({
    status: 400,
    description: "The request sent was invalid or uninterpretable.",
  })
  @ApiResponse({
    status: 500,
    description:
      "Error processing cap metrics calculation, please check error message for details.",
  })
  @UseGuards(OpenFeatureGuard("new-end-point"))
  async getNewExample(): Promise<string> {
    this.logger.log("Calling getExample with info", "ExampleController:info");
    return this.exampleService["newFeature2"];
  }
}
