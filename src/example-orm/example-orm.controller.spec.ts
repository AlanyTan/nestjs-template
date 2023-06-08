// Unit test of Controller are often done in .controller.spec.ts files
// try to test the logic of the controler as independent as possible (i.e. query parameter processing, etc)
// try test if you controller returns error code correctly as well
// keep your module.ts file simple, as it should only be used to describe the dependency of the module and export your providers
import { Logger } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { openfeature } from "@acertaanalyticssolutions/acerta-standardnpm";
import { Repository } from "typeorm";
import { config, dbConfig, OPENFEATURE_CLIENT } from "config";
import { User } from "./entities/user.entity";
import { ExampleOrmController } from "./example-orm.controller";
import { ExampleOrmService } from "./example-orm.service";

jest.mock(
  "@acertaanalyticssolutions/acerta-standardnpm/dist/openfeature",
  () => {
    return {
      openfeature_client: jest.fn().mockImplementation(() => {
        return {
          getBooleanValue: jest.fn().mockResolvedValue(false),
        };
      }),
    };
  }
);

describe("ExampleController", () => {
  let controller: ExampleOrmController;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          load: [config, dbConfig],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule.forRoot({ load: [dbConfig] })],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return configService.get("database") as TypeOrmModuleOptions;
          },
        }),
      ],
      controllers: [ExampleOrmController],
      providers: [
        ExampleOrmService,
        ConfigService,
        Logger,
        {
          provide: "user1Repository",
          useClass: Repository<User>,
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

    controller = moduleRef.get<ExampleOrmController>(ExampleOrmController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("getNewExample should return a string with 'the Value of New Feature 2!", async () => {
    expect(async () => await controller.findOne("wrong uuid")).rejects.toThrow(
      '"value" must be a valid GUID'
    );
  });

  afterEach(async () => {
    await moduleRef.close();
    jest.resetAllMocks();
  });
});
