import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { Client, OpenFeature } from "@openfeature/js-sdk";
import { OPENFEATURE_CLIENT } from "openfeature";
import { ExampleController } from "./example.controller";
import { ExampleService } from "./example.service";

describe("ExampleService", () => {
  let service: ExampleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [ExampleController],
      providers: [
        ConfigService,
        Logger,
        ExampleService,
        {
          provide: OPENFEATURE_CLIENT,
          useFactory: (): Client => {
            const client = OpenFeature.getClient("app");
            return client;
          },
        },
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should respond to getExample func call", () => {
    expect(service.getExample()).toHaveReturned;
  });

  it("should respond to newFeature1 func call", () => {
    expect(service.newFeature1).toBe("the Value of New Feature 1");
  });

  it("should respond to newFeature2 func call", () => {
    expect(service.newFeature2).toBe("the Value of New Feature 2!");
  });
});
