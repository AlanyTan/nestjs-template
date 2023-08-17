// Unit test of Controller are often done in .controller.spec.ts files
// try to test the logic of the controler as independent as possible (i.e. query parameter processing, etc)
// try test if you controller returns error code correctly as well
// keep your module.ts file simple, as it should only be used to describe the dependency of the module and export your providers
import { HttpModule, HttpService } from "@nestjs/axios";
import { Logger } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { openfeature } from "@acertaanalyticssolutions/acerta-standardnpm";
import { config, dbConfig, OPENFEATURE_CLIENT } from "config";
import { ExampleController } from "./example.controller";
import { ExampleService } from "./example.service";

jest.mock("@acertaanalyticssolutions/acerta-standardnpm/dist/openfeature", () => {
  return {
    openfeature_client: jest.fn().mockImplementation(() => {
      return {
        getBooleanValue: jest.fn().mockResolvedValue(false),
      };
    }),
  };
});

describe("ExampleController", () => {
  let controller: ExampleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          load: [config, dbConfig],
        }),
      ],
      controllers: [ExampleController],
      providers: [
        ExampleService,
        ConfigService,
        Logger,
        {
          provide: "REQUEST_SCOPED_HTTP_SERVICE",
          useFactory: async (): Promise<HttpService> => {
            return {
              get: jest.fn(),
            } as unknown as HttpService;
          },
        },
        {
          provide: OPENFEATURE_CLIENT,
          useFactory: async (): Promise<openfeature> => {
            return {
              client: { getBooleanValue: jest.fn().mockResolvedValue(true) },
            } as unknown as openfeature;
          },
        },
      ],
    }).compile();

    controller = module.get<ExampleController>(ExampleController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("getExample should return a string with 'Hello World'", async () => {
    expect(await controller.getExample()).toContain("Hello World");
  });
  it("getNewExample should return a string with 'the Value of New Feature 2!", async () => {
    expect(await controller.getNewExample()).toContain("the Value of New Feature 2!");
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });
});
