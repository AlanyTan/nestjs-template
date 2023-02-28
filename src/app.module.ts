/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpModule } from "@nestjs/axios";
import { Module, RequestMethod } from "@nestjs/common";
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
import { OPENFEATURE_CLIENT } from "./constants";
import { OpenFeatureEnvProvider } from "./js-env-provider";

//export const OPENFEATURE_CLIENT = Symbol.for('OPENFEATURE_CLIENT');

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, ".env"],
      load: [configuration /*configurationDB*/], //configurationDB is a structured config obj, can be accessed like get('database.host')
      validationSchema: Joi.object({
        //add mandatory env variables here, and the app will fail to start if any of them are missing
        NODE_ENV: Joi.string()
          .valid("development", "production", "test")
          .default("production"),
        PORT: Joi.number().required(),
        HOST: Joi.string().required(),
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
          level: configService.get<string>("LOG_LEVEL") || "info",
          //by default, we redact the Authorization header and the cookie header, if you'd like to customize it, you can do so by editting the logg_config.yaml file.
          redact: configService.get<string[]>(
            "logger." +
              configService.get<string>("NODE_ENV") +
              "." +
              configService.get<string>("LOG_LEVEL") +
              ".redact",
            ["req.headers.Authorization", "req.headers.cookie"]
          ),
          transport:
            configService.get<string>("NODE_ENV") === "production"
              ? {
                  // in production keep json format
                  target: "pino/file",
                }
              : {
                  // if this is non production env, then use pino-pretty to format the log
                  target: "pino-pretty",
                  options: {
                    colorize: true,
                    levelFirst: false,
                    translateTime: "UTC: yyyy-mm-dd HH:MM:ss.l Z",
                  },
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
        exclude: [{ method: RequestMethod.ALL, path: "/health" }],
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
      useFactory: () => {
        OpenFeature.setProvider(new OpenFeatureEnvProvider());
        const client = OpenFeature.getClient("app");
        return client;
      },
    },
  ],
})
export class AppModule {}
