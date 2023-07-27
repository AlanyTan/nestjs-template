import type { Config } from "jest";

const config: Config = {
  rootDir: ".",
  verbose: true,
  moduleDirectories: ["./node_modules", "./src"],
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!axios)/"],
  moduleFileExtensions: ["js", "json", "ts"],
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t)s$": "ts-jest",
  },
  collectCoverage: true,
  coverageReporters: ["cobertura", "lcov"],
  collectCoverageFrom: ["<rootDir>/src/**/*.(t|j)s"],
  coveragePathIgnorePatterns: ["<rootDir>/src/migrations", ".*spec.ts$", "main.ts"],
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/package.json"],
};

export default config;
