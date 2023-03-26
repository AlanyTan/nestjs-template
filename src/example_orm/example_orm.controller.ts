/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Version,
  Logger,
  UseGuards,
  Param,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { OpenFeatureGuard } from "utils";
import { User } from "./entities/user.entity";
import { ExampleOrmService } from "./example_orm.service";

@ApiTags("example_orm")
@Controller({ path: "example_orm", version: "1" })
export class ExampleOrmController {
  constructor(
    private readonly exampleOrmService: ExampleOrmService,
    private readonly configService: ConfigService,
    private readonly logger: Logger = new Logger(ExampleOrmController.name)
  ) {}
  @Get("find_all")
  @Version("1")
  @ApiOperation({ summary: "List all users" })
  @ApiResponse({
    status: 200,
    description: "Return list of all users.",
  })
  @ApiResponse({
    status: 204,
    description:
      "The query was properly executed, but there is no users found so the return is an empty list.",
  })
  @ApiResponse({
    status: 400,
    description: "The request sent was invalid or uninterpretable.",
  })
  @ApiResponse({
    status: 500,
    description:
      "The service run into internal trouble, please check error logs for details.",
  })
  async findAll(): Promise<User[]> {
    this.logger.log("Calling getExample with info", "ExampleController:info");
    return this.exampleOrmService.findAll();
  }

  @Get("find_one/:id")
  @Version("2")
  @ApiOperation({ summary: "Retrieve a user by id" })
  @ApiResponse({
    status: 200,
    description: "Returned user detail.",
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
      "The service run into internal trouble, please check error logs for details.",
  })
  @UseGuards(OpenFeatureGuard("new-end-point"))
  async findOne(@Param("id") id: string): Promise<User | null> {
    this.logger.log("Calling getExample with info", "ExampleController:info");
    return this.exampleOrmService.findOne(parseInt(id));
  }
}
