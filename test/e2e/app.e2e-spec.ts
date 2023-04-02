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
      expect(response.body.commits).toContain(
        "Unauthorized to view commit info"
      );
    });
    it("should provide metrics", async () => {
      const response = await request(app.getHttpServer()).get("/metrics");
      expect(response.status).toEqual(200);
    });
    it("should return 401 for config due to no valid JWT", async () => {
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
