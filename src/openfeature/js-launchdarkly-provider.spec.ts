import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { OpenFeature, Client } from "@openfeature/js-sdk";
import { OPENFEATURE_CLIENT } from "openfeature";
import {
  ErrorCode,
  FlagNotFoundError,
  OpenFeatureLaunchDarklyProvider,
  ParseError,
  TypeMismatchError,
} from "./js-launchdarkly-provider";

// we will only test 2 flags using "new-feature-flag" and "new-end-point"

describe("LaunchDarkly Provider", () => {
  let testingModule: TestingModule;
  let OFClient: Client;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        ConfigService,
        Logger,
        {
          provide: OPENFEATURE_CLIENT,
          inject: [ConfigService],
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          useFactory: (configService: ConfigService) => {
            const LD_KEY = configService
              .get<string>("OPENFEATURE_PROVIDER")
              ?.split(":")[1];
            if (!LD_KEY) {
              throw new Error("LaunchDarkly key not provided");
            } else {
              OpenFeature.setProvider(
                new OpenFeatureLaunchDarklyProvider(LD_KEY)
              );
            }
            const client = OpenFeature.getClient("app");
            return client;
          },
        },
      ],
    }).compile();

    OFClient = testingModule.get<Client>(OPENFEATURE_CLIENT);
  });
  describe("OpenFeatureLaunchDarklyProvider", () => {
    it("should be defined", () => {
      expect(OFClient).toBeDefined();
    });
    it("ErrorCode should be defined", () => {
      expect(ErrorCode).toBeDefined;
    });
    it("ParseError should be defined", () => {
      expect(ParseError).toBeDefined;
    });
    it("FlagNotFoundError should be defined", () => {
      expect(FlagNotFoundError).toBeDefined;
    });
    it("TypeMismatchError should be defined", () => {
      expect(TypeMismatchError).toBeDefined;
    });

    it("should return default value if key does not exist", async () => {
      expect(
        await OFClient.getBooleanValue("nonexist-feature-flag", false)
      ).toEqual(false);
    });

    it("should resolve true if the flag is set to 'true' in LaunchDarkly", async () => {
      expect(
        await OFClient.getBooleanValue("new-feature-flag", false, {})
      ).toEqual(true);
    });

    it("should resolve default string if a string flag is not set in LaunchDarkly", async () => {
      expect(
        await OFClient.getStringValue("new-feature-flag", "a string", {})
      ).toEqual("a string");
    });

    it("should resolve default number if a numberic flag is not set in LaunchDarkly", async () => {
      expect(await OFClient.getNumberValue("new-feature-flag", 1, {})).toEqual(
        1
      );
    });

    it("should resolve default JSON obj if a OBJ flag is not set in LaunchDarkly", async () => {
      expect(await OFClient.getObjectValue("new-feature-flag", {}, {})).toEqual(
        {}
      );
    });
  });
  afterAll((done) => {
    // eslint-disable-next-line no-delete-var
    done();
  });
});
