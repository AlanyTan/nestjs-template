import { HttpModule } from "@nestjs/axios";
import { Module, RequestMethod, Global, Logger } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TerminusModule } from "@nestjs/terminus";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import {
  openfeature,
  AcertaLogger,
} from "@acertaanalyticssolutions/acerta-standardnpm";
import {
  PrometheusModule,
  PrometheusController,
  makeGaugeProvider,
} from "@willsoto/nestjs-prometheus";
import Joi from "joi";
import { LoggerModule } from "nestjs-pino";
import { OPENFEATURE_CLIENT, config, dbConfig } from "config";
import { ExampleModule } from "example/example.module";
import { ExampleOrmModule } from "example-orm/example-orm.module";
import { ExampleRedisModule } from "example-redis/example-redis.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      load: [config, dbConfig], //dbConfig is a structured config obj, can be accessed like get('database.host')
      expandVariables: true,
      cache: true,
      isGlobal: true,
      validationSchema: Joi.object({
        //add *ALL* configuration that your application need here, even if they are "optional" (other than DB config, which you should do in the db.ts)
        //if ".required()" then application will abort starting if that configuration was not provided.
        //if ".default(value)" then the value is used if the expected EnVar does not exist
        //if neither ".required()" nor ".default(value)" then the EnVar is optional, and will be processed by the ConfigService.get() method
        //if you do not list a configuration here, then it will not be available as part of the ConfigService to the application at all
        ENV_KEY: Joi.string().required(),
        OPENFEATURE_PROVIDER: Joi.string().required(),
        LINEPULSE_SVC_PORT: Joi.number().required(),
        SVC_1_ENDPOINT: Joi.string().uri().required(),
        PINO_PRETTY: Joi.boolean().default(true),
        SWAGGER_ON: Joi.boolean().default(false),
        DATABASE_TYPE: Joi.string().default("none"),
        LOG_LEVEL: Joi.string().default("info"),
        LOGGING_REDACT_PATTERNS: Joi.string().default("[]"),
        SERVICE_PREFIX: Joi.string(),
        AAD_TENANT_ID: Joi.string().default(""),
        AAD_CLIENT_ID: Joi.string().default(""),
      }).options({ stripUnknown: true }),
    }),
    // we setup pino logger options here, and in main.ts.  once it's set up here and in main.ts, we can use it in any other file by using the standard nestjs Logger
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        pinoHttp: {
          enabled: true,
          level: configService.getOrThrow("LOG_LEVEL"),
          // by default, we redact the Authorization header and the cookie header, if you'd like to customize it, you can do so by editting the logg_config.yaml file.
          redact: [
            "req.headers.Authorization",
            "req.headers.authorization",
            "req.headers.cookie",
          ].concat(
            JSON.parse(configService.getOrThrow("LOGGING_REDACT_PATTERNS"))
          ),
          transport: configService.get("PINO_PRETTY")
            ? {
                // if this is non production env, then use pino-pretty to format the log
                target: "pino-pretty",
                options: {
                  colorize: configService.get("ENV_KEY") === "lcl",
                  singleLine: true,
                  levelFirst: false,
                  translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l Z",
                },
              }
            : {
                // in production keep json format
                target: "pino/file",
              },
          serializers:
            configService.get("LOG_LEVEL") === "trace"
              ? {
                  req: (req): object => req,
                }
              : configService.get("LOG_LEVEL") === "debug"
              ? {
                  req: (req): object => ({
                    id: req.id,
                    method_url: req.method + " " + req.url,
                    query: req.query,
                    params: req.params,
                    remoteAddress_port:
                      req.remoteAddress + ":" + req.remotePort,
                  }),
                }
              : {
                  req: (req): object => ({
                    id: req.id,
                    method_url: req.method + " " + req.url,
                  }),
                },
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
    ...((process.env.REDIS_URL ?? "none") == "none"
      ? []
      : [ExampleRedisModule]),
  ],
  controllers: [AppController],
  providers: [
    Logger,
    AppService,
    makeGaugeProvider({
      name: "serviceInfo",
      help: "Service info metric, labels are created dynamically to reflect running version",
      labelNames: [
        "build",
        "build_time",
        "build_number",
        "commit_time",
        "commit_hash",
        "commit_message",
        "version",
      ],
    }),
    {
      provide: OPENFEATURE_CLIENT,
      inject: [ConfigService, Logger],
      useFactory: async (
        configService: ConfigService
      ): Promise<openfeature> => {
        const client = await new openfeature(
          configService.getOrThrow("OPENFEATURE_PROVIDER"),
          new AcertaLogger(new Logger())
        ).initialized();
        return client as openfeature;
      },
    },
  ],
  exports: [OPENFEATURE_CLIENT],
})
export class AppModule {}
