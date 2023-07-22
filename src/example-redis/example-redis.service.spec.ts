/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";
import { RedisService } from "./example-redis.service";

jest.mock("redis");

export type RedisClient = ReturnType<typeof createClient>;

describe("RedisService", () => {
  let redisService: RedisService;
  let mockRedisClient: jest.Mocked<RedisClient>;

  const key = "my-key";
  const data = { foo: "bar" };

  beforeEach(() => {
    mockRedisClient = {
      json: {
        set: jest.fn().mockImplementationOnce((key: string, data: unknown) => key),
        get: jest.fn().mockImplementationOnce((key: string) => data),
      },
    } as unknown as jest.Mocked<RedisClient>;
    redisService = new RedisService(mockRedisClient as RedisClient, new ConfigService(), new Logger());
  });

  it("should save the object using redis.json_set", async () => {
    const expectedReturnValue = key;

    const result = await redisService.saveObject(key, data);
    expect(mockRedisClient.json.set).toHaveBeenCalledTimes(1);
    expect(mockRedisClient.json.set).toHaveBeenCalledWith(key, "$", data);
    expect(result).toEqual(expectedReturnValue);
  });

  it("should retrieve the object using redis.json_get", async () => {
    const expectedReturnValue = data;

    const result = await redisService.getObject(key);

    expect(mockRedisClient.json.get).toHaveBeenCalledTimes(1);
    expect(mockRedisClient.json.get).toHaveBeenCalledWith(key);
    expect(result).toEqual(expectedReturnValue);
  });
});
