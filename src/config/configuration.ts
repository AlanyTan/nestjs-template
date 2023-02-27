// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
import { readFileSync } from "fs";
import { join } from "path";
import * as yaml from "js-yaml";

const loggerConfigYaml =
  process.env.LOGGER_CONFIG_FILE || join(__dirname, "logger_config.yaml");

export default (): Record<string, unknown> => {
  let loggerConfig: Record<string, unknown>;
  try {
    loggerConfig = yaml.load(readFileSync(loggerConfigYaml, "utf8")) as Record<
      string,
      unknown
    >;
  } catch (error) {
    console.error("Error loading logger config file: " + loggerConfigYaml);
    const redactFields = [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers.authorization",
      "res.headers.cookie",
      "res.body.password",
    ];
    loggerConfig = {
      production: { trace: { redact: redactFields } },
      development: { trace: { redact: redactFields } },
    };
  }
  return {
    port: parseInt(process.env.PORT || "9080", 10),
    host: process.env.HOST || "0.0.0.0",
    logLevel: process.env.LOG_LEVEL || "info",
    apiCustomerBaseURL: process.env.API_CUSTOMER_BASE_URL,
    logger: loggerConfig,
  };
};
// All mandatory environment variables should be loaded here, and the app should fail to start if any of them are missing.
