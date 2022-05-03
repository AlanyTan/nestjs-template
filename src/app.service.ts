import { Injectable } from "@nestjs/common";
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
    // private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private readonly httpHealthIndicator: HttpHealthIndicator
  ) {}

  health(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      (): Promise<HealthIndicatorResult> =>
        this.httpHealthIndicator.pingCheck(
          "nestjs-docs",
          "https://docs.nestjs.com"
        ),
      // (): Promise<HealthIndicatorResult> =>
      //   this.typeOrmHealthIndicator.pingCheck("database"),
    ]);
  }
}
