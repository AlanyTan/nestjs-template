/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpModule } from "@nestjs/axios";
import { Module, RequestMethod, Logger, Global } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TerminusModule } from "@nestjs/terminus";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { openfeature } from "@AcertaAnalyticsSolutions/acerta-standardnpm";
import {
  PrometheusModule,
  PrometheusController,
} from "@willsoto/nestjs-prometheus";
import Joi from "joi";
import { LoggerModule } from "nestjs-pino";
import { OPENFEATURE_CLIENT, config, dbConfig } from "config";
import { ExampleModule } from "example/example.module";
import { ExampleOrmModule } from "example_orm/example_orm.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import configurationDB from "./config/db";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, ".env"],
      load: [config, configurationDB], //configurationDB is a structured config obj, can be accessed like get('database.host')
      //load: [configurationDB], //configurationDB is a structured config obj, can be accessed like get('database.host')
      expandVariables: true,
      cache: true,
      isGlobal: true,
      validationSchema: Joi.object({
        //add *ALL* configuration that your application need here, even if they are "optional" (other than DB config, which you should do in the db.ts)
        //if ".required()" then application will abort starting if that configuration was not provided.
        //if ".default(value)" then the value is used if the expected EnVar does not exist
        //if neither ".required()" nor ".default(value)" then the EnVar is optional, and will be processed by the ConfigService.get() method
        //if you do not list a configuration here, then it will not be available as part of the ConfigService to the application at all
        LINEPULSE_ENV: Joi.string().required(),
        OPENFEATURE_PROVIDER: Joi.string().required(),
        PORT: Joi.number().required(),
        HOST: Joi.string().required(),
        SVC_1_ENDPOINT: Joi.string().uri().required(),
        SVC_2_ENDPOINT: Joi.string().uri().required(),
        PINO_PRETTY: Joi.boolean().default(true),
        SWAGGER_ON: Joi.boolean().default(false),
        DATABSE_TYPE: Joi.string().default("none"),
        LOG_LEVEL: Joi.string().default("info"),
        LOGGING_REDACT_PATTERNS: Joi.string(),
        SERVICE_PREFIX: Joi.string(),
        LINEPULSE_SVC_VERSION: Joi.string(),
      }).options({ stripUnknown: true }),
    }),
    // we setup pino logger options here, and in main.ts.  once it's set up here and in main.ts, we can use it in any other file by using the standard nestjs Logger
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        pinoHttp: {
          enabled: true,
          uselevel: configService.get<string>("LOG_LEVEL") || "info",
          // by default, we redact the Authorization header and the cookie header, if you'd like to customize it, you can do so by editting the logg_config.yaml file.
          redact: [
            "req.headers.Authorization",
            "req.headers.authorization",
            "req.headers.cookie",
          ].concat(
            JSON.parse(
              configService.get<string>("LOGGING_REDACT_PATTERNS") || "[]"
            )
          ),
          transport: configService.get<string>("PINO_PRETTY")
            ? {
                // if this is non production env, then use pino-pretty to format the log
                target: "pino-pretty",
                options: {
                  colorize:
                    configService.get<string>("LINEPULSE_ENV") === "lcl",
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
            configService.get<string>("LOG_LEVEL") === "trace"
              ? {
                  req: (req) => req,
                }
              : configService.get<string>("LOG_LEVEL") === "debug"
              ? {
                  req: (req) => ({
                    id: req.id,
                    method_url: req.method + " " + req.url,
                    query: req.query,
                    params: req.params,
                    remoteAddress_port:
                      req.remoteAddress + ":" + req.remotePort,
                  }),
                }
              : {
                  req: (req) => ({
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
    ...((process.env.DATABASE_TYPE ?? "none") === "none"
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: OPENFEATURE_CLIENT,
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService
      ): Promise<openfeature> => {
        const client = await new openfeature(
          configService.get("OPENFEATURE_PROVIDER") || ""
        ).initialized();
        return client as openfeature;
      },
    },
  ],
  exports: [OPENFEATURE_CLIENT],
})
export class AppModule {}
