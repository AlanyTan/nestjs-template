// https://stackoverflow.com/a/68154675/11670977

import { ConfigModule } from "@nestjs/config";
import configurationDB from "config/configuration-db";

ConfigModule.forRoot({
  isGlobal: true,
  load: [configurationDB],
});

export default configurationDB();
// new ConfigService(new NestConfigService())
