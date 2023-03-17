/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
  // TypeOrmHealthIndicator,
} from "@nestjs/terminus";

@Injectable()
export class AppService {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly configService: ConfigService,
    // private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private readonly httpHealthIndicator: HttpHealthIndicator
  ) {}

  health(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      //Here we validate the services that we depend on are up and running
      // You should have defined required service's URL in ENV variables
      // add as many checks as you need to ensure all services
      (): Promise<HealthIndicatorResult> =>
        this.httpHealthIndicator.pingCheck(
          `1st API ${this.configService.get<string>(
            "SVC_1_ENDPOINT"
          )}that I need:`,
          this.configService.get<string>("SVC_1_ENDPOINT") || ""
        ),
      (): Promise<HealthIndicatorResult> =>
        this.httpHealthIndicator.pingCheck(
          "2nd API that I need:",
          this.configService.get<string>("SVC_2_ENDPOINT") || ""
        ),
      // // if you use TypeORM, you can use this to check the database connection
      // (): Promise<HealthIndicatorResult> =>
      //   this.typeOrmHealthIndicator.pingCheck("database"),
    ]);
  }
}
