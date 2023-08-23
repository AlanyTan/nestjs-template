import { ExecutionContext, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DevTestGuard } from "./dev-test-guard";

jest.mock("@nestjs/config", () => {
  return {
    ConfigService: jest.fn().mockImplementation(() => {
      return {
        get: jest
          .fn()
          .mockImplementationOnce((input: string) => {
            if (input == "ENV_KEY") {
              return "lcl";
            }
          })
          .mockImplementationOnce((input: string) => {
            if (input == "ENV_KEY") {
              return "prd";
            }
          }),
      };
    }),
  };
});

describe("DevTestGuard", () => {
  it("should be defined", () => {
    expect(DevTestGuard).toBeDefined();
  });
  it("should return CanActivate()", () => {
    expect(DevTestGuard).toBeInstanceOf(Function);
  });
  const configService = new ConfigService();
  it("should return true in local IDE", async () => {
    const evaluatedGuardClass = DevTestGuard;
    const evaluatedGuard = new evaluatedGuardClass(configService);
    expect(await evaluatedGuard.canActivate({} as ExecutionContext)).toEqual(true);
  });
  it("should return false when the ENV_KEY is 'prd'", async () => {
    const evaluatedGuardClass = DevTestGuard;
    const evaluatedGuard = new evaluatedGuardClass(configService);
    class MockHttpContext {
      switchToHttp(): Record<string, unknown> {
        return {
          getRequest(): Record<string, unknown> {
            return { method: "access", url: "mockURL" };
          },
        };
      }
    }
    expect(evaluatedGuard.canActivate(new MockHttpContext() as unknown as ExecutionContext)).rejects.toThrow(
      NotFoundException,
    );
  });
});
