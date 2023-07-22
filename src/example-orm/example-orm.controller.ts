/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Version, Logger, UseGuards, Param, Delete, Post, Body, HttpException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiParam } from "@nestjs/swagger";
import Joi from "joi";
import { OpenFeatureGuard } from "utils";
import { UserDto, CreateUserDto } from "./dto/user.dto";
import { Person, User, UserEntitySchema } from "./entities/user.entity";
import { ExampleOrmService } from "./example-orm.service";

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
    description: "The query was properly executed, but there is no users found so the return is an empty list.",
  })
  @ApiResponse({
    status: 400,
    description: "The request sent was invalid or uninterpretable.",
  })
  @ApiResponse({
    status: 500,
    description: "The service run into internal trouble, please check error logs for details.",
  })
  async findAll(): Promise<User[]> {
    this.logger.log("Calling findAll with info", "findAll");
    return this.exampleOrmService.findAll();
  }

  @Get("find_one/:uuid")
  @Version("2")
  @ApiOperation({ summary: "Retrieve a user by id" })
  @ApiParam({
    name: "uuid",
    description: "the uuid that uniquely identifies a user",
    required: true,
  })
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
    description: "The service run into internal trouble, please check error logs for details.",
  })
  async findOne(@Param("uuid") uuid: string): Promise<User | null> {
    this.logger.log("Calling findOne with info", "findOne");
    const { error } = Joi.string().uuid({}).validate(uuid);
    if (error) {
      throw new HttpException(error.message, 400);
    }
    return this.exampleOrmService.findOne(uuid);
  }

  @Post("create")
  @Version("1")
  @ApiOperation({ summary: "Create a new user" })
  @ApiBody({
    description: "the user to be created",
    type: CreateUserDto,
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: "User created.",
  })
  @ApiResponse({
    status: 400,
    description:
      "The request sent was invalid or uninterpretable (i.e. the data for the User to be created is not valid).",
  })
  @ApiResponse({
    status: 500,
    description: "The service run into internal trouble, please check error logs for details.",
  })
  async create(@Body() user: User): Promise<User> {
    this.logger.log("Calling create user with info", "creating user");
    try {
      const savedUser = await this.exampleOrmService.create(user);
      return savedUser;
    } catch (error) {
      throw new HttpException(error || `Error saving ${user}`, 400);
    }
  }

  @Delete("delete/:uuid")
  @Version("1")
  @ApiOperation({ summary: "Delete a user by id" })
  @ApiParam({
    name: "uuid",
    description: "the uuid that uniquely identifies a user",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "User deleted.",
  })
  @ApiResponse({
    status: 204,
    description: "The specified User does not exist so no action happened, (and the user still does not exist).",
  })
  @ApiResponse({
    status: 400,
    description: "The request sent was invalid or uninterpretable.",
  })
  @ApiResponse({
    status: 500,
    description: "The service run into internal trouble, please check error logs for details.",
  })
  @UseGuards(OpenFeatureGuard("new-end-point"))
  async delete(@Param("uuid") uuid: string): Promise<void> {
    this.logger.log("Calling delete user with info", "delete user");
    await this.exampleOrmService.delete(uuid);
  }
}
