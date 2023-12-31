import type { Config } from "jest";

const config: Config = {
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**/*.(t|j)s"],
  coverageDirectory: "<rootDir>/test/coverage",
  coveragePathIgnorePatterns: ["main.ts", "src/migrations"],
  coverageReporters: ["cobertura", "text"],
  moduleFileExtensions: ["js", "json", "ts"],
  moduleDirectories: ["./node_modules", "./src"],
  modulePathIgnorePatterns: ["<rootDir>/package.json"],
  openHandlesTimeout: 10000,
  testEnvironment: "node",
  testRegex: ".*\\.(svc-)?spec\\.ts$",
  transform: {
    "^.+\\.(t)s$": "ts-jest",
  },
  verbose: true,
};

export default config;
