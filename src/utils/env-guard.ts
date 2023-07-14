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

@Injectable()
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
