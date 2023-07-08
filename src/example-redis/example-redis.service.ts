/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RedisJSON } from "@redis/json/dist/commands";
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
    this.logger.debug(`Debug message when pinging Redis server`);
    return this.redis.ping();
  }
  onModuleDestroy(): void {
    this.redis.quit();
  }

  async saveObject(key: string, value: unknown): Promise<string> {
    if (value !== null) {
      try {
        return (await this.redis.json.set(
          key,
          "$",
          value as RedisJSON
        )) as string;
      } catch (error) {
        this.logger.error(`Error saving object to redis: ${error}`);
        throw error;
      }
    }
    return key;
  }

  async getObject(key: string): Promise<unknown> {
    try {
      return await this.redis.json.get(key);
    } catch (error) {
      this.logger.error(`Error getting object from redis: ${error}`);
      throw error;
    }
  }
}
