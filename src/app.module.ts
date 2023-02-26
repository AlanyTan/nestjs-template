/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { TerminusModule } from "@nestjs/terminus";
// import { TypeOrmModule } from "@nestjs/typeorm";
import * as Joi from "joi";
import { LoggerModule } from "nestjs-pino";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import configuration from "./config/configuration";
import configurationDB from "./config/configuration-db";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, ".env"],
      load: [configuration /*configurationDB*/], //configurationDB is a structured config obj, can be access like get('database.host')
      validationSchema: Joi.object({
        //add mandatory env variables here, and the app will fail to start if any of them are missing
        NODE_ENV: Joi.string()
          .valid("development", "production", "test")
          .default("production"),
        PORT: Joi.number().default(9080),
        HOST: Joi.string().default("0.0.0.0"),
        API_CUSTOMER_BASE_URL: Joi.string().required(),
      }),

      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        enabled: process.env.NODE_ENV !== "test",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: "UTC: mm/dd/yyyy, h:MM:ss TT Z",
          },
        },
      },
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) =>
    //     dbConfig(configService),
    // }),
    HttpModule,
    TerminusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
