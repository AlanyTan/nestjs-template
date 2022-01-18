import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "config";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("NestJS Example")
    .setDescription("NestJS Example Swagger UI")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("", app, document);

  const { port, host } = app.get(ConfigService);
  //the Logger.log("Listening on port "+port) is important to tell dockerserverReadyAction that the service is ready.  This actually not important for the service itself

  await app.listen(port, host, () => Logger.log("Listening on port " + port));
}

bootstrap();
