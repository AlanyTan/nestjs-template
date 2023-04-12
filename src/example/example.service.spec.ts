// Unit test of services, are often done in .service.spec.ts files
// Try to test the logic of the service.ts as independent as possible
// often, you will need to mock the dependencies so that what you are testing is not affected by the dependencies
// in this example, we are mocking the openfeature_client, I use mock implementation to return a true or false and then test the service
// using the mocked value, so I can make sure "when the feature flag is on, my service shows the new behavior, when the feature flag is off, my service shows the old behavior"
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { openfeature_client } from "@acertaanalyticssolutions/acerta-standardnpm/dist/openfeature";
import { ExampleService } from "./example.service";

jest.mock(
  "@acertaanalyticssolutions/acerta-standardnpm/dist/openfeature",
  () => {
    return {
      openfeature_client: jest.fn().mockImplementation(() => {
        return {
          getBooleanValue: jest.fn().mockResolvedValue(false),
        };
      }),
    };
  }
);

describe("ExampleService", () => {
  const configService = new ConfigService();
  const logger = new Logger();
  const service = new ExampleService(configService, logger, {
    client: { getBooleanValue: jest.fn().mockResolvedValue(true) },
  } as unknown as openfeature_client);
  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should respond to newFeature1 func call", () => {
    expect(service.newFeature1).toBe("the Value of New Feature 1");
  });

  it("should respond to newFeature2 func call", () => {
    expect(service.newFeature2).toBe("the Value of New Feature 2!");
  });

  it("getExample func call return New Feature if new-feature-flag=true", async () => {
    expect(await service.getExample()).toContain(
      "Hello World from <New Feature>"
    );
  });

  const serviceFeatureFlagOff = new ExampleService(
    configService,
    new Logger(),
    {
      client: { getBooleanValue: jest.fn().mockResolvedValue(false) },
    } as unknown as openfeature_client
  );
  it("getExample func call return Orignal Feature if new-feature-flag=false", async () => {
    expect(await serviceFeatureFlagOff.getExample()).toContain(
      "Hello World from <the Original feature>"
    );
  });
});
