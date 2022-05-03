import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
// import { TypeOrmModule } from "@nestjs/typeorm";
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
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async ({
    //     databaseHost,
    //     databasePort,
    //     databaseUser,
    //     databasePassword,
    //     databaseName,
    //   }: ConfigService) => ({
    //     type: "postgres",
    //     host: databaseHost,
    //     port: databasePort,
    //     username: databaseUser,
    //     password: databasePassword,
    //     database: databaseName,
    //     entities: [],
    //     synchronize: true,
    //   }),
    // }),
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
