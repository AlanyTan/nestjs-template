import {
  INestApplication,
  ValidationPipe,
  RequestMethod,
} from "@nestjs/common";

export function mainConfig(app: INestApplication): void {
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix("example", {
    exclude: [{ path: "health", method: RequestMethod.GET }],
  });
}
