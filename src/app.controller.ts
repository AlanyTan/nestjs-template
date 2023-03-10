/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Version, VERSION_NEUTRAL } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckResult } from "@nestjs/terminus";
import { AppService } from "app.service";

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
    return this.appService.health();
  }

  @Get("version")
  @Version(VERSION_NEUTRAL)
  version(): string {
    return JSON.stringify(
      this.configService.get<string>("LINEPULSE_SVC_VERSION")
    );
  }
}
