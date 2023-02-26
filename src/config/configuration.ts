// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export default () => ({
  port: parseInt(process.env.PORT || "9080", 10),
  host: process.env.HOST || "0.0.0.0",
  logLevel: process.env.LOG_LEVEL || "info",
  apiCustomerBaseURL: process.env.API_CUSTOMER_BASE_URL,
});
// All mandatory environment variables should be loaded here, and the app should fail to start if any of them are missing.
