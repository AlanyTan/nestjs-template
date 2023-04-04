import request from "supertest";
import { User } from "../../src/example-orm/entities/user.entity";
import { app } from "../setup-e2e";

describe("Application Controllers (e2e)", () => {
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

  describe("the 'exampleOrm' application create and find_all end-points", () => {
    const testUser = {
      name: { first: "John", last: "Doe" },
      notes: "a new user",
      isActive: true,
    };
    const servicePrefix = process.env.SERVICE_PREFIX
      ? "/" + process.env.SERVICE_PREFIX
      : "";
    it(`/v1/example_orm/create should return 201, and return a user with uuid, which can be queried using /v1/example_orm/find`, async () => {
      const response = await request(app.getHttpServer())
        .post(`${servicePrefix}/v1/example_orm/create`)
        .send(testUser);
      expect(response.status).toEqual(201);
      const savedUser = JSON.parse(response.text);
      expect(savedUser).toMatchObject(testUser);
    });
    it(`/v1/example_orm/find_all should return 200`, async () => {
      const response = await request(app.getHttpServer()).get(
        `${servicePrefix}/v1/example_orm/find_all`
      );
      expect(response.status).toEqual(200);
    });
  });

  describe("the 'exampleOrm' application find_one and delete end-points", () => {
    const servicePrefix = process.env.SERVICE_PREFIX
      ? "/" + process.env.SERVICE_PREFIX
      : "";

    test(`we can find_all, iterately find each using fine_one then delete each `, async () => {
      const response = await request(app.getHttpServer()).get(
        `${servicePrefix}/v1/example_orm/find_all`
      );
      const foundUsers = JSON.parse(response.text);
      foundUsers.forEach(async (savedUser: User) => {
        const response2 = await request(app.getHttpServer()).get(
          `${servicePrefix}/v2/example_orm/find_one/${savedUser?.uuid}`
        );
        expect(response2.status).toEqual(200);
        const response3 = await request(app.getHttpServer()).get(
          `${servicePrefix}/v1/example_orm/delete/${savedUser?.uuid}`
        );
        expect(response3.status).toEqual(200);
      });
    });
  });
});
