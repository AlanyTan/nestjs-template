/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createClient } from "redis";
import { REDIS_CLIENT } from "../config";

export type RedisClient = ReturnType<typeof createClient>;

@Injectable()
export class RedisService implements OnModuleDestroy {
  public constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    private readonly configService: ConfigService,
    private readonly logger: Logger = new Logger(RedisService.name)
  ) {}

  async ping(): Promise<string> {
    return this.redis.ping();
  }
  onModuleDestroy(): void {
    this.redis.quit();
  }
}
