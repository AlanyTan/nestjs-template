import { ConfigService } from "@nestjs/config";
import request from "supertest";
import { app } from "../setup-e2e";

describe("AppController (e2e)", () => {
  describe("standard end-points", () => {
    it("should perform health check", async () => {
      process.env.SVC_1_ENDPOINT = "http://localhost:3002";
      const response = await request(app.getHttpServer()).get("/health");
      expect(response.status).toEqual(200);
    });
    it("should return version", async () => {
      const response = await request(app.getHttpServer()).get("/version");
      expect(response.status).toEqual(200);
    });
    it("should provide metrics", async () => {
      const response = await request(app.getHttpServer()).get("/metrics");
      expect(response.status).toEqual(200);
    });
    it("should return 401 for config ", async () => {
      const response = await request(app.getHttpServer()).get("/config");
      expect(response.status).toEqual(401);
    });
  });
  describe("the 'example' application end-points", () => {
    const servicePrefix = process.env.SERVICE_PREFIX
      ? "/" + process.env.SERVICE_PREFIX
      : "";
    it(`${servicePrefix}/v1/example/get_request should return 200`, async () => {
      const response = await request(app.getHttpServer()).get(
        `${servicePrefix}/v1/example/get_request`
      );
      expect(response.status).toEqual(200);
    });
    it(`${servicePrefix}/v2/example/get_request should return 200`, async () => {
      const response = await request(app.getHttpServer()).get(
        `${servicePrefix}/v2/example/get_request`
      );
      expect(response.status).toEqual(200);
    });
  });
});

describe("AppController Config Service (e2e)", () => {
  test("ConfigService:Known Configuration value of Host, Ports and LOG Level should be 0.0.0.0  80 info", async () => {
    process.env.HOST = "0.0.0.0";
    expect((await app.resolve(ConfigService)).get<string>("HOST")).toBe(
      "0.0.0.0"
    );
    process.env.PORT = "9080";
    expect((await app.resolve(ConfigService)).get<number>("PORT")).toBe(9080);
    process.env.LOG_LEVEL = "info";
    expect((await app.resolve(ConfigService)).get<string>("LOG_LEVEL")).toBe(
      "info"
    );
  });
});
