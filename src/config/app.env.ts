import Joi from "joi";
export const environmentVariableList = Joi.object({
  //add *ALL* configuration that your application need here, even if they are "optional" (other than DB config, which you should do in the db.ts)
  //if ".required()" then application will abort starting if that configuration was not provided.
  //if ".default(value)" then the value is used if the expected EnVar does not exist
  //if neither ".required()" nor ".default(value)" then the EnVar is optional, and will be processed by the ConfigService.get() method
  //if you do not list a configuration here, then it will not be available as part of the ConfigService to the application at all
  ENV_KEY: Joi.string().required(),
  OPENFEATURE_PROVIDER: Joi.string().required(),
  LINEPULSE_SVC_PORT: Joi.number().required(),
  SVC_1_ENDPOINT: Joi.string().uri().required(),
  PINO_PRETTY: Joi.boolean().default(true),
  SWAGGER_ON: Joi.boolean().default(false),
  DATABASE_TYPE: Joi.string().default("none"),
  LOG_LEVEL: Joi.string().default("info"),
  LOGGING_REDACT_PATTERNS: Joi.string().default("[]"),
  SERVICE_PREFIX: Joi.string(),
  AAD_TENANT_ID: Joi.string().default(""),
  AAD_CLIENT_ID: Joi.string().default(""),
});
