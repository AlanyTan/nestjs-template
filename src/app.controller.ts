/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Req, Request, HttpException, UseGuards, Query, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckResult } from "@nestjs/terminus";
import { AadJwtValidator } from "@acertaanalyticssolutions/acerta-standardnpm";
import { PinoLogger } from "nestjs-pino";
import { AppService } from "app.service";
import { JwtGuard } from "utils/jwt-guard";

enum LogLevels {
  trace = "trace",
  debug = "debug",
  info = "info",
  warn = "warn",
  error = "error",
  fatal = "fatal",
}

@ApiTags("standard")
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly loggerService: PinoLogger,
    private readonly logger: Logger,
    private readonly configService: ConfigService
  ) {}

  @Get("health")
  @HealthCheck()
  health(): Promise<HealthCheckResult> {
    const backendServicesToCheck: string[] = [];
    return this.appService.health(backendServicesToCheck);
  }

  @Get("readiness")
  @HealthCheck()
  readiness(): Promise<HealthCheckResult> {
    const backendServicesToCheck: string[] = [];
    // // readiness prob of K8s if set, would check if this end-point is available,
    // // in RARE situations, this service might have a HARD dependency on another END-POINT (i.e. user service & OPENFGA)
    // // you can set the END-POINT of OPENFGA as "SVC_1_ENDPOINT" and this service will respond 503 if the service it depends on is not available
    //backendServicesToCheck.push(this.configService.getOrThrow("SVC_1_ENDPOINT"));
    return this.appService.health(backendServicesToCheck);
  }

  @Get("initialized")
  @HealthCheck()
  async initialized(): Promise<unknown> {
    // // in RARE situations, this service might have a HARD dependency on another END-POINT (i.e. user service & OPENFGA)
    // // you can set the END-POINT of OPENFGA as "SVC_1_ENDPOINT" and this service will respond 503 if the service it depends on is not available
    //backendServicesToCheck.push(this.configService.getOrThrow("SVC_1_ENDPOINT"));
    if (this.appService.initialized) {
      return { status: "ok", info: { initialized: { status: "up" } } };
    } else {
      throw new HttpException(
        {
          status: "down",
          error: {
            initialized: {
              status: "down",
              message: "initialization not finished yet...",
            },
          },
        },
        503
      );
    }
  }

  @Get("version")
  @ApiBearerAuth("JWT-auth")
  async version(@Req() request: Request): Promise<unknown> {
    let commitJson = {};
    let buildJson = {};
    try {
      const aadJwtValidator = new AadJwtValidator(
        this.configService.get("AAD_TENANT_ID", ""),
        this.configService.get("AAD_CLIENT_ID", "")
      );
      const jwtIsValid = await aadJwtValidator.validateAadJwt(request);
      commitJson = { commitInfo: this.configService.get("commitInfo") };
      buildJson = { buildInfo: this.configService.get("buildInfo") };
    } catch (err) {
      commitJson = { commitInfo: "Unauthorized to view commit info" };
      buildJson = { buildInfo: "Unauthorized to view build info" };
    }
    return {
      version: this.configService.get("version"),
      ...commitJson,
      ...buildJson,
    };
  }

  @Get("config")
  @ApiBearerAuth("JWT-auth")
  @UseGuards(JwtGuard)
  config(): unknown {
    return this.appService.configuration();
  }

  @Get("update_log_level")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "update log level" })
  @ApiQuery({
    name: "loglevel",
    description: "new log level to be set to",
    enum: LogLevels,
    required: true,
  })
  @UseGuards(JwtGuard)
  updateLogLevel(@Query("loglevel") logLevel: LogLevels): string {
    if (this.loggerService !== undefined) {
      PinoLogger.root.level = logLevel;
      this.loggerService.logger.level = logLevel;
      this.logger.error(`Changing LogLevel... this is an confirmation message that Error messages are shown.`);
      this.logger.warn(`Changing LogLevel... this is an confirmation message that Warnning messages are shown.`);
      this.logger.log(`Changing LogLevel... this is an confirmation message that Info messages are shown.`);
      this.logger.debug(`Changing LogLevel... this is an confirmation message that Debug messages are shown.`);
      this.logger.verbose(`Changing LogLevel... this is an confirmation message that Trace messages are shown.`);
      return `log level set to ${logLevel}`;
    } else {
      return "loggerService is undefined";
    }
  }
}
