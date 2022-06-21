// https://stackoverflow.com/a/68154675/11670977

// import { ConfigService as NestConfigService } from "@nestjs/config";
import {
  // ConfigService,
  dbConfig,
} from "config";

export default dbConfig();
// new ConfigService(new NestConfigService())
