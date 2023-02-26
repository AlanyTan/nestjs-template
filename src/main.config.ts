import {
  INestApplication,
  ValidationPipe,
  RequestMethod,
  VersioningType,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

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
  //Check all defined configs can return valid values, if not throw error
  //configService.checkAllDefinedConfigs();

  return configService;
}

// this file allows the e2e test to run without the main module but still is configured as close as possible to the main module
