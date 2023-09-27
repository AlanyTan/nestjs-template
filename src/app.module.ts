import { HttpModule, HttpService } from "@nestjs/axios";
import { Module, RequestMethod, Global, Logger, Scope } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TerminusModule } from "@nestjs/terminus";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { openfeature } from "@acertaanalyticssolutions/acerta-standardnpm";
import { PrometheusModule, PrometheusController, makeGaugeProvider } from "@willsoto/nestjs-prometheus";
import { LoggerModule } from "nestjs-pino";
import { OPENFEATURE_CLIENT, config, dbConfig, environmentVariableList } from "config";
import { ExampleModule } from "example/example.module";
import { ExampleOrmModule } from "example-orm/example-orm.module";
import { ExampleRedisModule } from "example-redis/example-redis.module";
import { ForwardHeadersInterceptor } from "utils/forward-headers.interceptor";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { getPinoHttpSerializer } from "./utils/pino-http-serializer";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      load: [config, dbConfig], //dbConfig is a structured config obj, can be accessed like get('database.host')
      expandVariables: true,
      cache: true,
      isGlobal: true,
      validationSchema: environmentVariableList.options({ stripUnknown: true }),
    }),
    // we setup pino logger options here, and in main.ts.  once it's set up here and in main.ts, we can use it in any other file by using the standard nestjs Logger
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        pinoHttp: {
          enabled: true,
          level: configService.getOrThrow("LOG_LEVEL"),
          // by default, we redact the Authorization header and the cookie header, if you'd like to customize it, you can do so by editting the logg_config.yaml file.
          redact: ["req.headers.Authorization", "req.headers.authorization", "req.headers.cookie"].concat(
            JSON.parse(configService.getOrThrow("LOGGING_REDACT_PATTERNS")),
          ),
          transport: configService.get("PINO_PRETTY")
            ? {
                target: "pino-pretty",
                options: {
                  colorize: configService.get("ENV_KEY") === "lcl",
                  singleLine: true,
                  levelFirst: false,
                  translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l Z",
                },
              }
            : {
                target: "pino/file",
              },
          serializers: getPinoHttpSerializer(configService),
        },
        exclude: [{ method: RequestMethod.ALL, path: "/nothing_to_exclude" }],
      }),
      inject: [ConfigService],
    }),
    PrometheusModule.register({
      controller: PrometheusController,
      path: "/metrics",
    }),
    HttpModule,
    TerminusModule,
    ExampleModule,
    ...((process.env.DATABASE_TYPE ?? "none") == "none"
      ? []
      : [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
              return configService.get("database") as TypeOrmModuleOptions;
            },
          }),
          ExampleOrmModule,
        ]),
    ...((process.env.REDIS_URL ?? "none") == "none" ? [] : [ExampleRedisModule]),
  ],
  controllers: [AppController],
  providers: [
    Logger,
    AppService,
    ForwardHeadersInterceptor,
    {
      provide: "REQUEST_SCOPED_HTTP_SERVICE",
      inject: [HttpService],
      scope: Scope.REQUEST,
      useFactory: (http: HttpService): HttpService => {
        return http;
      },
    },
    makeGaugeProvider({
      name: "serviceInfo",
      help: "Service info metric, labels are created dynamically to reflect running version",
      labelNames: ["build", "build_time", "build_number", "commit_time", "commit_hash", "commit_message", "version"],
    }),
    {
      provide: OPENFEATURE_CLIENT,
      inject: [ConfigService, Logger],
      useFactory: async (configService: ConfigService, logger: Logger): Promise<openfeature> => {
        const client = await new openfeature(configService.getOrThrow("OPENFEATURE_PROVIDER"), logger).initialized();
        return client as openfeature;
      },
    },
  ],
  exports: [OPENFEATURE_CLIENT, "REQUEST_SCOPED_HTTP_SERVICE"],
})
export class AppModule {}
