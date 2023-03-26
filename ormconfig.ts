// https://stackoverflow.com/a/68154675/11670977

import { ConfigModule } from "@nestjs/config";
import { dbConfig } from "config";

ConfigModule.forRoot({
  isGlobal: true,
  load: [dbConfig],
});

export default dbConfig();
// new ConfigService(new NestConfigService())
