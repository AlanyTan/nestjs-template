import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
  VersioningType,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

//we use pino logger here.  once it's set up here and in app.module.ts, we can use it in any other file by using the standard nestjs Logger
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";

export function mainConfig(app: INestApplication): {
  host: string;
  port: number;
} {
  const configService = app.get(ConfigService);

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  if (typeof configService.get<string>("SERVICE_PREFIX") === "string") {
    app.setGlobalPrefix(configService.get<string>("SERVICE_PREFIX") || "", {
      exclude: [
        { path: "health", method: RequestMethod.GET },
        { path: "version", method: RequestMethod.GET },
        { path: "metrics", method: RequestMethod.GET },
        { path: "config", method: RequestMethod.GET },
      ],
    });
  }
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });
  if (configService.get<boolean>("SWAGGER_ON")) {
    // can we log Swagger usage???
    const config = new DocumentBuilder()
      .setTitle(configService.get<string>("title") || "No Title")
      .setDescription(
        configService.get<string>("description") || "No description"
      )
      .setVersion(configService.get<string>("version") || "0.0.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          name: "JWT",
          description: "Enter JWT token",
          in: "header",
        },
        "JWT-auth"
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(
      `${configService.get<string>("SERVICE_PREFIX") || ""}/docs`,
      app,
      document
    );
  }

  return {
    host: configService.get<string>("HOST") || "",
    port: configService.get<number>("PORT") || 0,
  };
}

// this file allows the e2e test to run without the main module but still is configured as close as the main module
