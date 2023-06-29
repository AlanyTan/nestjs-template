import { ExecutionContext, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EnvGuard } from "./env-guard";

jest.mock("@nestjs/config", () => {
  return {
    ConfigService: jest.fn().mockImplementation(() => {
      return {
        get: jest.fn().mockImplementation((input: string) => {
          if (input == "ENV_KEY") {
            return "lcl";
          }
        }),
      };
    }),
  };
});

describe("EnvGuard", () => {
  it("should be defined", () => {
    expect(EnvGuard).toBeDefined();
  });
  it("should return CanActivate()", () => {
    expect(EnvGuard()).toBeInstanceOf(Function);
  });
  it("should return true in local IDE", async () => {
    const evaluatedGuardClass = EnvGuard();
    const evaluatedGuard = new evaluatedGuardClass(new ConfigService());
    expect(await evaluatedGuard.canActivate({} as ExecutionContext)).toEqual(
      true
    );
  });
  it("should return false when forced to check if running in 'mars'", async () => {
    const evaluatedGuardClass = EnvGuard(["mars"]);
    const evaluatedGuard = new evaluatedGuardClass(new ConfigService());
    class MockHttpContext {
      switchToHttp(): object {
        return {
          getRequest(): object {
            return { method: "access", url: "mockURL" };
          },
        };
      }
    }
    expect(
      evaluatedGuard.canActivate(new MockHttpContext() as ExecutionContext)
    ).rejects.toThrow(NotFoundException);
  });
});
