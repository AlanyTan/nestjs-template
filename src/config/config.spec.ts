// test the config module only without app module? ... use below
import { INestApplication } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import Joi from "joi";
import { config, dbConfig } from "config";

describe("ConfigSerivce should error out if required Environments are missing", () => {
  test("Required Configuration values should resolve to values", async () => {
    jest.resetAllMocks();
    jest.requireActual("@nestjs/config");
    try {
      await expect(() =>
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          load: [config, dbConfig],
          expandVariables: true,
          validationSchema: Joi.object({
            //add *ALL* configuration that your application need here, even if they are "optional" (other than DB config, which you should do in the db.ts)
            //if ".required()" then application will abort starting if that configuration was not provided.
            //if ".default(value)" then the value is used if the expected EnVar does not exist
            //if neither ".required()" nor ".default(value)" then the EnVar is optional, and will be processed by the ConfigService.get() method
            //if you do not list a configuration here, then it will not be available as part of the ConfigService to the application at all
            ENV_KEY: Joi.string().required(),
            OPENFEATURE_PROVIDER: Joi.string().required(),
            LINEPULSE_SVC_PORT: Joi.number().required(),
            LINEPULSE_SVC_HOSTNAME: Joi.string().default("0.0.0.0"),
            SVC_1_ENDPOINT: Joi.string().uri().required(),
            SVC_2_ENDPOINT: Joi.string().uri().required(),
            PINO_PRETTY: Joi.boolean().default(true),
            SWAGGER_ON: Joi.boolean().default(false),
            DATABSE_TYPE: Joi.string().default("none"),
            LOG_LEVEL: Joi.string().default("info"),
            LOGGING_REDACT_PATTERNS: Joi.string(),
            SERVICE_PREFIX: Joi.string(),
          }),
        })
      ).rejects.toThrowError(
        'Config validation error: "ENV_KEY" is required. "OPENFEATURE_PROVIDER" is required. "LINEPULSE_SVC_PORT" is required. "SVC_1_ENDPOINT" is required. "SVC_2_ENDPOINT" is required'
      );
    } catch (err) {
      expect(err).toMatchObject(
        new Error(
          'Config validation error: "ENV_KEY" is required. "OPENFEATURE_PROVIDER" is required. "LINEPULSE_SVC_PORT" is required. "SVC_1_ENDPOINT" is required. "SVC_2_ENDPOINT" is required'
        )
      );
    }
  });
});

