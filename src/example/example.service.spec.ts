import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ExampleController } from "./example.controller";
import { ExampleService } from "./example.service";

describe("ExampleService", () => {
  let service: ExampleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [Logger],
      controllers: [ExampleController],
      providers: [ConfigService, Logger, ExampleService],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
