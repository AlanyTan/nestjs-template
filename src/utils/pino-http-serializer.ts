import { ConfigService } from "@nestjs/config";
import { PinoLogger } from "nestjs-pino";

type PinoRawRequest = {
  headers: {
    "x-correlation-id": string;
  };
  id: string;
  method: string;
  params: object;
  query: object;
  remoteAddress: string;
  remotePort: number;
  url: string;
  "x-correlation-id": string;
};

type BaseCustomSerializerProperties = {
  id: string;
  methodUrl: string;
  "x-correlation-id": string;
};

type CustomSerializerProperties = BaseCustomSerializerProperties & {
  params?: object;
  query?: object;
  remoteAddressPort?: string;
};

let appModuleLogLevel: string;
export function setAppModuleLogLevel(logLevel: string): void {
  PinoLogger.root.level = logLevel;
  appModuleLogLevel = logLevel;
}

export function getPinoHttpSerializer(configService: ConfigService): {
  req: (req: PinoRawRequest) => CustomSerializerProperties;
} {
  appModuleLogLevel = configService.getOrThrow("LOG_LEVEL");
  return {
    req: (req: PinoRawRequest): CustomSerializerProperties => {
      const properties: CustomSerializerProperties = getBasePinoHttpSerializerProperties(req);
      if (appModuleLogLevel === "debug" || appModuleLogLevel === "trace") {
        properties.query = req.query;
        properties.params = req.params;
        properties.remoteAddressPort = req.remoteAddress + ":" + req.remotePort;
      }
      return properties;
    },
  };
}

function getBasePinoHttpSerializerProperties(req: PinoRawRequest): BaseCustomSerializerProperties {
  return {
    id: req.id,
    methodUrl: req.method + " " + req.url,
    "x-correlation-id": req.headers["x-correlation-id"] || req["x-correlation-id"],
  };
}
