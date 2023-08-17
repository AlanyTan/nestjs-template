import type { Config } from "jest";

const config: Config = {
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**/*.(t|j)s"],
  coveragePathIgnorePatterns: ["main.ts", "src/migrations"],
  moduleFileExtensions: ["js", "json", "ts"],
  moduleDirectories: ["./node_modules", "./src"],
  modulePathIgnorePatterns: ["<rootDir>/package.json", "dev/postgres-data"],
  openHandlesTimeout: 10000,
  testEnvironment: "node",
  testRegex: ".*\\.(svc-)?spec\\.ts$",
  transform: {
    "^.+\\.(t)s$": "ts-jest",
  },
  verbose: true,
};

export default config;
