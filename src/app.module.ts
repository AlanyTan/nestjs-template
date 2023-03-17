/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpModule } from "@nestjs/axios";
import { Module, RequestMethod, Logger } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TerminusModule } from "@nestjs/terminus";
// import { TypeOrmModule } from "@nestjs/typeorm";
import { OpenFeature } from "@openfeature/js-sdk";
import Joi from "joi";
import { LoggerModule } from "nestjs-pino";
import { pinoHttp } from "pino-http";
import { ExampleModule } from "example/example.module";
import { OpenFeatureModule } from "openfeature";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import commits_config from "./config/config";
import configurationDB from "./config/configuration-db";
import { MetricsModule } from "./metrics/metrics.module";

@Module({
  imports: [
    MetricsModule,
    OpenFeatureModule,
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, ".env"],
      load: [commits_config],
      isGlobal: true,
      //load: [configurationDB], //configurationDB is a structured config obj, can be accessed like get('database.host')
      validationSchema: Joi.object({
        //add configuration validation here,
        //if ".required()" then application will abort starting if that configuration was not provided.
        //if ".default(value)" then the value is used if the expected EnVar does not exist
        LINEPULSE_ENV: Joi.string().required(),
        OPENFEATURE_PROVIDER: Joi.string().required(),
        SWAGGER_ON: Joi.boolean().default(false),
        PORT: Joi.number().required(),
        HOST: Joi.string().required(),
        PINO_PRETTY: Joi.boolean().default(true),
        SVC_1_ENDPOINT: Joi.string().required(),
        SVC_2_ENDPOINT: Joi.string().required(),
        LOGGING_REDACT_PATTERNS: Joi.string(),
        SERVICE_PREFIX: Joi.string(),
      }),
    }),
    //we setup pino logger options here, and in main.ts.  once it's set up here and in main.ts, we can use it in any other file by using the standard nestjs Logger
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        pinoHttp: {
          enabled: true,
          uselevel: configService.get<string>("LOG_LEVEL") || "info",
          //by default, we redact the Authorization header and the cookie header, if you'd like to customize it, you can do so by editting the logg_config.yaml file.
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
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) =>
    //     configService.get('database'),
    // }),
    HttpModule,
    TerminusModule,
    ExampleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
