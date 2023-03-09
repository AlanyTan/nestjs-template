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
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import configuration from "./config/configuration";
import configurationDB from "./config/configuration-db";
import {
  OpenFeatureEnvProvider,
  OPENFEATURE_CLIENT,
} from "./utils/js-env-provider";
import { OpenFeatureLaunchDarklyProvider } from "./utils/js-launchdarkly-provider";
//export const OPENFEATURE_CLIENT = Symbol.for('OPENFEATURE_CLIENT');

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, ".env"],
      load: [configuration /*configurationDB*/], //configurationDB is a structured config obj, can be accessed like get('database.host')
      validationSchema: Joi.object({
        //add configuration validation here,
        //if ".required()" then application will abort starting if that configuration was not provided.
        //if ".default(value)" then the value is used if the expected EnVar does not exist
        LINEPULSE_ENV: Joi.string().required(),
        SWAGGER_ON: Joi.boolean().default(false),
        PORT: Joi.number().required(),
        HOST: Joi.string().required(),
        PINO_PRETTY: Joi.boolean().default(true),
        API_CUSTOMER_BASE_URL: Joi.string().required(),
      }),
      isGlobal: true,
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
          ], //concat( configService.get<string[]>("LOGGING_REDACT_PATTERNS"))
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
  providers: [
    AppService,
    {
      provide: OPENFEATURE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        switch (
          configService.get<string>("OPENFEATURE_PROVIDER")?.split(":")[0]
        ) {
          case "env":
          case "ENV":
            OpenFeature.setProvider(new OpenFeatureEnvProvider());
            break;
          case "LD":
          case "ld":
          case "launchdarkly":
          case "LaunchDarkly":
            const LD_KEY = configService
              .get<string>("OPENFEATURE_PROVIDER")
              ?.split(":")[1];
            if (!LD_KEY) {
              throw new Error("LaunchDarkly key not provided");
            } else {
              OpenFeature.setProvider(
                new OpenFeatureLaunchDarklyProvider(LD_KEY)
              );
            }
            break;
          default:
            throw new Error(
              "OpenFeature provider value invalid:" +
                configService.get<string>("OPENFEATURE_PROVIDER")
            );
        }
        const client = OpenFeature.getClient("app");
        return client;
      },
    },
  ],
})
export class AppModule {}
