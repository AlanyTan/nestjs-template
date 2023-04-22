/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { openfeature } from "@acertaanalyticssolutions/acerta-standardnpm";
import { OPENFEATURE_CLIENT } from "./config";

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

  configuration(): unknown {
    const rawConfig: any = {}; //this.configService.get("_PROCESS_ENV_VALIDATED");
    for (const key in this.configService["internalConfig"]) {
      //if (this.configService.hasOwnProperty(key)) {
      if (key == "_PROCESS_ENV_VALIDATED") {
        rawConfig["core_config"] = this.configService.get(key);
      } else {
        rawConfig[key] = this.configService.get(key) || {};
      }
      //}
    }

    function redactPasswords(obj: any): unknown {
      if (typeof obj !== "object" || obj === null) {
        return obj; // base case
      }
      const regex = /password|secret/i;
      const redactedObj: any = {};

      for (const key in obj) {
        if (regex.test(key)) {
          redactedObj[key] = "=[REDACTED]=";
        } else {
          redactedObj[key] = redactPasswords(obj[key]);
        }
      }
      return redactedObj;
    }
    return redactPasswords(rawConfig);
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
