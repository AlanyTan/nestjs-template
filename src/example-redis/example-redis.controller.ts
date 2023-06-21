/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Version,
  Logger,
  UseGuards,
  Param,
  Delete,
  Post,
  Body,
  HttpException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiParam,
} from "@nestjs/swagger";
import Joi from "joi";
import { OpenFeatureGuard } from "utils";
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
  @Version("1")
  @ApiOperation({ summary: "ping redis server" })
  @ApiResponse({
    status: 200,
    description: "Return Pong.",
  })
  @ApiResponse({
    status: 500,
    description:
      "The service run into internal trouble, please check error logs for details.",
  })
  async redisPing(): Promise<string> {
    this.logger.log("Calling redisPing with info", "redisPing");
    return this.redisService.ping();
  }
}
