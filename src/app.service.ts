/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  BeforeApplicationShutdown,
  Logger,
  Inject,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";
import { openfeature } from "@AcertaAnalyticsSolutions/acerta-standardnpm";
import { OPENFEATURE_CLIENT } from "config";

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
      this.configService.get("DATABASE_TYPE") !== "none"
        ? (): Promise<HealthIndicatorResult> =>
            this.typeOrmHealthIndicator.pingCheck("database")
        : (): Promise<HealthIndicatorResult> => Promise.resolve({}),
    ]);
  }
}

@Injectable()
export class AppCloseService implements BeforeApplicationShutdown {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger = new Logger(AppCloseService.name),
    @Inject(OPENFEATURE_CLIENT) private openFeature: openfeature
  ) {}
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  beforeApplicationShutdown(_signal: string) {
    this.openFeature.close();
    this.logger.log(`Application is shutdown with signal $(_signal)....`);
  }
}

// to call these internal GUARD-ed endpoints, use:
// az rest -m get --header "Accept=application/json" -u ‘https://lp-nest-js-example/version'
