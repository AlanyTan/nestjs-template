import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const VALID_KEYS = ["lcl", "dev", "qas"];

@Injectable()
export class DevTestGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!isDevTest(this.configService)) {
      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest();
      throw new NotFoundException(`Cannot ${request.method} ${request.url}`);
    }
    return true;
  }
}

export function isDevTest(configService: ConfigService): boolean {
  const envKey = configService.getOrThrow("ENV_KEY");
  return VALID_KEYS.includes(envKey.toLowerCase());
}

export default DevTestGuard;
