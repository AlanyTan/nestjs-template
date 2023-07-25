/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpService } from "@nestjs/axios";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class ForwardHeadersInterceptor implements NestInterceptor {
  constructor(private readonly httpService: HttpService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const contextRequest = context.switchToHttp().getRequest();
    const token = contextRequest.headers["authorization"];
    // Extract or generate the correlation ID
    const correlationId = contextRequest.headers["x-correlation-id"] || uuidv4();
    contextRequest["x-correlation-id"] = correlationId;
    const contextResponse = context.switchToHttp().getResponse();
    contextResponse.setHeader("X-Correlation-ID", correlationId);
    this.httpService.axiosRef.defaults.headers.common["X-Correlation-ID"] = correlationId;
    if (token) {
      this.httpService.axiosRef.defaults.headers.common["authorization"] = token;
    }
    return next.handle().pipe(
      tap(() => {
        // You can add additional logic after the request is made
        // Remember to reset the default headers after the request, if necessary
        delete this.httpService.axiosRef.defaults.headers.common["Authorization"];
        delete this.httpService.axiosRef.defaults.headers.common["X-Correlation-ID"];
      })
    );
  }
}
export {};
