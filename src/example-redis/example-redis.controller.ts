/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Version, Logger, UseGuards, Param, Delete, Post, Body, HttpException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
} from "@nestjs/swagger";
import Joi from "joi";
import { OpenFeatureGuard } from "utils";
import { CustomerDto, CreateCustomerDto } from "./dto/customer.dto";
import { RedisService } from "./example-redis.service";

@ApiTags("example_redis")
@Controller({ path: "example_redis", version: "1" })
export class ExampleRedisController {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly logger: Logger = new Logger(ExampleRedisController.name)
  ) {}

  @Get("ping")
  @ApiOperation({ summary: "ping redis server" })
  @ApiResponse({
    status: 200,
    description: "Return Pong.",
  })
  @ApiResponse({
    status: 500,
    description: "The service run into internal trouble, please check error logs for details.",
  })
  async redisPing(): Promise<string> {
    this.logger.log("Calling redisPing with info", "redisPing");
    return this.redisService.ping();
  }

  @Post("save_object:/:key")
  @ApiOperation({ summary: "save a JSON object to redis server" })
  @ApiCreatedResponse({
    status: 201,
    description: "Return the key saved.",
  })
  @ApiResponse({
    status: 400,
    description: "The request sent was invalid or uninterpretable.",
  })
  @ApiResponse({
    status: 500,
    description: "The service run into internal trouble, please check error logs for details.",
  })
  @ApiParam({
    name: "key",
    description: "the key(id) of the object to be saved",
    type: String,
    required: true,
  })
  @ApiBody({
    description: "the user to be created",
    type: CreateCustomerDto,
    required: true,
  })
  async redisJsonSet(@Param("key") key: string, @Body() value: string): Promise<string> {
    this.logger.log("Calling redisSet with info", "redisSet");
    let keyToUse = key;
    if (!key) {
      keyToUse = "user";
    }
    return this.redisService.saveObject(keyToUse, value);
  }

  @Get("get_object/:key")
  @ApiOperation({ summary: "get a JSON object from redis server" })
  @ApiOkResponse({
    status: 200,
    description: "Return the Object that matches the key.",
    type: CustomerDto,
  })
  @ApiResponse({
    status: 400,
    description: "The request sent was invalid or uninterpretable.",
  })
  @ApiResponse({
    status: 500,
    description: "The service run into internal trouble, please check error logs for details.",
  })
  @ApiParam({
    name: "key",
    description: "the key to be retrieved",
    type: String,
    required: true,
  })
  async redisJsonGet(@Param("key") key: string): Promise<CustomerDto> {
    this.logger.log("Calling redisGet with info", "redisGet");
    let keyToUse = key;
    if (!key) {
      keyToUse = "customer";
    }
    return (await this.redisService.getObject(keyToUse)) as CustomerDto;
  }
}
