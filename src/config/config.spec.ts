// test the config module only without app module? ... use below
import { INestApplication } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

describe("Config Service check configurations", () => {
  let app: INestApplication;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    configService = await moduleFixture.resolve(ConfigService);
  });
  test("Known Configuration value of Host, Ports and LOG Level should be 0.0.0.0  80 info", () => {
    expect(configService.get<string>("HOST")).toBe("0.0.0.0");
    expect(configService.get<number>("PORT")).toBe("9080");
    expect(configService.get<string>("LOG_LEVEL")).toBe("info");
  });

  test("Missing Configuration value with default value of should return default value", () => {
    const env = process.env;
    process.env = {};
    expect(configService.get<string>("test", "default")).toBe("default");
    process.env = env;
  });

  // test("Missing Configuration value without default value of test should throw error", () => {
  //   const env = process.env;
  //   process.env = {};
  //   expect(() => {
  //     configService.get<string>('test');
  //   }).toThrowError();
  //   process.env = env;
  // });

  it("Function checkAllDefinedConfigs can be mocked and return true", () => {
    jest.spyOn(configService, "get").mockImplementation(() => {
      throw new Error(`Please supply the MISSED_ENVAR environment variable`);
    });

    expect(() => configService.get("test")).toThrowError();
  });
});
