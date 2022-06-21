import {
  INestApplication,
  ValidationPipe,
  RequestMethod,
} from "@nestjs/common";
import { ConfigService } from "config";

export function mainConfig(app: INestApplication): ConfigService {
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix("example", {
    exclude: [{ path: "health", method: RequestMethod.GET }],
  });
  const configService = app.get(ConfigService);
  configService.test();
  return configService;
}
