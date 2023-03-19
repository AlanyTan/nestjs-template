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
import { Client } from "@openfeature/js-sdk";
import { OPENFEATURE_CLIENT } from "config";

function OpenFeatureGuard(featureFlagName: string): Type<CanActivate> {
  @Injectable()
  class Guard implements CanActivate {
    constructor(@Inject(OPENFEATURE_CLIENT) private openFeature: Client) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const newEndPointFeatureFlag = await this.openFeature.getBooleanValue(
        featureFlagName,
        false
      );
      if (newEndPointFeatureFlag) {
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
export default OpenFeatureGuard;
