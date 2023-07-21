/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpService } from "@nestjs/axios";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class forwardHeaderAuthInterceptor implements NestInterceptor {
  constructor(private httpService: HttpService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // ** if you use normal HTTP module **
    const ctx = context.switchToHttp();
    const token = ctx.getRequest().headers["authorization"];

    if (token) {
      this.httpService.axiosRef.defaults.headers.common["authorization"] = token;
    }
    return next.handle().pipe();
  }
}
export {};
