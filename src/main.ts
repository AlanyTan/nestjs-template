import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";
import { mainConfig } from "main.config";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const { port, host } = mainConfig(app);

  const config = new DocumentBuilder()
    .setTitle("Acerta NestJS Boilerplate")
    .setDescription(
      "Acerta Node.js Boiler Plate Repo based on NestJS Example Swagger UI"
    )
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("example/docs", app, document);

  await app.listen(port, host);
}

bootstrap();
