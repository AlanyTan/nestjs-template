/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Version, VERSION_NEUTRAL, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckResult } from "@nestjs/terminus";
import { validateAadJwt } from "@AcertaAnalyticsSolutions/acerta-standardnpm";
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
  version(): unknown {
    return {
      version: this.configService.get("version"),
      runtime_version_env: JSON.parse(
        this.configService.get<string>("LINEPULSE_SVC_VERSION") || "{}"
      ),
      commits: this.configService.get("commits"),
    };
  }

  @Get("config")
  @Version(VERSION_NEUTRAL)
  config(@Req() request: Request): unknown {
    if (validateAadJwt(request, {})) {
      return {
        version: this.configService.get("version"),
        commits: this.configService.get("commits"),
        database: this.configService.get("database"),
        config: this.configService.get("_PROCESS_ENV_VALIDATED"),
      };
    } else {
      throw new Error("Not authorized");
    }
  }
}
