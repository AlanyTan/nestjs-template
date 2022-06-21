import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { TerminusModule } from "@nestjs/terminus";
// import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggerModule } from "nestjs-pino";
import {
  ConfigModule,
  // ConfigService,
  // dbConfig,
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
    //   useFactory: async (configService: ConfigService) =>
    //     dbConfig(configService),
    // }),
    HttpModule,
    TerminusModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
