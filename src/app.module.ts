import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { TerminusModule } from "@nestjs/terminus";
// import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggerModule } from "nestjs-pino";
import {
  ConfigModule,
  // ConfigService
} from "config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, ".env"],
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
    //   useFactory: async ({
    //     databaseHost,
    //     databasePort,
    //     databaseUser,
    //     databasePassword,
    //     databaseName,
    //     databaseSynchronize,
    //     databaseDropSchema,
    //   }: ConfigService) => ({
    //     type: "postgres",
    //     host: databaseHost,
    //     port: databasePort,
    //     username: databaseUser,
    //     password: databasePassword,
    //     database: databaseName,
    //     synchronize: databaseSynchronize,
    //     dropSchema: databaseDropSchema,
    //     entities: [],
    //   }),
    // }),
    HttpModule,
    TerminusModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
