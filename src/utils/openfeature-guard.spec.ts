import { OpenFeatureGuard } from "./openfeature-guard";

describe("OpenFeatureGuard", () => {
  it("should be defined", () => {
    expect(OpenFeatureGuard).toBeDefined();
  });
  it("should return CanActivate", () => {
    expect(OpenFeatureGuard("non-existing-flag")).toBeInstanceOf(Function);
  });
});
