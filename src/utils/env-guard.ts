/* eslint-disable @typescript-eslint/no-unused-vars */

import { CanActivate, ExecutionContext, Inject, Injectable, mixin, NotFoundException, Type } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
/**
 * controller route guard to hide non-productive end-points
 * routes or contollers with this guard configured, will not be availalbe when running in system where
 *  $ENV_KEY is not in the ${validKeys} array, which currently are ["lcl","dev","qas"]
 */
export class EnvGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {
    this.validKeys = ["lcl", "dev", "qas"];
  }
  private validKeys: string[];
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const envKey = await this.configService.get("ENV_KEY");
    if (this.validKeys.includes(envKey.toLowerCase())) {
      return true;
    } else {
      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest();
      throw new NotFoundException(`Cannot ${request.method} ${request.url}`);
    }
  }
}

export default EnvGuard;
