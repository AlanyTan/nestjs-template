// test the config module only without app module? ... use below
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule, ConfigService } from ".";

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
    expect(configService.host).toBe("0.0.0.0");
    expect(configService.port).toBe(9080);
    expect(configService.logLevel).toBe("info");
  });

  test("Unknown Configuration value of test should throw error", () => {
    const env = process.env;
    process.env = {};
    expect(() => {
      configService.port;
    }).toThrowError();
    process.env = env;
  });

  test("Load all expected configuration values", () => {
    expect(configService.checkAllDefinedConfigs()).toBe(true);
  });

  it("Function checkAllDefinedConfigs can be mocked and return true", () => {
    jest
      .spyOn(configService, "checkAllDefinedConfigs")
      .mockImplementation(() => true);

    expect(configService.checkAllDefinedConfigs()).toBe(true);
  });
});
