import { ConfigService } from "@nestjs/config";
import request from "supertest";
import { app } from "../setup-e2e";

describe("AppController (e2e)", () => {
  describe("standard end-points", () => {
    it("should perform health check", async () => {
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
  });
  describe("the 'example' application end-points", () => {
    it(
      (process.env.SERVICE_PREFIX ? "/" + process.env.SERVICE_PREFIX : "") +
        "/v1/example/get_request",
      async () => {
        const response = await request(app.getHttpServer()).get(
          "/v1/example/get_request"
        );
        expect(response.status).toEqual(200);
      }
    );
    it(
      (process.env.SERVICE_PREFIX ? "/" + process.env.SERVICE_PREFIX : "") +
        "/v2/example/get_request",
      async () => {
        const response = await request(app.getHttpServer()).get(
          "/v2/example/get_request"
        );
        expect(response.status).toEqual(200);
      }
    );
  });
});

describe("AppController read configuration (e2e)", () => {
  test("Known Configuration value of Host, Ports and LOG Level should be 0.0.0.0  80 info", async () => {
    expect((await app.resolve(ConfigService)).get<string>("HOST")).toBe(
      "0.0.0.0"
    );
    expect((await app.resolve(ConfigService)).get<number>("PORT")).toBe(9080);
    expect((await app.resolve(ConfigService)).get<string>("LOG_LEVEL")).toBe(
      "info"
    );
  });
});
