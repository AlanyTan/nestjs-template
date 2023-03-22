import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import {
  parseValidBoolean,
  OpenFeatureEnvProvider,
  parseValidNumber,
  parseValidJsonObject,
} from "./js-env-provider";

describe("EnvFeatureProvider", () => {
  let envProvider: OpenFeatureEnvProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [ConfigService, Logger, OpenFeatureEnvProvider],
    }).compile();

    envProvider = module.get<OpenFeatureEnvProvider>(OpenFeatureEnvProvider);
  });
  describe("OpenFeatureEnvProvider", () => {
    it("envProvider should be defined", () => {
      expect(envProvider).toBeDefined();
    });

    it("envProvider should thow an err if the boolean key does not exist", async () => {
      expect(() =>
        envProvider.resolveBooleanEvaluation("TEST_BOOLEAN_FLAG")
      ).toThrowError("");
    });

    it("envProvider should thow an err if the EnVar is set to something neither 'true' nor 'false' ", async () => {
      process.env.TEST_BOOLEAN_FLAG = "invalid value";
      expect(() =>
        envProvider.resolveBooleanEvaluation("TEST_BOOLEAN_FLAG")
      ).toThrowError("Invalid boolean value for invalid value");
    });

    it("envProvider should resolve true if the EnVar is set to 'true' for valid boolean", async () => {
      process.env.TEST_BOOLEAN_FLAG = "true";
      expect(
        (await envProvider.resolveBooleanEvaluation("TEST_BOOLEAN_FLAG")).value
      ).toEqual(true);
    });

    it("envProvider should resolve false once EvVar is changed to 'false' for valid boolean", async () => {
      process.env.TEST_BOOLEAN_FLAG = "false";
      expect(
        (await envProvider.resolveBooleanEvaluation("TEST_BOOLEAN_FLAG")).value
      ).toEqual(false);
    });

    it("envProvider should resolve string if flag value is set", async () => {
      process.env.TEST_STRING_FLAG = "string_value";
      expect(
        (await envProvider.resolveStringEvaluation("TEST_STRING_FLAG")).value
      ).toEqual("string_value");
    });

    it("envProvider should thow an err if the number key is not set", async () => {
      expect(() =>
        envProvider.resolveNumberEvaluation("TEST_NUMBER_FLAG")
      ).toThrowError("");
    });

    it("envProvider should thow an err if the number key is not valid number", async () => {
      process.env.TEST_NUMBER_FLAG = "invalid_value";
      expect(() =>
        envProvider.resolveNumberEvaluation("TEST_NUMBER_FLAG")
      ).toThrowError("Invalid numeric value invalid_value");
    });

    it("envProvider should resolve a number if flag value is convertable to a number", async () => {
      process.env.TEST_NUMBER_FLAG = "123";
      expect(
        await (
          await envProvider.resolveNumberEvaluation("TEST_NUMBER_FLAG")
        ).value
      ).toEqual(123);
    });

    it("envProvider should throw an err if flag value is not set", async () => {
      expect(() =>
        envProvider.resolveObjectEvaluation("TEST_JSON_FLAG")
      ).toThrowError();
    });

    it("envProvider should resolve json if flag value is set to a stringyfied json", async () => {
      process.env.TEST_JSON_FLAG = '{"key": "value"}';
      expect(
        (await envProvider.resolveObjectEvaluation("TEST_JSON_FLAG")).value
      ).toEqual({ key: "value" });
    });

    it("parseValidBoolean should parse valid boolean", () => {
      expect(parseValidBoolean("true")).toEqual(true);
      expect(parseValidBoolean("false")).toEqual(false);
    });
    it("parse ValidBoolean should throw error on invalid boolean", () => {
      expect(() => parseValidBoolean("")).toThrowError();
      expect(() => parseValidBoolean("invalid")).toThrowError();
    });
    it("parse ValidNumber should throw error on invalid number", () => {
      expect(() => parseValidNumber(undefined)).toThrowError(
        "Invalid 'undefined' value."
      );
      expect(() => parseValidNumber("invalid")).toThrowError(
        "Invalid numeric value invalid"
      );
    });
    it("parse ValidJSON should throw error on invalid number", () => {
      expect(() => parseValidJsonObject("invalid_json")).toThrowError(
        "Error parsing invalid_json as JSON"
      );
    });
  });
});
