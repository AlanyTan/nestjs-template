import { Module, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";
import { REDIS_CLIENT } from "config";
import { ExampleRedisController } from "./example-redis.controller";
import { RedisService } from "./example-redis.service";

@Module({
  providers: [
    Logger,
    RedisService,
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      useFactory: async (configService: ConfigService) => {
        const client = createClient({
          url: configService.get("REDIS_URL", "redis://localhost:6379") + "/0",
        });
        await client.connect();
        return client;
      },
    },
  ],
  exports: [RedisService],
  controllers: [ExampleRedisController],
})
export class ExampleRedisModule {}
