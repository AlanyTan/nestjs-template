/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  mixin,
  NotFoundException,
  Type,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export function EnvGuard(incomingValidKeys?: string[]): Type<CanActivate> {
  @Injectable()
  class Guard implements CanActivate {
    constructor(@Inject() private configService: ConfigService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const validKeys = incomingValidKeys || ["lcl", "dev", "qas"];
      const envKey = await this.configService.get("ENV_KEY", "prd");
      if (validKeys.includes(envKey)) {
        return true;
      } else {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        throw new NotFoundException(`Cannot ${request.method} ${request.url}`);
      }
    }
  }
  return mixin(Guard);
}
export default EnvGuard;
