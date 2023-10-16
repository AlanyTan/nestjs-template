import { CanActivate, ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AadJwtValidator } from "@acertaanalyticssolutions/acerta-standardnpm";

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.configService.getOrThrow<string>("ENV_KEY") === "lcl") {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    if (request.headers === undefined) {
      throw new HttpException("Unauthorized", 401);
    } else {
      return this.checkAzureActiveDirectoryJwt(request);
    }
  }

  private async checkAzureActiveDirectoryJwt(request: Request): Promise<boolean> {
    try {
      const aadJwtValidator = new AadJwtValidator(
        this.configService.getOrThrow("AAD_TENANT_ID"),
        this.configService.getOrThrow("AAD_CLIENT_ID"),
      );
      const jwtIsValid = await aadJwtValidator.validateAadJwt(request);
      if (jwtIsValid) {
        return true;
      } else {
        throw new HttpException("Unauthorized", 401);
      }
    } catch (error) {
      throw new HttpException(`Unauthorized, ${error}`, 401);
    }
  }
}
export default JwtGuard;
