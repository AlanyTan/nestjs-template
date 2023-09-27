import { INestApplication } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from "app.module";
import { OPENFEATURE_CLIENT } from "config";
import { mainConfig } from "main.config";

export async function getTestApplication(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  mainConfig(app);
  app.useLogger(false);
  await app.init();
  return app;
}

export async function closeTestApplication(app: INestApplication): Promise<void> {
  await (await app.resolve(OPENFEATURE_CLIENT)).close();
  await app.close();
}
