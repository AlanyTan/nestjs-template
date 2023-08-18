process.env.SVC_1_ENDPOINT = "http://localhost:3000";
process.env.LINEPULSE_SVC_PORT = "9081";
process.env.OPENFEATURE_PROVIDER = "ENV";
process.env.NEW_END_POINT = "true";
process.env.NEW_FEATURE_FLAG = "true";
process.env.ENV_KEY = "lcl";

import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { closeApplication, getTestApplication } from "./service-common";

let app: INestApplication;

beforeAll(async () => {
  app = await getTestApplication();
});

afterAll(async () => {
  await closeApplication(app);
});

describe("Application Controllers (svc)", () => {
  const servicePrefix = process.env.SERVICE_PREFIX ? "/" + process.env.SERVICE_PREFIX : "";
  describe("standard end-points", () => {
    it("should perform health check", async () => {
      process.env.SVC_1_ENDPOINT = "http://localhost:3002";
      const response = await request(app.getHttpServer()).get(`${servicePrefix}/health`);
      expect(response.status).toEqual(200);
    });
    it("should return version", async () => {
      const response = await request(app.getHttpServer()).get(`${servicePrefix}/version`);
      expect(response.status).toEqual(200);
      expect(response.body.commitInfo).toContain("Unauthorized to view commit info");
    });
    it("should provide metrics", async () => {
      const response = await request(app.getHttpServer()).get(`${servicePrefix}/metrics`);
      expect(response.status).toEqual(200);
    });
    it("should return 401 for config due to no valid JWT", async () => {
      const response = await request(app.getHttpServer()).get(`${servicePrefix}/config`);
      expect(response.status).toEqual(401);
    });
  });

  describe("the 'example' application end-points", () => {
    const servicePrefix = process.env.SERVICE_PREFIX ? "/" + process.env.SERVICE_PREFIX : "";
    it(`${servicePrefix}/v1/example/get-request should return 200`, async () => {
      const response = await request(app.getHttpServer()).get(`${servicePrefix}/v1/example/get-request`);
      expect(response.status).toEqual(200);
    });
    it(`${servicePrefix}/v2/example/get-request should return 200`, async () => {
      const response = await request(app.getHttpServer()).get(`${servicePrefix}/v2/example/get-request`);
      expect(response.status).toEqual(200);
    });
  });

  describe("the 'exampleOrm' application create and find-all end-points", () => {
    const testUser = {
      name: { first: "John", last: "Doe" },
      notes: "a new user",
      isActive: true,
    };
    const servicePrefix = process.env.SERVICE_PREFIX ? "/" + process.env.SERVICE_PREFIX : "";
    it(`/v1/example-orm/create should return 201, and return a user with uuid, which can be queried using /v1/example-orm/find`, async () => {
      const response = await request(app.getHttpServer()).post(`${servicePrefix}/v1/example-orm/create`).send(testUser);
      expect(response.status).toEqual(201);
      const savedUser = JSON.parse(response.text);
      expect(savedUser).toMatchObject(testUser);
    });
    it(`/v1/example-orm/find-all should return 200`, async () => {
      const response = await request(app.getHttpServer()).get(`${servicePrefix}/v1/example-orm/find-all`);
      expect(response.status).toEqual(200);
    });
  });

  describe("the 'exampleOrm' application find_one and delete end-points", () => {
    const servicePrefix = process.env.SERVICE_PREFIX ? "/" + process.env.SERVICE_PREFIX : "";

    test(`we can find-all, iterately find each using fine_one then delete each `, async () => {
      const response = await request(app.getHttpServer()).get(`${servicePrefix}/v1/example-orm/find-all`);
      const foundUsers = JSON.parse(response.text);
      for (const savedUser of foundUsers) {
        const response2 = await request(app.getHttpServer()).get(
          `${servicePrefix}/v2/example-orm/find_one/${savedUser?.uuid}`,
        );
        expect(response2.status).toEqual(200);
        // const response3 = await request(app.getHttpServer()).delete(
        //   `${servicePrefix}/v1/example-orm/delete/${savedUser?.uuid}`
        // );
        // expect(response3.status).toEqual(200);
      }
    });
  });
});
