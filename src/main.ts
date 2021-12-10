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
  await app.listen(port, host, () => console.log("Listening on port ", port));
}

bootstrap();
