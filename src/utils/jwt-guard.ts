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

@Injectable()
export class JwtGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.headers === undefined) {
      throw new HttpException("Unauthorized", 401);
    } else {
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
}
export default JwtGuard;
