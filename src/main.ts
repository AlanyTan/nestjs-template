import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { mainConfig } from "main.config";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  const { host, port } = mainConfig(app);

  await app.listen(port, host);
}

bootstrap();
