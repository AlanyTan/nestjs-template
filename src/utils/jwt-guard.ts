/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  mixin,
  Type,
} from "@nestjs/common";
import { validateAadJwt } from "@AcertaAnalyticsSolutions/acerta-standardnpm";

function JwtGuard(): Type<CanActivate> {
  @Injectable()
  class Guard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const jwtIsValid = await validateAadJwt(request);

      if (jwtIsValid) {
        return true;
      } else {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        throw new HttpException("Unauthorized", 401);
      }
    }
  }
  return mixin(Guard);
}
export default JwtGuard;
