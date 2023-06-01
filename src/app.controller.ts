/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Version,
  VERSION_NEUTRAL,
  Req,
  Request,
  Res,
  Response,
  HttpException,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckResult } from "@nestjs/terminus";
import { AadJwtValidator } from "@acertaanalyticssolutions/acerta-standardnpm";
import { AppService } from "app.service";
import { JwtGuard } from "utils/jwt-guard";

@ApiTags("standard")
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService
  ) {}

  @Get("health")
  @Version(VERSION_NEUTRAL)
  @HealthCheck()
  health(): Promise<HealthCheckResult> {
    const backendServicesToCheck: string[] = [];
    return this.appService.health(backendServicesToCheck);
  }

  @Get("readiness")
  @Version(VERSION_NEUTRAL)
  @HealthCheck()
  readiness(): Promise<HealthCheckResult> {
    const backendServicesToCheck: string[] = [];
    // // in RARE situations, this service might have a HARD dependency on another END-POINT (i.e. user service & OPENFGA)
    // // you can set the END-POINT of OPENFGA as "SVC_1_ENDPOINT" and this service will respond 503 if the service it depends on is not available
    //backendServicesToCheck.push(this.configService.get("SVC_1_ENDPOINT", ""));
    return this.appService.health(backendServicesToCheck);
  }

  @Get("version")
  @Version(VERSION_NEUTRAL)
  @ApiBearerAuth("JWT-auth")
  async version(@Req() request: Request): Promise<unknown> {
    let commitJson = {};
    try {
      const aadJwtValidator = new AadJwtValidator(
        this.configService.get("AAD_TENANT_ID", ""),
        this.configService.get("AAD_CLIENT_ID", "")
      );
      const jwtIsValid = await aadJwtValidator.validateAadJwt(request);
      commitJson = { commits: this.configService.get("commits") };
    } catch (err) {
      commitJson = { commits: "Unauthorized to view commit info" };
    }
    return {
      version: this.configService.get("version"),
      runtime_version_env:
        this.configService.get("LINEPULSE_SVC_VERSION") || "{}",
      ...commitJson,
    };
  }

  @Get("config")
  @Version(VERSION_NEUTRAL)
  @ApiBearerAuth("JWT-auth")
  @UseGuards(JwtGuard)
  config(): unknown {
    return this.appService.configuration();
  }
}
