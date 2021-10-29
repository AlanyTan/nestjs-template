import { Module } from "@nestjs/common";
//import { ConfigModule, ConfigService } from "@nestjs/config";
//import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    //    ConfigModule.forRoot({
    //      envFilePath: [".env.local", ".env"],
    //    }),
    /*    TypeOrmModule.forRootAsync({
//      imports: [ConfigModule],
//      inject: [ConfigService],
//      useFactory: async (configService: ConfigService) => ({
//        type: "postgres",
//        host: configService.get<string>("DATABASE_HOST"),
//        port: configService.get<number>("DATABASE_PORT"),
//        username: configService.get<string>("DATABASE_USER"),
//        password: configService.get<string>("DATABASE_PASSWORD"),
//        database: configService.get<string>("DATABASE_NAME"),
//        entities: [],
//        synchronize: true,
      }),
    }),*/
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
