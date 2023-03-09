/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Version, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckResult } from "@nestjs/terminus";
import { AppService } from "app.service";

@ApiTags("App")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  @Version(VERSION_NEUTRAL)
  @HealthCheck()
  health(): Promise<HealthCheckResult> {
    return this.appService.health();
  }
}
