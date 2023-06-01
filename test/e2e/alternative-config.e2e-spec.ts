jest.resetModules();
process.env.SVC_1_ENDPOINT = "http://wronghost:3002";
process.env.LINEPULSE_SVC_VERSION = '{"build":"1.0.0-2"}';
process.env.LINEPULSE_SVC_HOSTNAME = "0.0.0.0";
process.env.LINEPULSE_SVC_PORT = "9081";
process.env.OPENFEATURE_PROVIDER = "ENV";
process.env.NEW_END_POINT = "false";
process.env.NEW_FEATURE_FLAG = "false";

import { ConfigService } from "@nestjs/config";
import request from "supertest";
import { app } from "../setup-e2e";

describe("AppController (e2e) testing wrong settings.", () => {
  const servicePrefix = process.env.SERVICE_PREFIX
    ? "/" + process.env.SERVICE_PREFIX
    : "";
  describe("standard end-points", () => {
    it("health check should return 503 if expected service can't be reached", async () => {
      const response = await request(app.getHttpServer()).get(
        `${servicePrefix}/health`
      );
      expect(response.status).toEqual(200);
    });
    it("should return runtime version EnVar value", async () => {
      const response = await request(app.getHttpServer()).get(
        `${servicePrefix}/version`
      );
      expect(response.status).toEqual(200);
      expect(response.body.runtime_version_env).toBe('{"build":"1.0.0-2"}');
    });
  });
  describe("the 'example' application with feature toggles set to off ", () => {
    const servicePrefix = process.env.SERVICE_PREFIX
      ? "/" + process.env.SERVICE_PREFIX
      : "";
    it(`${servicePrefix}/v1/example/get_request should return "new-feature-flag false"`, async () => {
      const response = await request(app.getHttpServer()).get(
        `${servicePrefix}/v1/example/get_request`
      );
      expect(response.text).toContain("New feature flag is false");
    });
    it(`${servicePrefix}/v2/example/get_request should return 404`, async () => {
      const response = await request(app.getHttpServer()).get(
        `${servicePrefix}/v2/example/get_request`
      );
      expect(response.status).toEqual(404);
    });
  });
});

describe("AppController Config Service (e2e)", () => {
  test("ConfigService:Known Configuration value of Host, Ports and LOG Level should be 0.0.0.0  80 info", async () => {
    expect(
      (await app.resolve(ConfigService)).get("LINEPULSE_SVC_HOSTNAME")
    ).toBe("0.0.0.0");
    expect((await app.resolve(ConfigService)).get("LINEPULSE_SVC_PORT")).toBe(
      9081
    );
    process.env.LOG_LEVEL = "info";
    expect((await app.resolve(ConfigService)).get("LOG_LEVEL")).toBe("info");
  });
});
