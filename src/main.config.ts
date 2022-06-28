import {
  INestApplication,
  ValidationPipe,
  RequestMethod,
  VersioningType,
} from "@nestjs/common";
import { ConfigService } from "config";

export function mainConfig(app: INestApplication): ConfigService {
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix("example", {
    exclude: [{ path: "health", method: RequestMethod.GET }],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  const configService = app.get(ConfigService);
  configService.test();
  return configService;
}
