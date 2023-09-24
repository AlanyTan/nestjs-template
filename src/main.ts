import { NestFactory } from "@nestjs/core";
import { GrpcOptions, MicroserviceOptions } from "@nestjs/microservices";
import { Logger } from "nestjs-pino";
import { exampleGrpcOptions } from "example/example-grpc.controller";
import { mainConfig } from "main.config";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);
  const { port } = mainConfig(app);

  await app.listen(port);
  logger.log(`Service is running at URL: ${await app.getUrl()}`);

  // Configuration for the gRPC microservice
  app.connectMicroservice<MicroserviceOptions>(exampleGrpcOptions as GrpcOptions);

  app.startAllMicroservices();
}

bootstrap();