describe("Config Service check configurations", () => {
  let app: INestApplication;
  let configService: ConfigService;

  // I want to test the ConfigModule is able to extract config as expected, that's why I use the TestModule
  // this test is actually the "e2d" test of the config directory. Keep in mind, the ConfigModule is the standard NestJS module
  // and this directory contains the recommended way to use the ConfigModule
  // this spec.ts file is testing the result of config as close as to when it's used in the app.module.ts
  beforeAll(async () => {
    process.env.LINEPULSE_SVC_HOSTNAME = "0.0.0.0";
    process.env.LINEPULSE_SVC_PORT = "9080";
    process.env.LOG_LEVEL = "info";
    process.env.SVC_1_ENDPOINT = "https://this.needs.to.be.a.valid.url/health";
    process.env.SVC_2_ENDPOINT = "https://this.needs.to.be.a.valid.url/docs";
    process.env.PINO_PRETTY = "true";
    process.env.SWAGGER_ON = "true";
    process.env.ENV_KEY = "lcl";
    process.env.OPENFEATURE_PROVIDER = "ENV";
    process.env.NEW_FEATURE_FLAG = "true";
    process.env.NEW_END_POINT = "true";
    process.env.LINEPULSE_SVC_VERSION = '{"build":"1.0.0-1"}';
    process.env.SERVICE_PREFIX = "nestjs-example";
    process.env.AAD_TENANT_ID = "==secret==";
    process.env.AAD_CLIENT_ID = "==secret==";
    process.env.DATABASE_TYPE = "postgres";
    process.env.POSTGRES_HOST = "localhost";
    process.env.POSTGRES_PORT = "5432";
    process.env.POSTGRES_USERNAME = "postgres";
    process.env.POSTGRES_PASSWORD = "postgres";
    process.env.POSTGRES_DATABASE = "postgres";
    process.env.AOS_ACCOUNT_NAME = "==secret==";
    process.env.AOS_ACCOUNT_KEY = "==secret==";
    process.env.AOS_CONTAINER_NAME = "==secret==";
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [config, dbConfig],
          ignoreEnvFile: true,
          expandVariables: true,
          validationSchema: Joi.object({
            //add *ALL* configuration that your application need here, even if they are "optional" (other than DB config, which you should do in the db.ts)
            //if ".required()" then application will abort starting if that configuration was not provided.
            //if ".default(value)" then the value is used if the expected EnVar does not exist
            //if neither ".required()" nor ".default(value)" then the EnVar is optional, and will be processed by the ConfigService.get() method
            //if you do not list a configuration here, then it will not be available as part of the ConfigService to the application at all
            ENV_KEY: Joi.string().required(),
            OPENFEATURE_PROVIDER: Joi.string().required(),
            LINEPULSE_SVC_PORT: Joi.number().required(),
            LINEPULSE_SVC_HOSTNAME: Joi.string().default("0.0.0.0"),
            SVC_1_ENDPOINT: Joi.string().uri().required(),
            SVC_2_ENDPOINT: Joi.string().uri().required(),
            PINO_PRETTY: Joi.boolean().default(true),
            SWAGGER_ON: Joi.boolean().default(false),
            DATABSE_TYPE: Joi.string().default("none"),
            LOG_LEVEL: Joi.string().default("info"),
            LOGGING_REDACT_PATTERNS: Joi.string(),
            SERVICE_PREFIX: Joi.string(),
          }).options({ stripUnknown: true }),
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    configService = await moduleFixture.resolve(ConfigService);
  });

  test("Required Configuration values should resolve to values", () => {
    expect(configService.get<string>("LINEPULSE_SVC_HOSTNAME")).toBe(
      process.env.LINEPULSE_SVC_HOSTNAME
    );
    expect(configService.get<number>("LINEPULSE_SVC_PORT")).toBe(
      parseInt(process.env.LINEPULSE_SVC_PORT ?? "0")
    );
    expect(configService.get<string>("ENV_KEY")).toBe(process.env.ENV_KEY);
    expect(configService.get<string>("OPENFEATURE_PROVIDER")).toBe(
      process.env.OPENFEATURE_PROVIDER
    );
    expect(configService.get<string>("SVC_1_ENDPOINT")).toBe(
      process.env.SVC_1_ENDPOINT
    );
    expect(configService.get<string>("SVC_2_ENDPOINT")).toBe(
      process.env.SVC_2_ENDPOINT
    );
  });

  test("Optional Configuration values should resolve to default values", () => {
    expect(configService.get<boolean>("SWAGGER_ON")).toBe(
      "true" === (process.env.SWAGGER_ON ?? "false")
    );
    expect(configService.get<boolean>("PINO_PRETTY")).toBe(
      "true" === (process.env.PINO_PRETTY ?? "false")
    );
    expect(configService.get<string>("LOG_LEVEL")).toBe(
      process.env.LOG_LEVEL ?? "info"
    );
    // the reason the DATABASE_TYPE is tested here is because you are allowed to set the DATABASE_TYPE to "none" and it will not load the database config
    expect(configService.get<string>("database.type")).toBe(
      process.env.DATABASE_TYPE ?? "none"
    );
  });

  test("Database configurations should resolve to a database config object", () => {
    expect(configService.get<string>("database.host")).toBe(
      process.env.POSTGRES_HOST
    );
    expect(configService.get<number>("database.port")).toBe(
      parseInt(process.env.POSTGRES_PORT ?? "5432")
    );
    expect(configService.get<string>("database.username")).toBe(
      process.env.POSTGRES_USERNAME
    );
    expect(configService.get<string>("database.password")).toBe(
      process.env.POSTGRES_PASSWORD
    );
    expect(configService.get<string>("database.database")).toBe(
      process.env.POSTGRES_DATABASE
    );
    expect(configService.get<boolean>("database.synchronize")).toBe(
      process.env.POSTGRES_SYNCHRONIZE ?? false
    );
    expect(configService.get<string>("database.migrationsRun")).toBe(
      process.env.POSTGRES_MIGRATIONS_RUN ?? true
    );
    expect(configService.get<string>("database.dropSchema")).toBe(
      process.env.POSTGRES_DROP_SCHEMA ?? false
    );
  });

  test("Only Environment Variables that are listed in the ValidationSchema will be considered, not-listed will be excluded in the config object", () => {
    expect(configService.get("_PROCESS_ENV_VALIDATED.PATH")).toBe(undefined);
    expect(
      configService.get("_PROCESS_ENV_VALIDATED.LINEPULSE_SVC_HOSTNAME")
    ).toBe(process.env.LINEPULSE_SVC_HOSTNAME);
  });

  it("Function ConfigService.get() can be mocked to throw an error", () => {
    jest.spyOn(configService, "get").mockImplementation(() => {
      throw new Error(`Please supply the MISSED_ENVAR environment variable`);
    });
    expect(() => configService.get("test")).toThrowError();
  });

  afterAll(async () => {
    await app.close();
  });
});
