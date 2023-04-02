import { ExecutionContext } from "@nestjs/common";
jest.resetModules();
import { validateAadJwt } from "@AcertaAnalyticsSolutions/acerta-standardnpm";
import * as AcertaStandardNpm from "@AcertaAnalyticsSolutions/acerta-standardnpm";
import { JwtGuard } from "./jwt-guard";

jest.mock("@AcertaAnalyticsSolutions/acerta-standardnpm", () => {
  return {
    validateAadJwt: jest.fn(),
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
      new JwtGuard().canActivate({
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: (): unknown => "" }),
      } as unknown as ExecutionContext)
    ).rejects.toThrowError("Unauthorized");
  });
  test("should return 401 if jwt is invalid", async () => {
    // here we mock the imported validateAadJwt function to return true,
    //(validateAadJwt as jest.MockedFunction<typeof validateAadJwt>).mockResolvedValue(false);
    jest.spyOn(AcertaStandardNpm, "validateAadJwt").mockResolvedValue(false);
    // and we build a fake ExecutionContext object to pass to the canActivate function

    await expect(
      new JwtGuard().canActivate({
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: (): unknown => ({ headers: {} }) }),
      } as unknown as ExecutionContext)
    ).rejects.toThrowError("Unauthorized");
  });
  it("should return true if jwt is valid", async () => {
    const newJwtGuard = new JwtGuard();
    // here we mock the imported validateAadJwt function to return true,
    (
      validateAadJwt as jest.MockedFunction<typeof validateAadJwt>
    ).mockResolvedValue(true);
    // and we build a fake ExecutionContext object to pass to the canActivate function
    expect(
      await newJwtGuard.canActivate({
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: (): unknown => ({ headers: {} }) }),
      } as unknown as ExecutionContext)
    ).toBe(true);
  });
});
