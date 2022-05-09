import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "config";
import { mainConfig } from "main.config";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  mainConfig(app);

  const config = new DocumentBuilder()
    .setTitle("NestJS Example")
    .setDescription("NestJS Example Swagger UI")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("example/docs", app, document);

  const configService = app.get(ConfigService);
  configService.test();
  const { port, host } = configService;
  //the Logger.log("Listening on port "+port) is important to tell dockerserverReadyAction that the service is ready.  This actually not important for the service itself
  await app.listen(port, host, () => Logger.log("Listening on port " + port));
}

bootstrap();
