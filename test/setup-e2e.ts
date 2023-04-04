import { INestApplication } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
// import { getConnection } from "typeorm";
import { AppModule } from "app.module";
import { OPENFEATURE_CLIENT } from "config";
import { mainConfig } from "main.config";

export let app: INestApplication;

beforeAll(async () => {
  process.env.OPENFEATURE_PROVIDER = "ENV";

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  mainConfig(app);
  app.useLogger(false);
  await app.init();
});

afterAll(async () => {
  await (await app.resolve(OPENFEATURE_CLIENT)).close();
  await app.close();
});
