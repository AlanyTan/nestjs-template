import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { mainConfig } from "main.config";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);
  const { port } = mainConfig(app);

  await app.listen(port, "0.0.0.0");
  logger.log(`Service is running at URL: ${await app.getUrl()}`);
}

bootstrap();
