import { Logger } from "@nestjs/common";
import {
  FlagValue,
  JsonValue,
  EvaluationContext,
  Provider,
  ResolutionDetails,
} from "@openfeature/js-sdk";
import { init, LDClient, LDLogger, LDUser } from "launchdarkly-node-server-sdk";

class LoggerForLD extends Logger implements LDLogger {
  protected context?: string | undefined;
  protected options: { timestamp?: boolean | undefined };

  info(...args: unknown[]): void {
    const [msg, ...context] = args;
    this.log(msg, context);
  }
}

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
  constructor(
    message?: string,
    private readonly logger: Logger = new Logger(ParseError.name)
  ) {
    logger.log("in ParseError: [" + message + "]");
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

/**
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 */
export class OpenFeatureLaunchDarklyProvider implements Provider {
  metadata = {
    name: "LaunchDarkly",
  };

  private client: LDClient;
  private initialized: Promise<void>;

  constructor(
    sdkKey: string,
    private readonly logger: LoggerForLD = new LoggerForLD(
      OpenFeatureLaunchDarklyProvider.name
    )
  ) {
    this.logger.info(
      "initializing OpenFeatureLaunchDarklyProvider with [" + sdkKey + "]"
    );
    this.client = init(sdkKey, { logger: this.logger });

    // we don't expose any init events at the moment (we might later) so for now, lets create a private
    // promise to await into before we evaluate any flags.
    let LDinited = false;
    this.initialized = Promise.race([
      new Promise<void>((resolve) => {
        this.client.once("ready", () => {
          this.logger.info(`[${this.metadata.name}] provider initialized`);
          LDinited = true;
          resolve();
        });
      }),
      new Promise<void>((resolve, reject) => {
        const milliseconds = 5000;
        const initTimeout = setTimeout(() => {
          clearTimeout(initTimeout);
          if (LDinited == false) {
            reject(
              `[${this.metadata.name}] failed to respond to initialization after ${milliseconds} ms.`
            );
          }
        }, milliseconds);
      }).catch((e) => {
        this.logger.error(e);
      }),
    ]);
  }

  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext
  ): Promise<ResolutionDetails<boolean>> {
    this.logger.info(
      `OF.. Evaluating Boolean flag [${flagKey}] from LaunchDarkly...`
    );
    const details = await this.evaluateFlag<boolean>(
      flagKey,
      defaultValue,
      this.transformContext(context)
    );
    if (typeof details.value === "boolean") {
      this.logger.info(
        `OF.. Received value <${details.value}> for flag [${flagKey}] from LaunchDarkly`
      );
      return details;
    } else {
      this.logger.error(
        `OF.. Can't intepret received value <${details.value}> for flag [${flagKey}] from LaunchDarkly as Boolean`
      );
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, details.value, "boolean")
      );
    }
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext
  ): Promise<ResolutionDetails<string>> {
    this.logger.info(
      `OF.. Evaluating String flag [${flagKey}] from LaunchDarkly...`
    );
    const details = await this.evaluateFlag<string>(
      flagKey,
      defaultValue,
      this.transformContext(context)
    );
    if (typeof details.value === "string") {
      this.logger.info(
        `OF.. Received value <${details.value}> for flag [${flagKey}] from LaunchDarkly`
      );
      return details;
    } else {
      this.logger.error(
        `OF.. Can't intepret received value <${details.value}> for flag [${flagKey}] from LaunchDarkly as String`
      );
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, details.value, "string")
      );
    }
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext
  ): Promise<ResolutionDetails<number>> {
    this.logger.info(
      `OF.. Evaluating Number flag [${flagKey}] from LaunchDarkly...`
    );
    const details = await this.evaluateFlag<number>(
      flagKey,
      defaultValue,
      this.transformContext(context)
    );
    if (typeof details.value === "number") {
      this.logger.info(
        `OF.. Received value <${details.value}> for flag [${flagKey}] from LaunchDarkly`
      );
      return details;
    } else {
      this.logger.error(
        `OF.. Can't intepret received value <${details.value}> for flag [${flagKey}] from LaunchDarkly as Number`
      );
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, details.value, "number")
      );
    }
  }

  async resolveObjectEvaluation<U extends JsonValue>(
    flagKey: string,
    defaultValue: U,
    context: EvaluationContext
  ): Promise<ResolutionDetails<U>> {
    this.logger.info(
      `OF.. Evaluating Object flag [${flagKey}] from LaunchDarkly...`
    );
    const details = await this.evaluateFlag<unknown>(
      flagKey,
      JSON.stringify(defaultValue),
      this.transformContext(context)
    );
    if (typeof details.value === "string") {
      // we may want to allow the parsing to be customized.
      try {
        this.logger.info(
          `OF.. Received value <${details.value}> for flag [${flagKey}] from LaunchDarkly`
        );
        return { ...details, value: JSON.parse(details.value) as U };
      } catch (err) {
        this.logger.error(
          `OF.. Can't intepret received value <${details.value}> for flag [${flagKey}] from LaunchDarkly as JSON`
        );
        throw new ParseError(`Error parsing flag value for ${flagKey}`);
      }
    } else {
      this.logger.error(
        `OF.. Can't intepret received value <${details.value}> for flag [${flagKey}] from LaunchDarkly as JSON`
      );
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, details, "object")
      );
    }
  }

  // Transform the context into an object compatible with the Launch Darkly API, an object with a user "key", and other attributes.
  private transformContext(context: EvaluationContext): LDUser {
    const { targetingKey, ...attributes } = context;
    return {
      key: targetingKey || "anonymous",
      anonymous: targetingKey ? false : true,
      custom: attributes,
    } as LDUser;
  }

  private getFlagTypeErrorMessage(
    flagKey: string,
    value: unknown,
    expectedType: string
  ): string {
    return `Flag value ${flagKey} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }

  // LD values can be boolean, number, or string: https://docs.launchdarkly.com/sdk/client-side/node-js#getting-started
  private async evaluateFlag<T>(
    flagKey: string,
    defaultValue: FlagValue,
    user: LDUser
  ): Promise<ResolutionDetails<T>> {
    // await the initialization before actually calling for a flag.
    await this.initialized;

    const details = await this.client.variationDetail(
      flagKey,
      user,
      defaultValue
    );
    return {
      value: details.value,
      variant: details.variationIndex?.toString(),
      reason: details.reason.kind,
    };
  }
}
