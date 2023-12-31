import { INestApplication, Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

//we use pino logger here.  once it's set up here and in app.module.ts, we can use it in any other file by using the standard nestjs Logger
import { LoggerErrorInterceptor } from "nestjs-pino";
import { isDevTest } from "utils";

export function mainConfig(app: INestApplication): {
  port: number;
} {
  const configService = app.get(ConfigService);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  const servicePrefix = configService.get("SERVICE_PREFIX");
  if (servicePrefix) {
    app.setGlobalPrefix(
      servicePrefix,
      // , {
      //   exclude: [
      //     { path: "health", method: RequestMethod.GET },
      //     { path: "version", method: RequestMethod.GET },
      //     { path: "metrics", method: RequestMethod.GET },
      //     { path: "config", method: RequestMethod.GET },
      //   ],
      // }
    );
  }
  app.enableShutdownHooks();
  app.enableVersioning();
  if (isDevTest(configService)) {
    configureSwagger(app, configService);
  }

  return {
    port: configService.getOrThrow("LINEPULSE_SVC_PORT"),
  };
}

function configureSwagger(app: INestApplication, configService: ConfigService<unknown, boolean>): void {
  const config = new DocumentBuilder()
    .setTitle(configService.getOrThrow("title"))
    .setDescription(configService.getOrThrow("description"))
    .setVersion(configService.getOrThrow("version"))
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Bearer JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const path = `${configService.get("SERVICE_PREFIX", "")}/docs`;
  app.get(Logger).log(`Swagger configured - route: ${path}`);
  SwaggerModule.setup(path, app, document);
}

// this file allows the svc test to run without the main module but still is configured as close as the main module
