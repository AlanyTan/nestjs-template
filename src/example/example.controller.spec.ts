import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { Client, OpenFeature } from "@openfeature/js-sdk";
import { OPENFEATURE_CLIENT } from "config";
import { ExampleController } from "./example.controller";
import { ExampleService } from "./example.service";

describe("ExampleController", () => {
  let controller: ExampleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [ExampleController],
      providers: [
        ExampleService,
        ConfigService,
        Logger,
        {
          provide: OPENFEATURE_CLIENT,
          useFactory: (): Client => {
            const client = OpenFeature.getClient("app");
            return client;
          },
        },
      ],
    }).compile();

    controller = module.get<ExampleController>(ExampleController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
