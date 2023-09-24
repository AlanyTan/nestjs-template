/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GrpcMethod, GrpcOptions, Transport } from "@nestjs/microservices";
import { Metadata, ServerUnaryCall } from "@grpc/grpc-js";
import { ExampleService } from "./example.service";

type ExampleById = { id: number };

@Controller()
export class ExampleGrcController {
  constructor(
    private readonly configService: ConfigService,
    private readonly exampleService: ExampleService,
  ) {}

  @GrpcMethod("ExampleService", "GetExample") // in the .proto definition, use CapitalCase of the Class and Method
  findOneExample(
    data: ExampleById,
    metadata: Metadata,
    call: ServerUnaryCall<unknown, unknown>,
  ): { id: number; name: string } | undefined {
    switch (data.id) {
      case 1:
        return { id: 1, name: `${this.exampleService.newFeature1}` };
      case 2:
        return { id: 2, name: `${this.exampleService.newFeature2}` };
      default:
        return { id: data.id, name: "not found" };
    }
  }

  @GrpcMethod("ExampleService") // in the .proto definition, use CapitalCase of the Class and Method
  getExampleMore(
    data: ExampleById,
    metadata: Metadata,
    call: ServerUnaryCall<unknown, unknown>,
  ): { id: number; name: string } | undefined {
    return { id: -1, name: `${this.exampleService.getExample()}` };
  }
}

// Configuration for the gRPC microservice - this can be imported into main.ts and used to connect Microservices
const extractConfiguration = new ConfigService();
export const exampleGrpcOptions = {
  transport: Transport.GRPC,
  options: {
    url: `${extractConfiguration.get("LINEPULSE_SVC_HOSTNAME", "0.0.0.0")}:50051`, // Set your gRPC server address
    package: "example", // Adjust as needed
    protoPath: "src/example/example.proto", // Path to your proto file
  },
} as GrpcOptions;
