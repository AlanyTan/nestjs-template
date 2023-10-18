import Joi from "joi";
export const environmentVariableList = Joi.object({
  //add *ALL* configuration that your application need here, even if they are "optional" (other than DB config, which you should do in the db.ts)
  //if ".required()" then application will abort starting if that configuration was not provided.
  //if ".default(value)" then the value is used if the expected EnVar does not exist
  //if neither ".required()" nor ".default(value)" then the EnVar is optional, and will be processed by the ConfigService.get() method
  //if you do not list a configuration here, then it will not be available as part of the ConfigService to the application at all
  AAD_CLIENT_ID: Joi.string()
    .default("")
    .description("The client id registered with Azure AD tenant that represent this service"),
  AAD_TENANT_ID: Joi.string()
    .default("")
    .description("The tenant id of the Azure AD that is the owner/operator of this service"),
  ENV_KEY: Joi.string().required().tag("public").description("In which environment the service is running in."),
  DATABASE_TYPE: Joi.string().default("none").tag("public").description("The type of database to use, default is none"),
  LINEPULSE_SVC_PORT: Joi.number()
    .required()
    .tag("public")
    .description("The HTTP port this service should listen on (i.e. 9080)"),
  LOG_LEVEL: Joi.string().default("info").tag("public").description("The log level at startup, default is info"),
  LOGGING_REDACT_PATTERNS: Joi.string()
    .default("[]")
    .tag("public")
    .description(
      "Additional patterns to redact from logs, default is [] which the developer is responsible for redact log messages",
    ),
  OPENFEATURE_PROVIDER: Joi.string().required().description("SDK Key of OpenFeature Provider (i.e. LD:sdkkey1234567"),
  SERVICE_PREFIX: Joi.string().tag("public").description("The prefix of the service, default is ''"),
  REDIS_URL: Joi.string()
    .default("")
    .tag("public")
    .description("The REDIS URL used to connec to REDIS instance, i.e. redis://redis-stack:6379/1 "),
  SVC_1_ENDPOINT: Joi.string()
    .uri()
    .required()
    .tag("public")
    .description("The endpoint of the first service that this service will call (i.e. https://svc1:9080)"),
});
