/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";

@Injectable()
export class AppService {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly configService: ConfigService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private readonly httpHealthIndicator: HttpHealthIndicator
  ) {}

  health(servicesToCheck: string[]): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      //Here we validate the services that we depend on are up and running
      // You should have defined required service's URL in ENV variables
      // add as many checks as you need to ensure all services
      ...servicesToCheck.map((value, index) => {
        return (): Promise<HealthIndicatorResult> =>
          this.httpHealthIndicator.pingCheck(
            `the #${index + 1} API <${value}> that I depend on:`,
            value || ""
          );
      }),
      // // if you use TypeORM, you can use this to check the database connection
      (): Promise<HealthIndicatorResult> =>
        this.typeOrmHealthIndicator.pingCheck("database"),
    ]);
  }
}

// to call these internal GUARD-ed endpoints, use:
// az rest -m get --header "Accept=application/json" -u ‘https://lp-nest-js-example/version'
