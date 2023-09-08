import { HttpService } from "@nestjs/axios";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Scope } from "@nestjs/common";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { Observable, from } from "rxjs";
import { tap, mergeMap } from "rxjs/operators";
import { v4 as uuidv4 } from "uuid";

@Injectable({ scope: Scope.REQUEST })
/**
 * This interceptor is used to forward headers from the incoming request to the outgoing request.
 * It also generates a correlation ID if one is not present in the incoming request.
 * The correlation ID is used to track a request across multiple services.
 * It requires the HttpService to be added as a Request Scoped Provider in the module where it is used.
 * And the services that uses httpService, shoul inject the "REQUEST_SCOPED_HTTP_SERVICE" instead of the standard HttpService.
 * This is to ensure each request have their own HttpService instance.
 */
export class ForwardHeadersInterceptor implements NestInterceptor {
  constructor(private moduleRef: ModuleRef) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const contextRequest = context.switchToHttp().getRequest();
    const contextId = ContextIdFactory.getByRequest(contextRequest);

    return from(this.moduleRef.resolve("REQUEST_SCOPED_HTTP_SERVICE", contextId)).pipe(
      mergeMap((httpService: HttpService) => {
        const token = contextRequest.headers["authorization"];
        // Extract or generate the correlation ID
        const correlationId = contextRequest.headers["x-correlation-id"] || uuidv4();
        httpService.axiosRef.defaults.headers.common["X-Correlation-ID"] = correlationId;
        contextRequest["x-correlation-id"] = correlationId;
        const contextResponse = context.switchToHttp().getResponse();
        contextResponse.setHeader("X-Correlation-ID", correlationId);

        if (token) {
          httpService.axiosRef.defaults.headers.common["authorization"] = token;
        }
        return next.handle().pipe(
          tap(() => {
            // //You can add additional logic after the request is made
            // //i.e. to reset the default headers after the request, if necessary (but request scoped axios service will automatically garbage collect after the request is finished)
            // delete this.httpService.axiosRef.defaults.headers.common["Authorization"];
            // delete this.httpService.axiosRef.defaults.headers.common["X-Correlation-ID"];
          }),
        );
      }),
    );
  }
}
export {};
