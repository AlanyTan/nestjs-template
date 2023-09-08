import { ExecutionContext } from "@nestjs/common";
jest.resetModules();
import { ConfigService } from "@nestjs/config";
import { JwtGuard } from "./jwt-guard";

let mockVerifyAadJwt = jest.fn();

jest.mock("@acertaanalyticssolutions/acerta-standardnpm", () => {
  return {
    AadJwtValidator: jest.fn().mockImplementation(() => {
      return { validateAadJwt: mockVerifyAadJwt };
    }),
  };
});

describe("JwtGuard", () => {
  it("should be defined", () => {
    expect(JwtGuard).toBeDefined();
  });
  test("should return 401 if no header is provided", async () => {
    // here we mock the imported validateAadJwt function to return true,
    //(validateAadJwt as jest.MockedFunction<typeof validateAadJwt>).mockResolvedValue(false);
    //jest.spyOn(AcertaStandardNpm, 'validateAadJwt').mockResolvedValue(false);
    // and we build a fake ExecutionContext object to pass to the canActivate function

    await expect(
      new JwtGuard(new ConfigService()).canActivate({
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: (): unknown => "" }),
      } as unknown as ExecutionContext),
    ).rejects.toThrowError("Unauthorized");
  });
  test("should return 401 if jwt is invalid", async () => {
    const newJwtGuard = new JwtGuard(new ConfigService());

    // here we mock the imported validateAadJwt function to return true,
    mockVerifyAadJwt = jest.fn().mockResolvedValue(false);
    expect(
      async () =>
        await newJwtGuard.canActivate({
          getClass: () => ({}),
          switchToHttp: () => ({
            getRequest: (): unknown => ({ headers: {} }),
          }),
        } as unknown as ExecutionContext),
    ).rejects.toThrowError("Unauthorized, HttpException: Unauthorized");
  });
  it("should return true if jwt is valid", async () => {
    const newJwtGuard = new JwtGuard(new ConfigService());
    // here we mock the imported validateAadJwt function to return true,
    // and we build a fake ExecutionContext object to pass to the canActivate function
    mockVerifyAadJwt = jest.fn().mockResolvedValue(true);
    expect(
      await newJwtGuard.canActivate({
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: (): unknown => ({ headers: {} }) }),
      } as unknown as ExecutionContext),
    ).toBe(true);
  });
});
