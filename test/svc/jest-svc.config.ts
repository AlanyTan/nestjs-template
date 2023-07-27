import type { Config } from "jest";
import config from "../../jest.config";

const svcConfig: Config = {
  ...config,
  rootDir: "../..",
  setupFilesAfterEnv: ["<rootDir>/test/svc/setup-svc.ts"],
  testRegex: ".*svc-spec.ts$",
};

export default svcConfig;
