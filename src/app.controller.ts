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
import { validateAadJwt } from "@AcertaAnalyticsSolutions/acerta-standardnpm";
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
    backendServicesToCheck.push(
      this.configService.get<string>("SVC_1_ENDPOINT") ?? ""
    );
    backendServicesToCheck.push(
      this.configService.get<string>("SVC_2_ENDPOINT") ?? ""
    );
    return this.appService.health(backendServicesToCheck);
  }

  @Get("version")
  @Version(VERSION_NEUTRAL)
  @ApiBearerAuth("JWT-auth")
  async version(@Req() request: Request): Promise<unknown> {
    let commitJson = {};
    try {
      const jwtIsValid = await validateAadJwt(request);
      commitJson = { commits: this.configService.get("commits") };
    } catch (err) {
      commitJson = { commits: "Unauthorized to view commit info" };
    }
    return {
      version: this.configService.get("version"),
      runtime_version_env: JSON.parse(
        this.configService.get<string>("LINEPULSE_SVC_VERSION") || "{}"
      ),
      ...commitJson,
    };
  }

  @Get("config")
  @Version(VERSION_NEUTRAL)
  @ApiBearerAuth("JWT-auth")
  @UseGuards(JwtGuard)
  config(): unknown {
    return {
      config: this.configService.get("_PROCESS_ENV_VALIDATED"),
      database: this.configService.get("database"),
    };
  }
}
