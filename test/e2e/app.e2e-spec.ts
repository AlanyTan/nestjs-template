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
