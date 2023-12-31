// https://stackoverflow.com/a/68154675/11670977

import { getDataSourceName } from "@nestjs/typeorm";
import { DataSource, DataSourceOptions } from "typeorm";
import { dbConfig } from "./src/config";
console.log(JSON.stringify(dbConfig()));

const datasource = new DataSource({
  name: "default",
  ...dbConfig(),
} as DataSourceOptions);

export default (async (): Promise<DataSource> => {
  return getDataSourceName(dbConfig() as DataSourceOptions) === "default" ? datasource : await datasource.initialize();
})();
