/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, BeforeApplicationShutdown, Logger, Inject, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";
import { openfeature } from "@acertaanalyticssolutions/acerta-standardnpm";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Gauge } from "prom-client";
import { environmentVariableList, OPENFEATURE_CLIENT } from "config";

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly configService: ConfigService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private readonly httpHealthIndicator: HttpHealthIndicator,
    @InjectMetric("serviceInfo") public gauge: Gauge,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // don't update this function...
    // this function is defined as an async but it calls another async function (initialize)
    // this approach allows the initialize() to be executed in parallel (non-blocking this function)
    // the app will start listening, but the /initialized end-point will return 503 until the initialization is done
    // you can update the initialized() function to carry out long running initialization tasks
    this.gauge.set({ version: this.configService.get("version") }, 1);
    const commitInfo = this.configService.get("commitInfo");
    this.gauge.set(
      {
        commit_time: commitInfo.commitTime,
        commit_hash: commitInfo.commitHash,
        commit_message: commitInfo.commitMessage,
      },
      1,
    );
    const buildInfo = this.configService.get("buildInfo");
    this.gauge.set(
      {
        build: buildInfo.build,
        build_number: buildInfo.buildNumber,
        build_time: buildInfo.buildTime,
      },
      1,
    );
    this.initialize();
  }

  async initialize(): Promise<void> {
    // this is where you can do some long running initialization tasks
    // NOTE initialize() runs every time the app is restarted,
    // so you should check if the initialization tasks are already done
    async function sleep(ms: number): Promise<void> {
      // this is just an example of a long running task
      // you can remove this function if you don't need it
      // this is used to demostrate how to use the initialize function below
      // can be executed asynchronously, and the startup probe of the k8s will be
      // able to get a response of 200, but it won't forward traffic to this service yet
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // here you await the long running initialization tasks
    await sleep(10000);
    // then set _initialized to true after the initialization tasks are done
    this._initialized = true;
  }

  private _initialized = false;
  get initialized(): boolean {
    return this._initialized;
  }

  health(servicesToCheck: string[]): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      //Here we validate the services that we depend on are up and running
      // You should have defined required service's URL in ENV variables
      // add as many checks as you need to ensure all services
      ...servicesToCheck.map((value, index) => {
        return (): Promise<HealthIndicatorResult> =>
          this.httpHealthIndicator.pingCheck(`the #${index + 1} API <${value}> that I depend on:`, value || "");
      }),
      // if you use TypeORM, you can use this to check the database connection
      this.configService.get("DATABASE_TYPE") !== "none"
        ? (): Promise<HealthIndicatorResult> => this.typeOrmHealthIndicator.pingCheck("database")
        : (): Promise<HealthIndicatorResult> => Promise.resolve({}),
    ]);
  }

  configuration(): unknown {
    const rawConfig: any = {};
    const validatedConfig = environmentVariableList.describe();

    for (const keyName in validatedConfig.keys) {
      const keyDetail = validatedConfig.keys[keyName];
      if (Array.isArray(keyDetail["tags"]) && keyDetail["tags"].includes("public")) {
        rawConfig[keyName] = this.configService.get(keyName);
      } else {
        if (typeof this.configService.get(keyName) === "string") {
          rawConfig[keyName] = this.configService.get(keyName).replace(/./g, "*");
        } else {
          rawConfig[keyName] = "**Redacted**";
        }
      }
    }
    return rawConfig;
  }
}

@Injectable()
export class AppCloseService implements BeforeApplicationShutdown {
  constructor(
    private readonly logger: Logger = new Logger(AppCloseService.name),
    @Inject(OPENFEATURE_CLIENT) private openFeature: openfeature,
  ) {}
  beforeApplicationShutdown(_signal: string): void {
    this.openFeature.close();
    this.logger.log(`Application is shutdown with signal ${_signal}....`);
  }
}

// to call these internal GUARD-ed endpoints, use:
// az rest -m get --header "Accept=application/json" -u ‘https://lp-nest-js-example/version'
