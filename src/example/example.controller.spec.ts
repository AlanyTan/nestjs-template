import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ExampleController } from "./example.controller";
import { ExampleService } from "./example.service";

describe("ExampleController", () => {
  let controller: ExampleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [Logger],
      controllers: [ExampleController],
      providers: [ExampleService, ConfigService, Logger],
    }).compile();

    controller = module.get<ExampleController>(ExampleController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
