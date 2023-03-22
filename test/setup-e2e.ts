import { INestApplication } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
// import { getConnection } from "typeorm";
import { AppModule } from "app.module";
import { OPENFEATURE_CLIENT } from "config";
import { mainConfig } from "main.config";

export let app: INestApplication;

beforeAll(async () => {
  process.env.OPENFEATURE_PROVIDER = "ENV";
  process.env.SVC_1_ENDPOINT = "http://localhost:3000";

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  mainConfig(app);
  app.useLogger(false);
  await app.init();
});

// describe ("Missing required ENV should fail to start the app", async () => {
//   const moduleFixture: TestingModule = await Test.createTestingModule({
//     imports: [AppModule],
//   }).compile();

//   const app_2_err = moduleFixture.createNestApplication();
//   mainConfig(app_2_err);
//   app_2_err.useLogger(false);
//   await app_2_err.init();
// });

afterAll(async () => {
  await (await app.resolve(OPENFEATURE_CLIENT)).close();
  await app.close();
});
