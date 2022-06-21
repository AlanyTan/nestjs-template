import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CustomHeaders = createParamDecorator(
  (property: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return property ? request.headers[property.toLowerCase()] : request.headers;
  }
);
