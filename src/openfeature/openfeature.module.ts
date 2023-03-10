/* eslint-disable @typescript-eslint/no-unused-vars */
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { OpenFeature } from "@openfeature/js-sdk";
import { OPENFEATURE_CLIENT } from "openfeature";
import { OpenFeatureEnvProvider } from "./js-env-provider";
import { OpenFeatureLaunchDarklyProvider } from "./js-launchdarkly-provider";

@Global()
@Module({
  imports: [ConfigModule, OpenFeatureEnvProvider],
  providers: [
    OpenFeatureEnvProvider,
    {
      provide: OPENFEATURE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        switch (
          configService.get<string>("OPENFEATURE_PROVIDER")?.split(":")[0]
        ) {
          case "env":
          case "ENV":
            OpenFeature.setProvider(new OpenFeatureEnvProvider());
            break;
          case "LD":
          case "ld":
          case "launchdarkly":
          case "LaunchDarkly":
            const LD_KEY = configService
              .get<string>("OPENFEATURE_PROVIDER")
              ?.split(":")[1];
            if (!LD_KEY) {
              throw new Error("LaunchDarkly key not provided");
            } else {
              try {
                OpenFeature.setProvider(
                  new OpenFeatureLaunchDarklyProvider(LD_KEY)
                );
              } catch (e) {
                throw new Error("fatal error:" + e);
              }
            }
            break;
          default:
            throw new Error(
              "OpenFeature provider value invalid:" +
                configService.get<string>("OPENFEATURE_PROVIDER")
            );
        }
        const client = OpenFeature.getClient("app");
        return client;
      },
    },
  ],
  exports: [OPENFEATURE_CLIENT, OpenFeatureEnvProvider],
})
export class OpenFeatureModule {}
