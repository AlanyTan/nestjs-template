jest.resetModules();
process.env.SVC_1_ENDPOINT = "http://wronghost:3002";
process.env.LINEPULSE_SVC_PORT = "9081";
process.env.OPENFEATURE_PROVIDER = "ENV";
process.env.NEW_END_POINT = "false";
process.env.NEW_FEATURE_FLAG = "false";
process.env.ENV_KEY = "tst";

import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import request from "supertest";
import { closeTestApplication, getTestApplication } from "./test-service-common";

let app: INestApplication;

beforeAll(async () => {
  app = await getTestApplication();
});

afterAll(async () => {
  await closeTestApplication(app);
});

describe("AppController (svc) testing wrong settings.", () => {
  const servicePrefix = process.env.SERVICE_PREFIX ? "/" + process.env.SERVICE_PREFIX : "";
  describe("standard end-points", () => {
    it("health check should return 503 if expected service can't be reached", async () => {
      const response = await request(app.getHttpServer()).get(`${servicePrefix}/health`);
      expect(response.status).toEqual(200);
    });
    it("should return runtime version EnVar value", async () => {
      const response = await request(app.getHttpServer()).get(`${servicePrefix}/version`);
      expect(response.status).toEqual(200);
    });
  });
  describe("the 'example' application with feature toggles set to off ", () => {
    const servicePrefix = process.env.SERVICE_PREFIX ? "/" + process.env.SERVICE_PREFIX : "";
    it(`${servicePrefix}/v1/example/get-request should return "new-feature-flag false"`, async () => {
      const response = await request(app.getHttpServer()).get(`${servicePrefix}/v1/example/get-request`);
      expect(response.text).toContain("New feature flag is false");
    });
    it(`${servicePrefix}/v2/example/get-request should return 404`, async () => {
      const response = await request(app.getHttpServer()).get(`${servicePrefix}/v2/example/get-request`);
      expect(response.status).toEqual(404);
    });
  });
});

describe("AppController Config Service (svc)", () => {
  test("ConfigService:Known Configuration value of Host, Ports and LOG Level should be 0.0.0.0  80 info", async () => {
    expect((await app.resolve(ConfigService)).get("LINEPULSE_SVC_PORT")).toBe(9081);
    process.env.LOG_LEVEL = "info";
    expect((await app.resolve(ConfigService)).get("LOG_LEVEL")).toBe("info");
  });
});
