//import { FlagNotFoundError, parseValidBoolean, parseValidJsonObject, parseValidNumber } from '@openfeature/extra';
import { JsonValue, Provider, ResolutionDetails } from "@openfeature/js-sdk";
import { constantCase } from "change-case";

export enum ErrorCode {
  PROVIDER_NOT_READY = "PROVIDER_NOT_READY",
  FLAG_NOT_FOUND = "FLAG_NOT_FOUND",
  PARSE_ERROR = "PARSE_ERROR",
  TYPE_MISMATCH = "TYPE_MISMATCH",
  GENERAL = "GENERAL",
}

export abstract class OpenFeatureError extends Error {
  abstract code: ErrorCode;
}

export class FlagNotFoundError extends OpenFeatureError {
  code: ErrorCode;
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, FlagNotFoundError.prototype);
    this.code = ErrorCode.FLAG_NOT_FOUND;
  }
}

export class ParseError extends OpenFeatureError {
  code: ErrorCode;
  constructor(message?: string) {
    console.log("in ParseError: [" + message + "]");
    super(message);
    Object.setPrototypeOf(this, ParseError.prototype);
    this.message = message ? message : "Generic Parse Error.";
    this.code = ErrorCode.PARSE_ERROR;
  }
}

export class TypeMismatchError extends OpenFeatureError {
  code: ErrorCode;
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, TypeMismatchError.prototype);
    this.code = ErrorCode.TYPE_MISMATCH;
  }
}

export const parseValidBoolean = (stringValue: string | undefined): boolean => {
  const asUnknown = stringValue as unknown;

  switch (asUnknown) {
    case "true":
      return true;
    case "false":
      return false;
    case true:
      return true;
    case false:
      return false;
    default:
      throw new TypeMismatchError(`Invalid boolean value for ${asUnknown}`);
  }
};

export const parseValidJsonObject = <T extends JsonValue>(
  stringValue: string
): T => {
  if (stringValue === undefined) {
    throw new ParseError(`Invalid 'undefined' JSON value.`);
  }
  // we may want to allow the parsing to be customized.
  try {
    const value = JSON.parse(stringValue) as T;
    if (typeof value !== "object") {
      throw new TypeMismatchError(
        `Flag value ${stringValue} had unexpected type ${typeof value}, expected "object"`
      );
    }
    return value;
  } catch (err) {
    throw new ParseError(`Error parsing ${stringValue} as JSON, ${err}`);
  }
};

export const parseValidNumber = (stringValue: string | undefined): number => {
  console.log("in ParseValidNumber: [" + stringValue + "]");
  if (stringValue === undefined) {
    console.log(
      "in ParseValidNumber.stringValue===undefined: [" + stringValue + "]"
    );
    throw new ParseError(`Invalid 'undefined' value.`);
  }
  const result = Number.parseFloat(stringValue);
  if (Number.isNaN(result)) {
    throw new TypeMismatchError(`Invalid numeric value ${stringValue}`);
  }
  return result;
};

/**
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 */
export class OpenFeatureEnvProvider implements Provider {
  metadata = {
    name: "environment variable",
  };

  resolveBooleanEvaluation(
    flagKey: string
  ): Promise<ResolutionDetails<boolean>> {
    const details = this.evaluateEnvironmentVariable(flagKey);
    return Promise.resolve({
      ...details,
      value: parseValidBoolean(details.value),
    });
  }

  resolveStringEvaluation(flagKey: string): Promise<ResolutionDetails<string>> {
    return Promise.resolve(this.evaluateEnvironmentVariable(flagKey));
  }

  resolveNumberEvaluation(flagKey: string): Promise<ResolutionDetails<number>> {
    const details = this.evaluateEnvironmentVariable(flagKey);
    return Promise.resolve({
      ...details,
      value: parseValidNumber(details.value),
    });
  }

  resolveObjectEvaluation<U extends JsonValue>(
    flagKey: string
  ): Promise<ResolutionDetails<U>> {
    const details = this.evaluateEnvironmentVariable(flagKey);
    return Promise.resolve({
      ...details,
      value: parseValidJsonObject(details.value),
    });
  }

  evaluateEnvironmentVariable(key: string): ResolutionDetails<string> {
    // convert key to ENV_VAR style casing
    const envVarCaseKey = constantCase(key);
    const value = process.env[envVarCaseKey];
    if (!value) {
      throw new FlagNotFoundError();
    }
    return { value: value };
  }
}
