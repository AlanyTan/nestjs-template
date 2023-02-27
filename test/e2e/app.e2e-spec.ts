import { ConfigService } from "@nestjs/config";
import request from "supertest";
import { app } from "../setup-e2e";

describe("AppController (e2e)", () => {
  describe("GET /health", () => {
    it("should perform health check", async () => {
      const response = await request(app.getHttpServer()).get("/health");
      expect(response.status).toEqual(200);
    });
  });
});

describe("AppController read configuration (e2e)", () => {
  test("Known Configuration value of Host, Ports and LOG Level should be 0.0.0.0  80 info", async () => {
    expect((await app.resolve(ConfigService)).get<string>("HOST")).toBe(
      "0.0.0.0"
    );
    expect((await app.resolve(ConfigService)).get<number>("PORT")).toBe(9080);
    expect((await app.resolve(ConfigService)).get<string>("logLevel")).toBe(
      "info"
    );
  });
});
