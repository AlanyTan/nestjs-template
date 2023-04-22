// https://stackoverflow.com/a/68154675/11670977

import { DataSource, DataSourceOptions } from "typeorm";
import { dbConfig } from "./src/config";
console.log(JSON.stringify(dbConfig()));

export const datasource = new DataSource(dbConfig() as DataSourceOptions);
datasource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.log("Data Source has not been initialized!" + err);
  });
